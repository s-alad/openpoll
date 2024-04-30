import { useContext, createContext, useState, useEffect } from "react";
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	GithubAuthProvider,
	fetchSignInMethodsForEmail,
	linkWithCredential,
	AuthCredential,
	linkWithPopup
} from "firebase/auth";

import { User, getAdditionalUserInfo } from "firebase/auth";
import { auth } from '@openpoll/packages/config/firebaseconfig';
import { useRouter } from "next/router";

import s from "./auth.module.scss";

interface IAuthContext {
	user: User | null;
	loading: boolean;
	message: string | null;
	googlesignin: () => void;
	githubsignin: () => void;
	logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
	user: null,
	loading: false,
	message: null,
	googlesignin: () => { },
	githubsignin: () => { },
	logout: () => { },
});

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	let router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	
	async function githubsignin() {
		setLoading(true);
		const provider = new GithubAuthProvider();
		signInWithPopup(auth, provider).then(async (result) => {
			const isfirst = getAdditionalUserInfo(result)!.isNewUser;
			if (isfirst) {
				router.push("/home");
			} else {
				console.log("pushing", auth); router.push("/home");
			}
		}).catch(async (error) => {
			if (error.code === 'auth/account-exists-with-different-credential') {
				setMessage("Account already exists with different credential");
				setTimeout(() => { setMessage(null); }, 3000);
			}
		});

		setLoading(false);
	};
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
		<AuthContext.Provider value={{ user, loading, message, googlesignin, githubsignin, logout }}>
			{loading ? <div className={s.loading}>
				<img src="/openpolltransparent.gif" alt="loading" />
			</div> : children}
		</AuthContext.Provider>
	);
};