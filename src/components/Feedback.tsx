import { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

interface FeedbackProps {
    messageId: number;
    onFeedback: (messageId: number, isHelpful: boolean) => void;
    language: string;
}

const Feedback: React.FC<FeedbackProps> = ({
    messageId,
    onFeedback,
    language,
}) => {
    const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
    const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

    const handleFeedback = (isHelpful: boolean) => {
        if (!hasGivenFeedback) {
            setFeedback(isHelpful ? 'yes' : 'no');
            setHasGivenFeedback(true);
            onFeedback(messageId, isHelpful);
        }
    };

    if (hasGivenFeedback) {
        return (
            <div className='text-xs text-gray-500 mt-1'>
                {feedback === 'yes' ? '👍' : '👎'} Thank you for your feedback!
            </div>
        );
    }

    return (
        <div className='flex items-center gap-2 mt-1'>
            <span className='text-xs text-gray-500'>Was this helpful?</span>
            <button
                onClick={() => handleFeedback(true)}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'>
                <FaThumbsUp className='w-3 h-3 text-gray-500 hover:text-green-500' />
            </button>
            <button
                onClick={() => handleFeedback(false)}
                className='p-1 hover:bg-gray-100 rounded-full transition-colors'>
                <FaThumbsDown className='w-3 h-3 text-gray-500 hover:text-red-500' />
            </button>
        </div>
    );
};

export default Feedback;
