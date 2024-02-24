import Nav from "@/components/Nav";
import { GlowCapture, Glow } from "@codaworks/react-glow";
import {useNetwork} from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import DynamicBg from "./DynamicBg";
import LoginForm from "./LoginForm";
import useIsLoggedIn from "@/hooks/useLoggedIn";
import Spinner from "./Spinner";
import { useTranslations } from "next-intl";

export default function Layout({children}) {
  const tOffline = useTranslations('Offline');

  const { isLoggedIn, isLoading } = useIsLoggedIn();
  const isOnline = useNetwork();

  if (!isOnline) {
    return (
      <GlowCapture>
        <div className="bg-bgGray w-screen h-screen flex items-center justify-center">
          <Glow color="purple">
            <div className="grid grid-rows-[auto,auto,1fr]">
              <div className="row-start-2 col-start-1 row-span-2 flex flex-1 flex-col px-10 py-6 text-textSecondary border border-border rounded-2xl bg-background select-none glow:ring-1 glow:border-glow glow:ring-glow glow:bg-glow/[.15] m-[2px] md:text-center">
                <div className="mt-3 mb-1.5 text-2xl">{tOffline('you_are_offline')}</div>
                <div className="">{tOffline('check_connection')}</div>
              </div>

              <div className="px-5 row-start-1 col-start-1 row-span-2 flex text-textSecondary pointer-events-none glow:text-glow m-1 justify-center">
                <div className="bg-background border border-border glow:border-glow glow:ring-1 glow:ring-glow rounded-full p-3">
                  <WifiOff />
                </div>
              </div>
            </div>
          </Glow>
        </div>
      </GlowCapture>
    )
  };
  
  if (isLoading) {
    return <Spinner />
  };

  if (!isLoggedIn) {
    return (
      <DynamicBg>
        <LoginForm />
      </DynamicBg>
    );
  };

  return (<>
    <GlowCapture className="print:hidden">
      <Nav />
      <div className="min-h-[calc(100vh-75px)] rounded-xl mx-auto max-w-[1200px]">
        <div className="flex">
          <div className="flex-grow p-4">
            {children}
          </div>
        </div>
      </div>
    </GlowCapture>
  </>);
}
