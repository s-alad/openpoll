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

