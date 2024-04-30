import React from "react";

import s from "./short-responses.module.scss";
import ShortPoll, { ShortResponses } from "@openpoll/packages/models/poll/short";
import { FaCheck } from "react-icons/fa";

interface LiveShortResponsesProps {
    livepoll: ShortPoll;
    responses: ShortResponses;
    showcorrectanswers: boolean;
}

export default function LiveShortResponses({ livepoll, responses, showcorrectanswers }: LiveShortResponsesProps) {
    return (
        <div className={s.shortresponses}>
            {
                showcorrectanswers && (livepoll as ShortPoll).answerkey && (
                    <div className={s.correct}>
                        <div className={s.letter}><FaCheck /></div>
                        <div className={s.content}>{(livepoll as ShortPoll).answerkey}</div>
                    </div>
                )
            }
            {
                Object.values(responses as ShortResponses).reverse().map((response, index) => {
                    return (
                        <div key={index} className={s.response}>
                            <div className={s.letter}>{index}</div>
                            <div className={s.content}>{response.response}</div>
                        </div>
                    )
                })
            }
        </div>
    )
}