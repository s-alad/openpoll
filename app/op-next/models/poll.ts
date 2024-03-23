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
<<<<<<< HEAD
  responses?: PollResponse;
  done?: boolean;
}

interface PollResponse {
  [option: string]: { [uid: string]: string };
=======
  responses: PollResponse;
}

interface PollResponse {
  [option: string]: {};
>>>>>>> afc921c (tried comparing grades)
}

export default Poll;

