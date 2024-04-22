import Poll from "../poll";

type AttendanceResponses = {
    [userid: string]: {
        email: string;
        attended: boolean;
    }
}

export default class AttendancePoll extends Poll {
    date: any;
    responses: AttendanceResponses

    constructor(
        active: boolean,
        classid: string,
        createdat: any,
        creator: string,
        done: boolean,
        question: string,
        date: any,
        responses: AttendanceResponses,
        endedat?: any,
    ) {
        super("attendance", active, classid, createdat, creator, done, question, endedat);
        this.date = date;
        this.responses = responses;
    }
}

export type { AttendanceResponses }