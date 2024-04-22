import Poll from "../poll";

type MatchAnswerKey = {
    [index: string]: string;
}
type MatchOptions = {
    left: {
        [index: string]: string;
    }
    right: {
        [index: string]: string;
    }
}
type MatchResponses = {
    [userid: string]: {
        email: string;
        response: {
            [index: string]: string;
        }
    }
}

export default class MatchPoll extends Poll {
    answerkey: MatchAnswerKey
    options: MatchOptions
    responses: MatchResponses


    constructor(
        active: boolean,
        classid: string,
        createdat: any,
        creator: string,
        done: boolean,
        question: string,
        answerkey: MatchAnswerKey,
        options: MatchOptions,
        responses: MatchResponses,
        endedat?: any,
    ) {
        super("match", active, classid, createdat, creator, done, question, endedat);
        this.answerkey = answerkey;
        this.options = options;
        this.responses = responses;
    }
}

export type { MatchOptions, MatchAnswerKey, MatchResponses }