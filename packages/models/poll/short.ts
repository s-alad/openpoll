import Poll from "../poll";

type ShortResponses = {
    [userid: string]: {
        email: string;
        response: string;
        correct: boolean;
    }
}

export default class ShortPoll extends Poll {
    answerkey?: string;
    responses: ShortResponses

    constructor(
        active: boolean,
        classid: string,
        createdat: any,
        creator: string,
        done: boolean,
        question: string,
        responses: ShortResponses,
        answerkey?: string,
        endedat?: any,
    ) {
        super("short", active, classid, createdat, creator, done, question, endedat);
        this.answerkey = answerkey;
        this.responses = responses;
    }
}

export type { ShortResponses }