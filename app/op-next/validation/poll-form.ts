interface BasePoll {
    type: 'short' | 'mc' | "ordering";
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
    options: {
        number: string;
        option: string;
    }[];
}

type PollValidation = ShortAnswerPoll | MultipleChoicePoll;
