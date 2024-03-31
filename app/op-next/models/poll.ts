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
}

type PollTypes = "mc" | "short" | "ordering";

export default Poll;
export type { PollResponse, PollTypes };

