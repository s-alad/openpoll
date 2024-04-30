import { useContext, createContext, useState, useEffect } from "react";
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
} from "firebase/auth";

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth } from '@openpoll/packages/config/firebaseconfig';
import { useRouter } from "next/router";

import s from "./auth.module.scss";

interface IAuthContext {
	user: User | null;
	loading: boolean;
	googlesignin: () => void;
	logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
	user: null,
	loading: false,
	googlesignin: () => { },
	logout: () => { },
});

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	let router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);

	function googlesignin() {
		setLoading(true);
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider).then(async (result) => {
            const isfirst = getAdditionalUserInfo(result)!.isNewUser;
            if (isfirst) {
                router.push("/home");
            } else {
                console.log("pushing", auth); router.push("/home");
            }
		}).catch((error) => {
			console.log(error);
		});
		setLoading(false);
	};
	function logout() { signOut(auth); router.push("/"); };

	useEffect(() => {
		setLoading(true);
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			console.log("auth state changed");
			console.log(currentUser);
			setLoading(false);
            setUser(currentUser);
		});
		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, googlesignin, logout }}>
			{loading ? <div className={s.loading}>
				<img src="/openpolltransparent.gif" alt="loading" />
			</div> : children}
		</AuthContext.Provider>
	);
};