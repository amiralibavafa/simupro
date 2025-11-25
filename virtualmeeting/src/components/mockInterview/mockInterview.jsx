import { useState } from 'react';
import StartButton from '../startButton/startButton.jsx';
import StartTimer from '../startTimer/startTimer.jsx';
import Interview from '../InterviewSpace/Interview.jsx';
import './mockInterview.css';

function MockInterview() {
  const [stage, setStage] = useState('start');

  return (
    <div className='body'>
        {stage === 'start' && <StartButton onStart={() => setStage('timer')}/>}
        {stage === 'timer' && <StartTimer onFinish={() => setStage('interview')} />}
        {stage === 'interview' && <Interview />}
    </div>
  );
}

export default MockInterview;
