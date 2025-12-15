import "./Loading.css";

function Loading() {
  return (
    <div className="loadingWrapper">
      <div className="loadingBox">
        <div className="apple-loader"></div>
        <div className="loading-text">Your mock interview is done</div>
        <div className="sub-text">Evaluating results, sit tight...</div>
      </div>
    </div>
  );
}

export default Loading;
