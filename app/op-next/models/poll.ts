interface Poll {
    classid: string;
    question: string;
    options: {
        letter: string;
        option: string;
    }[]
    answers: string[];
    created: any;
    active: boolean;
}

export default Poll;