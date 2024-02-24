import {useRouter} from 'next/router';
import {useTranslations} from 'next-intl';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { Check } from 'lucide-react';
import Image from 'next/image';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const {locale, route} = useRouter();
  let {locales} = router;
  locales = locales.filter(loc => loc !== 'default');
  

  const setLocaleCookie = (locale) => {
    document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" className='flex items-center h-8 sm:w-8 w-fit min-w-fit sm:p-2'>
          <Image src={`/images/flags/${locale}.png`} alt={locale} width={20} height={20} className='my-auto max-w-[22px] max-h-[16px!important] rounded-[3px]' />
          <div className='sm:hidden'>{t('switchLocale', {locale: locale})}</div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Language picker menu">
        {locales.map(loc => (
          <DropdownItem 
            key={loc} 
            startContent={<Image src={`/images/flags/${loc}.png`} alt={loc} width={20} height={20} className='my-auto rounded-[3px]' />}
            endContent={locale === loc ? <Check className='w-4 h-4'/> : undefined}
            onClick={() => {
              setLocaleCookie(loc);
              router.push(route, route, { locale: loc })
            }}
          >
            {t('switchLocale', {locale: loc})}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}