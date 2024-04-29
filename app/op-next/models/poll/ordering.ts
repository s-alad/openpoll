import Poll, { TPoll } from "../poll";

type OrderAnswerKey = {
    [index: number]: {
        letter: string;
        option: string;
    };
}
type OrderOptions = {
    letter: string; 
    option: string;
}[];
type OrderResponseStructure = {
    [key: number]: { letter: string; option: string; };
};
type OrderResponses = {
    [userid: string]: {
        correct: boolean;
        email: string;
        response: {
            [index: number]: {
                letter: string;
                option: string;
            };
        }
    }
}

export default class OrderPoll extends Poll {
    answerkey: OrderAnswerKey
    options: OrderOptions
    responses: OrderResponses
    

    constructor(
        active: boolean,
        classid: string,
        createdat: any,
        creator: string,
        done: boolean,
        question: string,
        answerkey: OrderAnswerKey,
        options: OrderOptions,
        responses: OrderResponses,
        endedat?: any,
    ) {
        super("order", active, classid, createdat, creator, done, question, endedat);
        this.answerkey = answerkey;
        this.options = options;
        this.responses = responses;
    }
}

export type { OrderOptions, OrderAnswerKey, OrderResponses, OrderResponseStructure}