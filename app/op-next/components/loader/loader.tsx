import React from "react";

import s from "./loader.module.scss";

export default function Loader() {
    return (
        <div className={s.loader}>
            loading...
            <div className={s.spinner}></div>
        </div>
    );
}