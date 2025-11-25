import './startButton.css'
import '../styles/animation.css';
import { useState } from 'react';

function StartButton({ onStart }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleClick = () => {
    setFadeOut(true); // start fade-out
  };

  const handleAnimationEnd = () => {
    if (fadeOut) {
      onStart(); // call parent only after fade-out completes
    }
  };

  return (
    <div
      className={`startBox animate__animated ${
        fadeOut ? 'animate__fadeOutDown' : 'animate__fadeInDown'
      }`}
      onAnimationEnd={handleAnimationEnd} // listens for animation completion
    >
      <h1 className='welcomeTitle'>Ready for our interview?</h1>
      <p>Click start to take the mock.</p>
      <button className='button' onClick={handleClick}>
        Start
      </button>
    </div>
  );
}

export default StartButton;
