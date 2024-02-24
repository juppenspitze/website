import '@/styles/globals.css';
import '@/styles/tagInput.css';
import 'styles/stats.css';
import '@/styles/richText.css';
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {NextIntlClientProvider,IntlErrorCode} from 'next-intl';
import {useRouter} from 'next/router';

export default function App({Component, pageProps: { session, ...pageProps }}) {
  const router = useRouter();

  function onError(error) {
    if (error.code === IntlErrorCode.MISSING_MESSAGE) {
      // Missing translations are expected and should only log an error
      console.error(error);
    };
  };
   
  function getMessageFallback({namespace, key, error}) {
    const path = [namespace, key].filter((part) => part != null).join('.');
   
    if (error.code === IntlErrorCode.MISSING_MESSAGE) {
      return path + ' is not yet translated';
    } else {
      console.error(error);
      return 'Dear developer, please fix this message: ' + path;
    };
  };

  return (
    <NextIntlClientProvider
      onError={onError}
      getMessageFallback={getMessageFallback}
      locale={router.locale}
      timeZone="Europe/Vienna"
      messages={pageProps.messages}
    >
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="dark">
          <SessionProvider session={session}>
            <Toaster richColors />
            <Component {...pageProps}/>
            <SpeedInsights />
          </SessionProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </NextIntlClientProvider>
  )
}
