import React, { FormEvent, useState } from 'react';
import styles from './AnswerPollPage.module.css';

const AnswerPollPage = () => {
    // Dummy data for the poll question
    // Change pollQuestion to match schema of the questions on firebase
    const pollQuestion = {
        question: "Which of the follwing choices is correct?",
        options: ["a", "b", "c", "d", "e"],
        correct: 2
    };

    // State to store the selected option
    const [selectedOption, setSelectedOption] = useState("");

    // Handle the form submission
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        //TODO: save the answer to Firebase
    };

    return (
        <div className={styles.container}>
            <h1>{pollQuestion.question}</h1>
            <form onSubmit={handleSubmit}>
                {pollQuestion.options.map((option, index) => (
                    <div key={index} className={styles.formGroup}>
                        <label className={styles.label}>
                            <input
                                className={styles.radioInput}
                                type="radio"
                                value={option}
                                checked={selectedOption === option}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            />
                            {option}
                        </label>
                    </div>
                ))}
                <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
        </div>
    );
};

export default AnswerPollPage;
