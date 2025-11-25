import './App.css';
import { useEffect } from 'react';
import MockInterview from './components/mockInterview/mockInterview';

function App() {
  useEffect(() => {
    document.title = "Virtual Interview - SimuPro"
  }, []);

  
  return (
    <div className="App">
      <div className='header'>

      </div>
      <div className='virtualSpace'>
        <MockInterview/>
      </div> 
    </div>
  );
}

export default App;