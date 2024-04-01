interface BasePoll {
    type: 'shortAnswer' | 'multipleChoice' | 'attendance';
    question: string;
    answers: string[];
}

interface ShortAnswerPoll extends BasePoll {
    type: 'short';
}

interface MultipleChoicePoll extends BasePoll {
    type: 'mc';
    options: {
        letter: string;
        option: string;
    }[];
}

interface OrderingPoll extends BasePoll {
    type: 'ordering';
    orders: {
        number: string;
        option: string;
    }[];
}

interface Attendance extends BasePoll {
    type: 'attendance';
    attended: string[];
}

type PollValidation = ShortAnswerPoll | MultipleChoicePoll | Attendance;
