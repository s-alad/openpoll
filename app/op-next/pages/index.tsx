import Image from 'next/image'
import s from './index.module.scss'
import { Open_Sans } from 'next/font/google'
import { useRouter } from 'next/router';

const openSansNormal = Open_Sans({ weight: "400", style: 'normal', subsets: ['latin'] });
const openSansBold = Open_Sans({ weight: "700", style: 'normal', subsets: ['latin'] });


export default function Index() {

  let router = useRouter()

  async function signin() {
    router.push('/login')
  }

  return (
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
      <button className={s.loginButton}
        onClick={signin}
      >
        Continue with Google
      </button>
    </div>
  );
}