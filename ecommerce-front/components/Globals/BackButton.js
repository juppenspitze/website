import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/router';
import { useTranslations } from "next-intl";

export default function BackButton() {
  const tBackButton = useTranslations('Buttons');
  const router = useRouter();
  return (<>
    <button onClick={() => router.back()} className="flex items-center mt-3 gap-1 py-2 pr-3 pl-1.5 transition-all duration-200 hover:scale-110">
      <ChevronLeft/>{tBackButton('back')}
    </button>
  </>)
};