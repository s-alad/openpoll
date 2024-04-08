import s from "./studentStats.module.scss";
import Image from "next/image"; 

interface Props {
  studentAttendance: number;
  studentAttendanceLength: number;
  questionsAnswered: number;
  totalQuestions: number;
  numCorrect: number;
}

export default function StudentStats({studentAttendance, studentAttendanceLength, questionsAnswered, totalQuestions, numCorrect}: Props) {
  return (
    <div className={s.studentStats}>
              <div className={s.statItem}>
                <Image
                  src="/person.svg"
                  alt="person"
                  width={20}
                  height={20}
                  className={s.image}
                />
                <h2 className={s.statText}>{studentAttendance}/{studentAttendanceLength}</h2>
                {/* Placeholder */}
              </div>
              <div className={s.statItem}>
                <Image
                  src="/chat_box.svg"
                  alt="chat box"
                  width={24}
                  height={24}
                  className={s.image}
                />
                <h2 className={s.statText}>
                {questionsAnswered}/{totalQuestions} Questions Answered
                </h2>
              </div>
              <div className={s.statItem}>
                <Image
                  src="/checkmark.svg"
                  alt="check"
                  width={20}
                  height={20}
                  className={s.image}
                />
                <h2 className={s.statText}>{numCorrect} Correct</h2>
              </div>
            </div>
  );
}

