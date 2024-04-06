interface Poll {
  classid: string;
  question: string;
  options: {
    letter: string;
    option: string;
  }[];
  answers: string[];
  created: any;
  active: boolean;
  responses?: PollResponse;
  done?: boolean;
  date?: any;
  type: "mc" | "short" | "attendance";
}

interface PollResponse {
  [option: string]: { [uid: string]: string };
}

export default Poll;
export type { PollResponse };

