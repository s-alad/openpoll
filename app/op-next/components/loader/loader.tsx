import React from "react";

import s from "./loader.module.scss";

export default function Loader({flex}: {flex?: boolean}) {
    return (
        <div className={`${s.loader} ${flex && s.flex}`}>
            loading...
            <div className={s.spinner}></div>
        </div>
    );
}