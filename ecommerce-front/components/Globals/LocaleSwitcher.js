import {useRouter} from 'next/router';
import {useTranslations} from 'next-intl';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem } from '../ui/dropdown-menu';

export default function LocaleSwitcher() {
  const tLocale = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const {locale, route} = useRouter();
  let {locales} = router;
  locales = locales.filter(loc => loc !== 'default');
  
  const setLocaleCookie = (locale) => {
    document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='flex items-center justify-center p-[7.5px] h-[31px]' variant="outline">
          <Image src={`/images/flags/${locale}.png`} alt={locale} width={20} height={20} className='max-w-[22px] min-w-[22px] max-h-[16px!important] min-h-[16px] rounded-[3px!important]' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {locales.map(loc => (
          <DropdownMenuItem key={loc} value={loc} 
            onClick={() => {
              setLocaleCookie(loc);
              router.push(route, route, { locale: loc })
            }}
          >
            <Image src={`/images/flags/${loc}.png`} alt={loc} width={20} height={20} className='my-[auto!important] mx-[0px!important] w-fit rounded-[3px!important]' />
            <span className="ml-2">{tLocale('switchLocale', {locale: loc})}</span>
            {locale === loc && <Check className='w-4 h-4 ml-auto'/>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}