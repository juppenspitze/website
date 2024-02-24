import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from 'next/router';

export default function BackButton() {
  const tBack = useTranslations('Buttons');
  const router = useRouter();
  return (<>
    <button onClick={() => router.back()} className="flex items-center gap-1 py-2 pr-3 pl-1.5 transition-all duration-200 hover:scale-110">
      <ChevronLeft/>{tBack('back')}
    </button>
  </>)
};