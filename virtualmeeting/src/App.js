import './App.css';
import { useEffect } from 'react';
import MockInterview from './components/mockInterview/mockInterview';
import logo from "./main_logo-removebg.png";

function App() {
  useEffect(() => {
    document.title = "Virtual Interview - SimuPro"
  }, []);

  
  return (
    <div className="App">
      <div className='header'>
          <img alt='logo' src={logo} className='mainLogo' />
      </div>
      <div className='virtualSpace'>
        <MockInterview/>
      </div> 
    </div>
  );
}

export default App;