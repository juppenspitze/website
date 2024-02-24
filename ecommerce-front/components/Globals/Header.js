import Link from "next/link";
import Center from "@/components/Globals/Center";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchComponent } from "./Search";
import { usePathname } from 'next/navigation';
import Sidebar from "../Cart/Sidebar/Sidebar";
import { Menu, X } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";
import { useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import axios from "axios";


export default function Header() {
  const tHeader = useTranslations('Header');
  const [mobileNavActive,setMobileNavActive] = useState(false);
  const [authors, setAuthors] = useState({});
  const [categories, setCategories] = useState({});
  const [isDataLoading, setIsDataLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchAuthors = async () => {
      const res = await axios.get('/api/authors');
      setAuthors(res.data);
    };
    const fetchCategories = async () => {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    };
    setIsDataLoading(true);
    fetchAuthors();
    fetchCategories();
    setIsDataLoading(false);
  }, []);

  const navButtons = [
    {href: '/products', name: 'all_products'},
    {href: '/account', name: 'account'},
  ];
  const navMenus = [
    {name: 'categories', items: categories},
    {name: 'authors', items: authors},
  ];
  return (
    <nav className={`bg-background sticky top-0 z-10 border-b border-muted-background backdrop-filter backdrop-blur-lg bg-opacity-50`}>
      <Center>
        <div className="flex items-center justify-between py-5 px-0">
          <Link className="relative text-foreground z-[3]" href={'/'}>Juppenspitze</Link>
          <nav className={`fixed top-0 bottom-0 left-0 right-0 gap-4 pt-16 px-5 py-5 sm:flex sm:static sm:p-0 ${mobileNavActive ? 'block' : 'hidden'}`}>
            {navButtons.map((btn,index) => (
              <Link href={btn.href}
                    key={`${btn.href}${index}`} 
                    className={`block min-w-[30px] px-2.5 py-0 capitalize max-sm:p-0 hover:text-foreground ${pathname.includes(btn.href) ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {tHeader(btn.name)}
              </Link>
            ))}
            <NavigationMenu className='flex gap-4'>
              {navMenus.map((menu,index) => (
                <NavigationMenuList key={`${menu.name}${index}`}>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={`flex items-center h-fit min-w-[30px] p-0 capitalize hover:text-foreground ${pathname.includes(menu.name) ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {tHeader(menu.name)}
                      <NavigationMenuIndicator />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className='p-1 pb-1.5'>
                      {isDataLoading ? <p>Loading...</p> : (<>
                        {menu.items?.length > 0 && menu.items.map((item,index) => (
                          <Link 
                            key={`${item._id}${index}`} 
                            href={`/${menu.name}/${item._id}`}
                            className='flex items-center rounded-sm px-2 py-1 text-base cursor-pointer hover:bg-accent'
                          >
                            {item.name || item.authorName}
                          </Link>
                        ))}
                      </>)}
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              ))}
            </NavigationMenu>
            
          </nav>
          <div className="flex sm:gap-3 gap-5 items-center">
            <LocaleSwitcher />
            <SearchComponent />
            <Sidebar />
            <button className="relative w-7 h-7 text-foreground bg-transparent z-[3] cursor-pointer sm:hidden"
              onClick={() => setMobileNavActive(prev => !prev)}
            >
              {mobileNavActive ? <X /> : <Menu className="text-foreground text-xs" />}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </Center>
    </nav>
  );
};