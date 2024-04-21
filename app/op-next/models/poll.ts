
type PollTypes = "mc" | "short" | "attendance" | "order";

abstract class _Poll {
  type: PollTypes;
  active: boolean;
  classid: string;
  created: any;
  creator: string;
  done: boolean;
  question: string;

  constructor(type: PollTypes, active: boolean, classid: string, created: any, creator: string, done: boolean, question: string) {
    this.type = type;
    this.active = active;
    this.classid = classid;
    this.created = created;
    this.creator = creator;
    this.done = done;
    this.question = question;
  }
}

class MCPoll extends _Poll {
  answers: string[];
  options: {
    letter: string;
    option: string;
  }[];
  responses: PollResponse;

  constructor(active: boolean, classid: string, created: any, creator: string, done: boolean, question: string, answers: string[], options: { letter: string; option: string; }[], responses: PollResponse) {
    super("mc", active, classid, created, creator, done, question);
    this.answers = answers;
    this.options = options;
    this.responses = responses;
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
export type { PollResponse};
export { convertPollTypeToText };

