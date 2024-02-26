import React from "react";
import Image from "next/image";
import styles from "../styles/Navbar.module.css";
import Link from "next/link";
import { Open_Sans } from 'next/font/google'

const openSansNormal = Open_Sans({ weight: "400", style: 'normal', subsets: ['latin'] });


export default function Navbar() {
    return (
        <div className={styles.container}>
            <div className={styles.navItems}>
            <Link href="/courses" className={styles.navButton}>Courses
            </Link>
            <Image
                src="/Group.svg"
                alt="group"
                width={40}
                height={40}
                className={styles.navImage}
            />
            <Link href="/grades" className={styles.navButton}>Gradebook
            </Link>
            <Image
                src="/gradesheet.svg"
                alt="gradesheet"
                width={40}
                height={40}
                className={styles.navImage}
            />
            <div className={styles.spacer} /> 
            </div>
        <div>
          <Image
            src="/account_circle.svg"
            alt="account circle"
            width={30}
            height={30}
          />
        </div>
      </div>
    );
};