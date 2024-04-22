import { _Poll } from "../poll";

type letter = string;
type options = { 
    [letter: string]: string; // letter: option
} 
type responses = {
    [letter: string]: {
        [userid: string]: string; // userid: email
    }
}

class MCPoll extends _Poll {
    answerkey: letter[]; // letter[]
    options: options;
    responses: responses;

    constructor(
        active: boolean,
        classcode: string,
        classid: string,
        createdat: any,
        endedat: any,
        creator: string, 
        done: boolean, 
        question: string, 
        answerkey: letter[],
        options: options,
        responses: responses

    ) {
        super("mc", active, classcode, classid, createdat, endedat, creator, done, question);
        this.answerkey = answerkey;
        this.options = options;
        this.responses = responses;
    }
}

export type { options as MCOptions, responses as MCResponses }