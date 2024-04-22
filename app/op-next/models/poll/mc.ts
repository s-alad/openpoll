import Poll from "../poll";

type MCAnswerKey = string[];
type MCOptions = {
    letter: string; 
    option: string;
}[];
type MCResponses = {
    [userid: string]: {
        email: string;
        correct: boolean;
        response: string[]
    }
}

export default class MCPoll extends Poll {
    answerkey: MCAnswerKey; // letter[]
    options: MCOptions;
    responses: MCResponses;

    constructor(
        active: boolean,
        classid: string,
        createdat: any,
        creator: string, 
        done: boolean, 
        question: string, 
        answerkey: MCAnswerKey,
        options: MCOptions,
        responses: MCResponses,
        endedat?: any,
    ) {
        super("mc", active, classid, createdat, creator, done, question, endedat);
        this.answerkey = answerkey;
        this.options = options;
        this.responses = responses;
    }
}

export type { MCOptions, MCResponses, MCAnswerKey }