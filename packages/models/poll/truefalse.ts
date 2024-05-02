import Poll from "../poll";

type TrueFalseResponses = {
    [userid: string]: {
        email: string;
        response: boolean;
        correct: boolean;
    }
}

export default class TrueFalsePoll extends Poll {
    answerkey: "true" | "false"
    responses: TrueFalseResponses

    constructor(
        active: boolean,
        classid: string,
        createdat: any,
        creator: string,
        done: boolean,
        question: string,
        responses: TrueFalseResponses,
        answerkey: "true" | "false",
        endedat?: any,
    ) {
        super("tf", active, classid, createdat, creator, done, question, endedat);
        this.answerkey = answerkey;
        this.responses = responses;
    }
}

export type { TrueFalseResponses }