import { _Poll } from "../poll";

type responses = {
    [userid: string]: {
        email: string;
        response: string;
    }
}

class ShortPoll extends _Poll {
    answerkey?: string;
    responses: responses

    constructor(
        active: boolean,
        classcode: string,
        classid: string,
        createdat: any,
        endedat: any,
        creator: string,
        done: boolean,
        question: string,
        responses: responses,
        answerkey?: string,
    ) {
        super("short", active, classcode, classid, createdat, endedat, creator, done, question);
        this.answerkey = answerkey;
        this.responses = responses;
    }
}