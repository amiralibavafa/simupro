// tests/api.test.js
// Simple API endpoint sanity checks
// Run with: node tests/api.test.js (with server running)

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5005";

async function testEndpoint(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("Running API sanity checks...\n");
  const results = [];

  // Test 1: Mock status endpoint exists
  results.push(
    await testEndpoint("GET /mock/status returns JSON", async () => {
      const res = await fetch(`${BASE_URL}/mock/status`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (typeof data.ready !== "boolean") {
        throw new Error("Missing 'ready' field");
      }
    })
  );

  // Test 2: Interview answer endpoint validation
  results.push(
    await testEndpoint(
      "POST /api/interview/answer requires sessionId",
      async () => {
        const res = await fetch(`${BASE_URL}/api/interview/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.status !== 400) {
          throw new Error(`Expected 400, got ${res.status}`);
        }
      }
    )
  );

  // Test 3: Interview answer endpoint saves valid request
  results.push(
    await testEndpoint(
      "POST /api/interview/answer saves valid data",
      async () => {
        const res = await fetch(`${BASE_URL}/api/interview/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "test_session_api",
            questionId: "test_q_1",
            transcript: "This is a test answer.",
          }),
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.saved !== true) {
          throw new Error("Should return saved: true");
        }
      }
    )
  );

  // Test 4: Session retrieval
  results.push(
    await testEndpoint(
      "GET /api/interview/session/:id returns session data",
      async () => {
        const res = await fetch(
          `${BASE_URL}/api/interview/session/test_session_api`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.answers || !Array.isArray(data.answers)) {
          throw new Error("Should return answers array");
        }
      }
    )
  );

  // Test 5: Empty session returns empty answers
  results.push(
    await testEndpoint(
      "GET /api/interview/session/:id returns empty for new session",
      async () => {
        const res = await fetch(
          `${BASE_URL}/api/interview/session/nonexistent_session_xyz`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.answers) || data.answers.length !== 0) {
          throw new Error("Should return empty answers array");
        }
      }
    )
  );

  // Test 6: Analyze endpoint requires sessionId
  results.push(
    await testEndpoint(
      "POST /api/interview/analyze requires sessionId",
      async () => {
        const res = await fetch(`${BASE_URL}/api/interview/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: "Test job" }),
        });
        if (res.status !== 400) {
          throw new Error(`Expected 400, got ${res.status}`);
        }
      }
    )
  );

  // Test 7: Analyze endpoint requires jobDescription
  results.push(
    await testEndpoint(
      "POST /api/interview/analyze requires jobDescription",
      async () => {
        const res = await fetch(`${BASE_URL}/api/interview/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: "test123" }),
        });
        if (res.status !== 400) {
          throw new Error(`Expected 400, got ${res.status}`);
        }
      }
    )
  );

  // Test 8: Get analysis returns not analyzed for new session
  results.push(
    await testEndpoint(
      "GET /api/interview/analyze/:id returns not analyzed for new session",
      async () => {
        const res = await fetch(
          `${BASE_URL}/api/interview/analyze/nonexistent_xyz`
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.analyzed !== false) {
          throw new Error("Should return analyzed: false");
        }
      }
    )
  );

  // Summary
  console.log("\n-------------------");
  const passed = results.filter((r) => r).length;
  console.log(`Results: ${passed}/${results.length} tests passed`);

  if (passed === results.length) {
    console.log("All tests passed!");
    process.exit(0);
  } else {
    console.log("Some tests failed.");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
