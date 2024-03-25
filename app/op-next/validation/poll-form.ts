interface BasePoll {
    type: 'shortAnswer' | 'multipleChoice';
    question: string;
}

interface ShortAnswerPoll extends BasePoll {
    type: 'shortAnswer';
    answers?: string;
}

interface MultipleChoicePoll extends BasePoll {
    type: 'multipleChoice';
    options: {
        letter: string;
        option: string;
    }[];
    answers: string[];
}

type PollValidation = ShortAnswerPoll | MultipleChoicePoll;
