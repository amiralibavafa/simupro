import './startTimer.css';
import { useState , useEffect } from 'react';
import '../styles/animation.css';

function StartTimer({ onFinish }){
    var [count, setCount] = useState(3);
    var [fadeKey, setFadeKey] = useState(0);

    useEffect(()=> {
        if (count > 0){
            const timer = setTimeout(() => {
                setCount(prev => prev - 1);
                setFadeKey(prev => prev + 1);
            }, 1500);
            return ()=> clearTimeout(timer);
        }

        else{
            const goTimer = setTimeout(()=>{
                onFinish();
            }, 1500);
            return ()=> clearTimeout(goTimer);
        }
    }, [count, onFinish]);

    return(<div className="timerBox">
        <h1 key={fadeKey} className='animate__animated animate__fadeIn countDownNumber'>
            {count === 0 ? count = 'Go' : count}
        </h1>
    </div>);
}

export default StartTimer;