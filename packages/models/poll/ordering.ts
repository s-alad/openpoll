import { _Poll } from "../poll";

type OrderAnswerKey = {
    [index: number]: string // index: letter
}
type OrderOptions = {
    [letter: string]: string; // letter: option
}
type OrderResponses = {
    correct: {
        [userid: string]: string; // userid: email
    },
    incorrect: {
        [userid: string]: string; // userid: email
    }
}

export default class OrderPoll extends _Poll {
    answerkey: OrderAnswerKey
    options: OrderOptions
    responses: OrderResponses
    

    constructor(
        active: boolean,
        classcode: string,
        classid: string,
        createdat: any,
        endedat: any,
        creator: string,
        done: boolean,
        question: string,
        answerkey: OrderAnswerKey,
        options: OrderOptions,
        responses: OrderResponses

    ) {
        super("order", active, classcode, classid, createdat, endedat, creator, done, question);
        this.answerkey = answerkey;
        this.options = options;
        this.responses = responses;
    }
}

export type { OrderOptions, OrderAnswerKey, OrderResponses}