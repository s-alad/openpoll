import s from "./topSection.module.scss";
import { useAuth } from "@/context/authcontext";

interface Props {
  totalGrade: number;
  attendedCount: number;
  studentAttendanceLength: number;
  numCorrect: number;
  totalQuestions: number;
}

export default function TopSection({totalGrade, attendedCount, studentAttendanceLength, numCorrect, totalQuestions,}: Props) {
    const { user }= useAuth();

  return (
    <div className={s.topSection}>
              <div className={s.studentInfo}>
                <div className={s.studentDetails}>
                  <h3>Name: {user?.displayName}</h3>
                  <p><strong>ID: </strong>{user?.uid.substring(0, 7)}</p>
                  <p><strong>Email: </strong>{user?.email}</p>
                </div>
              </div>
              <div className={s.averageScores}>
                <h3>Average Scores</h3>
                <div className={s.score}>
                  <div className={s.scoreCategory}>
                    <span>Total</span>
                    <span className={s.scoreValue}>{totalGrade}/100</span>
                  </div>
                  <div className={s.progressBarContainer}>
                    <div
                      className={s.progressBar}
                      style={{
                        width: `${totalGrade}%`,
                        backgroundColor: "blue",
                      }}
                    ></div>
                  </div>
                </div>
                <div className={s.score}>
                <div className={s.scoreCategory}>
                  <span>Participation</span>
                  <span className={s.scoreValue}>
                    {studentAttendanceLength !== 0
                      ? `${(attendedCount / studentAttendanceLength) * 100}`
                      : '0'} / 100
                  </span>
                </div>
                <div className={s.progressBarContainer}>
                <div
                  className={s.progressBar}
                  style={{
                    width: `${studentAttendanceLength !== 0 ? (attendedCount / studentAttendanceLength) * 100 : 0}%`,
                    backgroundColor: 'orange',
                  }}
                ></div>
                </div>
                </div>
                <div className={s.score}>
                  <div className={s.scoreCategory}>
                    <span>Correctness</span>
                    <span className={s.scoreValue}>
                      {numCorrect}/{totalQuestions}
                    </span>
                  </div>
                  <div className={s.progressBarContainer}>
                    <div
                      className={s.progressBar}
                      style={{
                        width: `${(numCorrect / totalQuestions) * 100}%`,
                        backgroundColor: "purple",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
        
  );
}
