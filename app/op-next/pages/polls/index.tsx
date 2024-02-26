import React, { useState } from 'react';
import Navbar from '@/components/navbar';
import styles from '@/styles/Polls.module.css';

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
{/*         <Navbar /> */}
        <div className={styles.container}>
            <h1>Teacher Inputs Multiple Choice Questions</h1>
            <input
            className={styles.questionInput}
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question"
            />
            <div className={styles.optionsContainer}>
            
            <input
                className={styles.questionInput}
                type="text"
                value={optionText}
                onChange={(e) => setOptionText(e.target.value)}
                placeholder="Enter an option"
            />
            {currentOptions.map((option, index) => (
                <div key={index} className={styles.optionItem}>
                <label className={styles.optionLabel}>{option.optionText}</label>
                <input type="checkbox" className={styles.optionCheckbox} id={`option_${index}`} />
                </div>
            ))}
            <button className={styles.addButton} onClick={handleAddOption}>Add Option</button>
            </div>
            <div className={styles.optionsContainer}>
                <input 
                    className={styles.questionInput}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter the correct answer"
                />
            </div>

            <button className={styles.saveButton} onClick={addPoll}>Save</button>
        </div>

        {/* Displays list of polls created for testing */}
        <div className={styles.pollList}>
        {polls.map((poll, index) => (
          <div key={index} className={styles.pollItem}>
            <p>Question: {poll.questionText}</p>
            <p>Options:</p>
            <ul className={styles.pollOptions}>
              {poll.options.map((option, optionIndex) => (
                <li key={optionIndex} className={styles.pollOption}>
                  {option.optionText}
                </li>
              ))}
            </ul>
            <p>Correct Answer: {poll.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}
