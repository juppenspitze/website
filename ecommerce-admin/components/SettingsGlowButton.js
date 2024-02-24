import { useTranslations } from "next-intl";
import Link from "next/link";

export default function SettingsGlowButton({page,description,icon}) {
  const tSettingsCard = useTranslations('Settings');
  return (
    <Link href={`/settings/${page.toLowerCase()}`} className="grid grid-rows-[auto,auto,1fr] cursor-pointer">
      <div className="row-start-2 col-start-1 row-span-2 flex flex-1 flex-col px-5 py-4 text-textSecondary border border-border rounded-2xl bg-background select-none glow:ring-1 glow:border-glow glow:ring-glow glow:bg-glow/[.15] m-[2px] md:text-center">
        <div className="mt-3 mb-1.5 uppercase font-semibold">{tSettingsCard(page)}</div>
        <div className="text-xs">{description}</div>
      </div>

      <div className="px-5 row-start-1 col-start-1 row-span-2 flex text-textSecondary pointer-events-none glow:text-glow m-1 justify-center">
        <div className="bg-background border border-border glow:border-glow glow:ring-1 glow:ring-glow rounded-full p-3">
          {icon}
        </div>
      </div>
    </Link>
  );
};