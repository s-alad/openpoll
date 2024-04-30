import React from "react";

import s from "./spinner.module.scss";

export default function Spinner({flex, op}: {flex?: boolean, op?: boolean}) {
    return (
        <div className={`${s.spinner} ${flex && s.flex}`}>
            {
                op ? <img src="/openpolltransparent.gif" alt="loading..." /> :
                <div className={s.loader}></div>
            }
        </div>
    );
}