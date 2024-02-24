import { useState } from "react";
import {useRouter} from "next/router";
import {signOut} from "next-auth/react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Link, Button} from "@nextui-org/react";
import LocaleSwitcher from "./LocaleSwitcher";
import {useTranslations} from 'next-intl';

export default function Nav() {
  const tNav = useTranslations('Nav');
  const router = useRouter();
  const {pathname} = router;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function logout() {
    await router.push('/');
    await signOut();
  };

  const menuItems = [
    {name: "products", url: `/products`},
    {name: "categories", url: "/categories"},
    {name: "orders", url: "/orders"},
    {name: "authors", url: "/authors"},
    {name: "settings", url: "/settings"},
  ];

  return (
    <Navbar className="bg-background print:hidden" onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? tNav('close_menu') : tNav('open_menu')}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href='/' className="font-bold text-inherit">ECOM</Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={`${item}-${index}`}>
            <Link className={pathname.includes(item.url) ? 'text-primary font-semibold' : ''} color="foreground" href={item.url}>
              {tNav(item.name)}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button as={Link} color="warning" size="md" variant="light" className="sm:flex hidden mt-[1px]" onClick={logout}>Log Out</Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link className={pathname.includes(item.url) ? 'w-full text-primary font-semibold' : 'w-full'} color="foreground" href={item.url} size="sm">
              {tNav(item.name)}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Link onClick={logout} color="danger" className="cursor-pointer">Log Out</Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}

