import { useContext, createContext, useState, useEffect } from "react";
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
} from "firebase/auth";

import { User } from "firebase/auth";
import { auth } from "../firebase/firebaseconfig";
import { useRouter } from "next/router";

interface IAuthContext {
	status: "valid" | "loading" | null;
	user: User | null;
	googlesignin: () => void;
	logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
	status: null,
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
	const [status, setStatus] = useState<"valid" | "loading" | null>(null);

	function googlesignin() {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider).then((result) => {
            setStatus("valid");
			console.log("pushing", auth); router.push("/dashboard");
		}).catch((error) => {
			console.log(error);
		});
	};
	function logout() { signOut(auth); router.push("/"); };

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setStatus("valid");
		});
		return () => unsubscribe();
	}, [user]);

	return (
		<AuthContext.Provider value={{ user, status, googlesignin, logout }}>
			{children}
		</AuthContext.Provider>
	);
};