import '@/styles/globals.css';
import '@/styles/sliderStyles.css'
import 'react-multi-carousel/lib/styles.css';
import {CartContextProvider} from "@/components/CartContext";
import {SessionProvider} from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import {NextIntlClientProvider,IntlErrorCode} from 'next-intl';
import {useRouter} from 'next/router';

export default function App({ Component, pageProps: {session, ...pageProps } }) {
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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SessionProvider session={session}>
          <CartContextProvider>
            <Component {...pageProps} />
          </CartContextProvider>
        </SessionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
