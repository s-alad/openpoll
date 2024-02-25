import React, { useState } from 'react';
import Navbar from '@/components/navbar';

type Poll = {
    questionText: string;
    questionType: string;
};

export default function Polls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('short-answer'); // Default type

  const addPoll = () => {
    const newPoll: Poll = { questionText, questionType };
    setPolls([...polls, newPoll]);
    setQuestionText('');
  };

  const handleQuestionTextChange = (event: any) => {
    setQuestionText(event.target.value);
  };

  const handleQuestionTypeChange = (event: any) => {
    setQuestionType(event.target.value);
  };

  return (
    <>
      <Navbar />
      <div> Teacher adding questions </div>
      <div>
        <input
          type="text"
          value={questionText}
          onChange={handleQuestionTextChange}
          placeholder="Enter your question"
        />
        <select value={questionType} onChange={handleQuestionTypeChange}>
          <option value="short-answer">Short Answer</option>
          <option value="paragraph">Paragraph</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
        </select>
        <button onClick={addPoll}>Add Question</button>
      </div>
      <div>
        {polls.map((poll, index) => (
          <div key={index}>
            <p>Question: {poll.questionText}</p>
            <p>Type: {poll.questionType}</p>
          </div>
        ))}
      </div>
    </>
  );
}
