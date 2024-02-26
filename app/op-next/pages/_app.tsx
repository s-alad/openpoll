import type { AppProps } from "next/app";
import AuthProvider from "@/context/authcontext";
import RedirectBasedOnAuth from "@/redirect/redirect";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <RedirectBasedOnAuth>
        <Component {...pageProps} />
      </RedirectBasedOnAuth>
    </AuthProvider>
  )
}
