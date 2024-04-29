import React from "react";
import s from "./subnavbar.module.scss";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SubNavbar() {

    const router = useRouter();

    let showdashboard = router.pathname.startsWith("/dashboard")
    let showclass = router.pathname.startsWith("/class")

    const regexMatch = router.asPath.match(/\/(dashboard|class)\/([^\/]+)(\/|$)/);
    const prefix = regexMatch ? regexMatch[1] : null; // 'dashboard' or 'class'
    const classid = regexMatch ? regexMatch[2] : null;
    console.log(prefix, classid);

    const dashboardpathitems = [
        {
            path: `/dashboard/${classid}`,
            name: "Polls",
            activeby: ["/dashboard/[classid]"]
        },
        {
            path: `/dashboard/${classid}/gradebook`,
            name: "Gradebook",
            activeby: ["/dashboard/[classid]/gradebook"]
        },
        {
            path: `/dashboard/${classid}/analytics`,
            name: "Analytics",
            activeby: ["/dashboard/[classid]/analytics"]
        },
        {
            path: `/dashboard/${classid}/settings`,
            name: "Settings",
            activeby: ["/dashboard/[classid]/settings"]
        }
    ]

    const classpathitems = [
        {
            path: `/class/${classid}`,
            name: "Polls",
            activeby: ["/class/[classid]"]
        },
        {
            path: `/class/${classid}/grades`,
            name: "Grades",
            activeby: ["/class/[classid]/grades", "/class/[classid]/grades/[question]"]
        },
    ]

    function isActive(activeBy: string[]) {
        return activeBy.some(pattern => {
            const regexPattern = pattern
                .replace(/\[.*?\]/g, '[^/]+') // Replace dynamic segments with regex
                .replace(/\//g, '\\/') // Escape slashes
                .replace(/\$/, '\\$'); // Escape end-of-string symbol if present
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(router.pathname);
        });
    };


    if (!showdashboard && !showclass) {
        return <div className={s.subnavbar}></div>;
    }

    return (
        <div className={s.subnavbar}>
            {
                (showdashboard ? dashboardpathitems : classpathitems).map((item, index) => {
                    const active = isActive(item.activeby) ? s.active : '';
                    return (
                        <Link key={index} href={item.path} passHref>
                            <div key={index} className={`${s.item} ${active ? s.active : ''
                                }`} >
                                {item.name}
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    );
}