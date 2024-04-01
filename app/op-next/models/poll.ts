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
}

interface PollResponse {
  [option: string]: { [uid: string]: string };
  responses: PollResponse;
}

export default Poll;
export type { PollResponse };

