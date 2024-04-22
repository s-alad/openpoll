
type TPoll = "mc" | "short" | "attendance" | "order" | "match"

export abstract class _Poll {
  type: TPoll;
  active: boolean;
  classcode: string;
  classid: string;
  createdat: any;
  endedat?: any;
  creator: string;
  done: boolean;
  question: string;
  image?: string;

  constructor(
    type: TPoll,
    active: boolean,
    classcode: string,
    classid: string,
    createdat: any,
    endedat: any,
    creator: string,
    done: boolean,
    question: string,
    image?: string
  ) {
    this.type = type;
    this.active = active;
    this.classcode = classcode;
    this.classid = classid;
    this.createdat = createdat;
    this.endedat = endedat;
    this.creator = creator;
    this.done = done;
    this.question = question;
    this.image = image;
  }
}

interface Poll {
  active: boolean;
  answers: string[];
  classid: string;
  created: any;
  question: string;
  options: {
    letter: string;
    option: string;
  }[];
  responses?: PollResponse;
  done?: boolean;
  date?: any;
  type: "mc" | "short" | "attendance";
}

function convertPollTypeToText(type: "mc" | "short" | "attendance") {
  switch (type) {
    case "mc":
      return "Multiple Choice";
    case "short":
      return "Short Answer";
    case "attendance":
      return "Attendance";
  }
}

interface PollResponse {
  [option: string]: { [uid: string]: string };
}

export default Poll;
export type { PollResponse }
export type { TPoll }
export { convertPollTypeToText };

