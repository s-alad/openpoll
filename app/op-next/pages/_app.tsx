import type { AppProps } from "next/app";
import AuthProvider from "@/context/authcontext";
import RedirectBasedOnAuth from "@/redirect/redirect";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
import "../styles/globals.css";
import Layout from "@/layout/layout";
import GlobalProvider from "@/context/globalcontext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <RedirectBasedOnAuth>
        <GlobalProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </GlobalProvider>
      </RedirectBasedOnAuth>
    </AuthProvider>
  )
}
