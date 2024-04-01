interface BasePoll {
    type: 'shortAnswer' | 'multipleChoice' | 'attendance';
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

interface Attendance extends BasePoll {
    type: 'attendance';
    attended: string[];
}

type PollValidation = ShortAnswerPoll | MultipleChoicePoll | Attendance;
