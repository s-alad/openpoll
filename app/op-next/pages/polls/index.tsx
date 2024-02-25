import React, { useState } from 'react';
import Navbar from '@/components/navbar';

type PollOption = {
  optionText: string;
};

type Poll = {
  questionText: string;
  options: PollOption[];
  answer: string;
};

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [currentOptions, setCurrentOptions] = useState<PollOption[]>([]);
  const [optionText, setOptionText] = useState('');
  const [answer, setAnswer] = useState(''); // State to hold the correct answer

  const addPoll = () => {
    if (questionText && currentOptions.length > 0 && answer) {
      const newPoll: Poll = {
        questionText,
        options: currentOptions,
        answer,
      };
      setPolls(prevPolls => [...prevPolls, newPoll]);
      setQuestionText('');
      setCurrentOptions([]);
      setOptionText('');
      setAnswer('');
    }
  };

  const handleAddOption = () => {
    if (optionText) {
      setCurrentOptions(prevOptions => [
        ...prevOptions,
        { optionText },
      ]);
      setOptionText('');
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <h1>Teacher Inputs Multiple Choice Questions</h1>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
        />
        {/* Input fields for adding options */}
        <div>
          {currentOptions.map((option, index) => (
            <div key={index}>{option.optionText}</div>
          ))}
          <input
            type="text"
            value={optionText}
            onChange={(e) => setOptionText(e.target.value)}
            placeholder="Enter an option"
          />
          <button onClick={handleAddOption}>Add Option</button>
        </div>
        {/* Input for the correct answer */}
        <div>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the correct answer"
          />
        </div>
        <button onClick={addPoll}>Add Multiple Choice Question</button>
      </div>

      <div>
        {/* Displays the poll items for testing */}
        {polls.map((poll, index) => (
          <div key={index}>
            <p>Question: {poll.questionText}</p>
            <p>Correct Answer: {poll.answer}</p> 
            <ul>
              {poll.options.map((option, optionIndex) => (
                <li key={optionIndex}>{option.optionText}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
