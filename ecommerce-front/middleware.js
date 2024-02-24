import { NextResponse } from 'next/server'
 
const PUBLIC_FILE = /\.(.*)$/
const AVAILABLE_LOCALES = ['en', 'de', 'at'];
 
export async function middleware(req) {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return;
  };
 
  if (req.nextUrl.locale === 'default') {
    let locale
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const countryCode = data?.country_code.toLowerCase();
    if (AVAILABLE_LOCALES.includes(countryCode)) locale = countryCode;
    else locale = req.cookies.get('NEXT_LOCALE')?.value || 'en';
 
    return NextResponse.redirect(
      new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
    );
  };

};