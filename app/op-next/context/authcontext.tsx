import { useContext, createContext, useState, useEffect } from "react";
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
} from "firebase/auth";

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth } from "../firebase/firebaseconfig";
import { useRouter } from "next/router";

interface IAuthContext {
	user: User | null;
	googlesignin: () => void;
	logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
	user: null,
	googlesignin: () => { },
	logout: () => { },
});

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	let router = useRouter();
	const [user, setUser] = useState<User | null>(null);

	function googlesignin() {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider).then(async (result) => {
            const isfirst = getAdditionalUserInfo(result)!.isNewUser;
            if (isfirst) {
                router.push("/onboard");
            } else {
                console.log("pushing", auth); router.push("/dashboard");
            }
		}).catch((error) => {
			console.log(error);
		});
	};
	function logout() { signOut(auth); router.push("/"); };

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			console.log("auth state changed");
			console.log(currentUser);
            setUser(currentUser);
		});
		return () => unsubscribe();
	}, [user]);

	return (
		<AuthContext.Provider value={{ user, googlesignin, logout }}>
			{children}
		</AuthContext.Provider>
	);
};