import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/authcontext";
import { get } from "http";

// these are the protected routes that you need token verification
// add routes that you want to have it protected
// also only these routes can get the decoded jwt token data
// Many of these routes do not exits yet. That's okay (:
const protectedRoutes = [
    "/dashboard",
];

const RedirectBasedOnAuth = ({ children }: { children: React.ReactNode }) => {
    /**
     * This is a higher level component who's job it is to redirect the user to the home page if they are not authenticated but attempt to navigate to a protected route.
     */
    const [calledPush, setCalledPush] = useState(false);
    const { user, logout, googlesignin } = useAuth();
    const router = useRouter();
    const currentRoute = router.asPath; // this shows the route you are currently in

    useEffect(() => {
        if (protectedRoutes.includes(currentRoute)) {
            if ((!user)) {
                setCalledPush(true);
                router.push("/");
                return;
            }
        }
        if (currentRoute === "/") {
            if (user) {
                router.push("/dashboard");
                return;
            }
        }
    }, [calledPush, currentRoute, router]);

    return children;
};

export default RedirectBasedOnAuth;