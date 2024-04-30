import Image from 'next/image'
import s from './index.module.scss'
import { Open_Sans } from 'next/font/google'
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/context/authcontext';

const openSansNormal = Open_Sans({ weight: "400", style: 'normal', subsets: ['latin'] });
const openSansBold = Open_Sans({ weight: "700", style: 'normal', subsets: ['latin'] });


export default function Index() {

	let router = useRouter()
	const { user, message, googlesignin, logout, githubsignin } = useAuth();

	return (
		<>
			<Head>
				<title>OpenPoll</title>
				<meta name="description" content="Openpoll" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className={s.container}>
				<Image
					src="/OpenPollLogo1.png"
					alt="Open Poll Logo"
					width={300}
					height={300}
					className={s.logo}
				/>
				<div className={s.text}>
					<h1 className={openSansBold.className}>Log in to Open Poll</h1>
					<p className={openSansNormal.className}>Welcome back! Please log in below</p>
				</div>
				<div className={s.login}>
					<div className={s.provider}>
						<img src="/googlelogo.webp" alt="Google Logo" />
						<button className={s.loginButton}
							onClick={() => { googlesignin(); }}
						>
							Continue with Google
						</button>

					</div>
					<div className={s.provider}>
						<img src="/githublogo.png" alt="Github Logo" />
						<button className={s.loginButton}
							onClick={() => { githubsignin(); }}
						>
							Continue with Github
						</button>
					</div>
				</div>
				{
					message && <div className={s.message}>{message}</div>
				}
			</div>
		</>
	);
}