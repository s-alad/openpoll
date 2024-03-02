import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/authcontext";
import {
	onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/firebaseconfig";

// these are the protected routes that you need token verification
// add routes that you want to have it protected
// also only these routes can get the decoded jwt token data
// Many of these routes do not exits yet. That's okay (:
const protectedRoutes = [
    "/dashboard",
    "/create/class",
    "/create/poll",
];

const protectedDynamicRoutes = [
    "/class",
    "/poll",
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
        if (protectedRoutes.includes(currentRoute) || protectedDynamicRoutes.some((route) => currentRoute.startsWith(route))) {
            console.log("protected route", currentRoute);
            console.log("user is", user);
            if ((!user)) {
                setCalledPush(true);
                router.push("/");
                return;
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			console.log("auth state changed");
			console.log(currentUser);

            if (currentRoute === "/") {
                console.log("current route is /");
                console.log("user is", currentUser);
                if (currentUser) {
                    console.log("user is logged in");
                    router.push("/dashboard");
                    return;
                }
            }
		});
		return () => unsubscribe();

    }, [calledPush, currentRoute, router]);

    return children;
};

export default RedirectBasedOnAuth;