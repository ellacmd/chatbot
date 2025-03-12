import './App.css';
import { BsFillChatHeartFill } from 'react-icons/bs';
import { useState } from 'react';
import Chatbot from './components/Chatbot';

function App() {
    const [showChatBot, setShowChatBot] = useState<boolean>(false);


    const closeChatBot = (): void => {
        setShowChatBot(false);
    };

    return (
        <main className='w-[100vw] h-[200vh] bg-[#FCE4EC] relative'>
            {!showChatBot && (
                <button
                    onClick={() => {
                        setShowChatBot(!showChatBot);
                    }}
                    className='fixed bottom-6 right-8 cursor-pointer'>
                    <BsFillChatHeartFill
                        fill='#FF4081'
                        className='w-20 h-20 transition-transform duration-300 hover:scale-110'
                    />
                </button>
            )}
            {showChatBot && (
                <div className='fixed bottom-6 right-8'>
                    <Chatbot closeChatBot={closeChatBot} />
                </div>
            )}
        </main>
    );
}

export default App;
