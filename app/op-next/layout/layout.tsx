import React from "react";
import Navbar from "./navbar/navbar";
import { useGlobal } from "@/context/globalcontext";

export default function Layout({ children }: { children: React.ReactNode }) {

    const {path} = useGlobal();

    return (
        <div>
            <Navbar path={path} />
            {children}
        </div>
    );
}