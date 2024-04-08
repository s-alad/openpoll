import React from "react";
import s from "./subnavbar.module.scss";
import { useRouter } from "next/router";

export default function SubNavbar() {

    const router = useRouter();

    let show = router.pathname.startsWith("/class") || router.pathname.startsWith("/dashboard")

    const pathitems = [
        {
            path: "/polls",
            name: "Polls",
            activeby: "/dashboard"
        },
        {
            path: "/gradebook",
            name: "Gradebook",
            activeby: "/class"
        },
        {
            path: "/analytics",
            name: "Analytics",
            activeby: "/analytics"
        }
    ]


    if (!show) {
        return null;
    }

    return (
        <div className={s.subnavbar}>
            {
                pathitems.map((item, index) => {
                    return (
                        <div key={index} className={`${s.item} ${
                            router.pathname.startsWith(item.activeby) ? s.active : ""
                        }`} >
                            {item.name}
                        </div>
                    )
                })
            }
        </div>
    );
}