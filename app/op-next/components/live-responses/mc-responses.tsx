import React from "react";

import s from "./mc-responses.module.scss";
import MCPoll, { MCResponses } from "@/models/poll/mc";

interface LiveMcResponsesProps {
    livepoll: MCPoll;
    responses: MCResponses;
    showcorrectanswers: boolean;
}

export default function LiveMcResponses({ livepoll, responses, showcorrectanswers}: LiveMcResponsesProps) {
    return (
        <div className={s.mcresponses}>
            {
                (livepoll as MCPoll)?.options.map((option, index) => {
                    return (
                        <div key={index} className={s.option}>
                            <div className={s.letter}
                                style={
                                    showcorrectanswers ?
                                        {
                                            backgroundColor: `${(livepoll as MCPoll).answerkey.includes(option.letter) ?
                                                    "#00FF00" : "#fff"
                                                }`
                                        } : {}
                                }
                            >
                                {option.letter}
                            </div>
                            <div className={s.content}
                                style={{
                                    width: `${(
                                            Object.values(responses as MCResponses).filter((response) =>
                                                response.response?.includes(option.letter)).length /
                                            Object.values(responses as MCResponses).length
                                        ) * 100
                                        }%`
                                }}
                            >
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}