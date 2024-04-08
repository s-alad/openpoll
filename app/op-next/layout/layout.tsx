import React from "react";
import Navbar from "./navbar/navbar";
import { useGlobal } from "@/context/globalcontext";
import s from "./layout.module.scss";
import SubNavbar from "./subnavbar/subnavbar";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <div className={s.layout}>
            <Navbar />
            <SubNavbar />
            {children}
        </div>
    );
}