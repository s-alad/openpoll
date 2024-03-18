import React from "react";
import Navbar from "./navbar/navbar";
import { useGlobal } from "@/context/globalcontext";
import s from "./layout.module.scss";

export default function Layout({ children }: { children: React.ReactNode }) {

    const {path} = useGlobal();

    return (
        <div className={s.layout}>
            <Navbar path={path} />
            {children}
        </div>
    );
}