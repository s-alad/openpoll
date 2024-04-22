import { _Poll } from "../poll";

type responses = {
    attended: {
        [userid: string]: boolean;
    },
    absent: {
        [userid: string]: boolean;
    }
}

class AttendancePoll extends _Poll {
    date: any;
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
        date: any,
        responses: responses
    ) {
        super("attendance", active, classcode, classid, createdat, endedat, creator, done, question);
        this.date = date;
        this.responses = responses;
    }
}