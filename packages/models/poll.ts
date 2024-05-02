import AttendancePoll from "./poll/attendance";
import MatchPoll from "./poll/matching";
import MCPoll from "./poll/mc";
import OrderPoll from "./poll/ordering";
import ShortPoll from "./poll/short";
import TrueFalsePoll from "./poll/truefalse";

export type TPoll = "mc" | "short" | "attendance" | "order" | "match" | "tf";
export type xPoll = Poll | MCPoll | ShortPoll | AttendancePoll | OrderPoll /* | MatchPoll */ | TrueFalsePoll;
export const TLPoll = ["mc", "short", "attendance", "order", /* "match", */ "tf"];

export default abstract class Poll {
  type: TPoll;
  active: boolean;
  classid: string;
  createdat: any;
  creator: string;
  done: boolean;
  question: string;
  image?: string;
  endedat?: any;

  constructor(
    type: TPoll,
    active: boolean,
    classid: string,
    createdat: any,
    creator: string,
    done: boolean,
    question: string,
    image?: string,
    endedat?: any,
  ) {
    this.type = type;
    this.active = active;
    this.classid = classid;
    this.createdat = createdat;
    this.creator = creator;
    this.done = done;
    this.question = question;
    this.image = image;
    this.endedat = endedat;
  }
}

export interface PollAndId {
  id: string;
  poll: Poll | MCPoll | ShortPoll | AttendancePoll | OrderPoll /* | MatchPoll */ | TrueFalsePoll;
}

function convertPollTypeToText(type: TPoll) {
  switch (type) {
    case "mc":
      return "Multiple Choice";
    case "short":
      return "Short Answer";
    case "attendance":
      return "Attendance";
    case "order":
      return "Ordering";
    /* case "match":
      return "Matching"; */
    case "tf":
      return "True/False";
  }
}

function getCorrectPollType(data: any) {
  if (data.type === "mc") {
    return data as MCPoll;
  } else if (data.type === "short") {
    return data as ShortPoll;
  } else if (data.type === "attendance") {
    return data as AttendancePoll;
  } else if (data.type === "order") {
    return data as OrderPoll;
  } /* else if (data.type === "match") {
    return data as MatchPoll;
  } */ else if (data.type === "tf") {
    return data as TrueFalsePoll;
  } else {
    return undefined
  }
} 

export { convertPollTypeToText, getCorrectPollType };

