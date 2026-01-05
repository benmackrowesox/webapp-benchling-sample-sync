import type { FC } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "react-hot-toast";
import nProgress from "nprogress";
import { CacheProvider } from "@emotion/react";
import type { EmotionCache } from "@emotion/cache";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";

import { gtmConfig } from "../public-config";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { RTL } from "../components/rtl";
import { SettingsButton } from "../components/settings-button";
import { SplashScreen } from "../components/splash-screen";
import {
  SettingsConsumer,
  SettingsProvider,
} from "../contexts/settings-context";
import { AuthConsumer, AuthProvider } from "../contexts/firebase-auth-context";
import { createTheme } from "../theme";
import { Analytics } from "@vercel/analytics/react";
import { createEmotionCache } from "../utils/create-emotion-cache";
import CookieConsent from "react-cookie-consent";
import { Link, Typography } from "@mui/material";

type EnhancedAppProps = AppProps & {
  Component: NextPage;
  emotionCache: EmotionCache;
};

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

const clientSideEmotionCache = createEmotionCache();

const App: FC<EnhancedAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>Esox Biologics</title>
          <meta property="og:title" content="Esox Biologics" key="title" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <SettingsProvider>
              <SettingsConsumer>
                {({ settings }) => (
                  <ThemeProvider
                    theme={createTheme({
                      direction: settings.direction,
                      responsiveFontSizes: settings.responsiveFontSizes,
                      mode: "light",
                    })}
                  >
                    <RTL direction={settings.direction}>
                      <CssBaseline />
                      <Toaster position="top-center" />
                      <SettingsButton />
                      <AuthConsumer>
                        {(auth) =>
                          !auth.isInitialized ? (
                            <SplashScreen />
                          ) : (
                            getLayout(<Component {...pageProps} />)
                          )
                        }
                      </AuthConsumer>
                      <Analytics />
                      <CookieConsent
                        location="bottom"
                        buttonText="Accept"
                        declineButtonText="Reject"
                        enableDeclineButton
                        hideOnAccept
                        cookieName="initialCookieConsent"
                        style={{ background: "#2B373B", zIndex: 9999 }} // should cover Book a meeting widget (z-index 9998)
                        buttonStyle={{
                          color: "white",
                          backgroundColor: "#0E907A",
                          fontSize: "15px",
                          borderRadius: "5px",
                        }}
                        declineButtonStyle={{
                          color: "white",
                          backgroundColor: "#0E907A",
                          fontSize: "15px",
                          borderRadius: "5px",
                        }}
                        expires={150}
                      >
                        <Typography variant="body1">
                          This website uses cookies to enhance the user
                          experience. Read our{" "}
                          <Link href="/privacy-policy">privacy policy</Link> to
                          learn more.
                        </Typography>
                      </CookieConsent>
                    </RTL>
                  </ThemeProvider>
                )}
              </SettingsConsumer>
            </SettingsProvider>
          </AuthProvider>
        </LocalizationProvider>
      </CacheProvider>
      <GoogleAnalytics gaId={gtmConfig.containerId ?? ""} />
    </>
  );
};

export default App;
