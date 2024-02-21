import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Open_Sans } from 'next/font/google'

const openSansNormal = Open_Sans({ weight: "400", style: 'normal', subsets: ['latin'] });

const openSansBold = Open_Sans({ weight: "700", style: 'normal', subsets: ['latin'] });


export default function Page () {
  return (
    <div className={styles.container}> 
      <Image
        src="/OpenPollLogo1.png"
        alt="Open Poll Logo"
        width={300}
        height={300}
        className={styles.logo}
      />
      <div className={styles.text}>
        <h1 className={openSansBold.className}>Log in to Open Poll</h1>
        <p className={openSansNormal.className}>Welcome back! Please log in below</p>
      </div>
      <button className={styles.loginButton}>
        Sign in with Google
      </button>
    </div>
  );
}