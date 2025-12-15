import { useState } from 'react';
import StartButton from '../startButton/startButton.jsx';
import StartTimer from '../startTimer/startTimer.jsx';
import Interview from '../InterviewSpace/Interview.jsx';
import Loading from '../Loading/Loading.jsx';

import './mockInterview.css';

function MockInterview() {
  const [stage, setStage] = useState('start');
  const [finalAsnswers, setFinalAnswers] = useState("");

  return (
    <div className='body'>
        {stage === 'start' && <StartButton onStart={() => setStage('timer')}/>}
        {stage === 'timer' && <StartTimer onFinish={() => setStage('interview')} />}
        {stage === 'interview' && <Interview onComplete={(answers) => {
         setFinalAnswers(answers);
         setStage('loading');
        }} />}
        {stage === 'loading' && <Loading />}
    </div>
  );
}

export default MockInterview;
