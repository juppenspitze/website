import axios from "axios";
import Link from "next/link";
import Spinner from "./Spinner";
import { debounce } from "lodash";
import { useState,useEffect, useCallback } from "react"
import { Search,ScrollText,Settings,Tags,Home,BookOpenText,ShoppingCart } from "lucide-react"
import { CommandDialog,CommandGroup,CommandItem,CommandList,CommandSeparator,CommandShortcut } from "@/components/ui/command"
import { currencyForm } from "@/lib/handlers";
import { useTranslations } from "next-intl";

export function SearchComponent() {
  const tSearch = useTranslations('Search');

  const [phrase,setPhrase] = useState('');
  const [products,setProducts] = useState([]);
  const [categories,setCategories] = useState([]);
  const [authors,setAuthors] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  const debouncedSearch = useCallback(
    debounce(searchAll, 500), []
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      };
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    let pageDown;
    if (open) {
      pageDown = (e) => {
        // to home
        if (open && e.key === "h" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          window.location.href = "/";
        };
        // to products
        if (open && e.key === "p" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          window.location.href = "/products";
        };
        // to categories
        if (open && e.key === "c" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          window.location.href = "/categories";
        };
        // to cart
        if (open && e.key === "b" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          window.location.href = "/cart";
        };
        // to account
        if (open && e.key === "a" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          window.location.href = "/account";
        };
      };

      document.addEventListener("keydown", pageDown);
    };

    if (open === false) {
      document.removeEventListener("keydown", pageDown);
    };
  }, [open]);

  useEffect(() => {
    if (phrase.length > 0) {
      setIsLoading(true);
      debouncedSearch(phrase);
    } else {
      setProducts([]);
      setCategories([]);
      setAuthors([]);
    }
  }, [phrase]);

  async function searchProducts(phrase) {
    const response = await axios.get('/api/products?phrase='+encodeURIComponent(phrase));
    setProducts(response.data);
  };
  async function searchCategories(phrase) {
    const response = await axios.get('/api/categories?phrase='+encodeURIComponent(phrase));
    setCategories(response.data);
  };
  async function searchAuthors(phrase) {
    const response = await axios.get('/api/authors?phrase='+encodeURIComponent(phrase));
    setAuthors(response.data);
  };

  async function searchAll(phrase) {
    await Promise.all([
      searchProducts(phrase),
      searchCategories(phrase),
      searchAuthors(phrase),
    ]);
    setIsLoading(false);
  };

  const pageButtons = [
    {href: '/', name: 'home', icon: <Home className="mr-2 h-4 w-4" />, shortcut: 'h'},
    {href: '/products', name: 'products', icon: <ScrollText className="mr-2 h-4 w-4" />, shortcut: 'p'},
    {href: '/categories', name: 'categories', icon: <Tags className="mr-2 h-4 w-4" />, shortcut: 'c'},
    {href: '/cart', name: 'cart', icon: <ShoppingCart className="mr-2 h-4 w-4" />, shortcut: 'b'},
    {href: '/authors', name: 'authors', icon: <BookOpenText className="mr-2 h-4 w-4" />, shortcut: 'd'},
    {href: '/account', name: 'account', icon: <Settings className="mr-2 h-4 w-4" />, shortcut: 'a'},
  ];

  return (
    <>
      <button className="flex items-center gap-4 px-2 py-1 bg-background rounded-md max-sm:border-none border border-solid border-muted-foreground" onClick={() => setOpen(!open)}>
        <Search className="h-4 w-4 text-foreground text-sm" />
        <div className="max-sm:hidden text-sm text-muted-foreground">
          {tSearch('press')}{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>J
          </kbd>
        </div>
      </button>
  
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 opacity-50" />
          <input value={phrase} onChange={ev => setPhrase(ev.target.value)} placeholder={tSearch('search_for_stuff')} autoFocus={true}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <CommandList>
          {!isLoading && phrase !== '' && (products.length === 0 && categories.length === 0 && authors.length === 0) && (
            <div className="py-4 text-center text-muted-foreground">{tSearch('nothing_found_for', {query: phrase})}</div>
          )}
          {products.length > 0 && (<>
            <CommandGroup heading={tSearch('products')}>
              {isLoading && (
                <Spinner />
              )}
              {!isLoading && products.length > 0 && products.map(product => (
                <Link key={`${product._id}+searched`} href={'/products/'+product._id}>
                  <CommandItem className="cursor-pointer">
                    <span className="mr-4">{product.title}</span>
                    <CommandShortcut>{currencyForm(product.price)}</CommandShortcut>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </>)}
          {categories.length > 0 && (<>
            <CommandGroup heading={tSearch('categories')}>
              {categories.map(category => (
                <Link key={`${category._id}+searched`} href={'/categories/'+category._id}>
                  <CommandItem className="cursor-pointer">
                    <span className="mr-4">{category.name}</span>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </>)}
          {authors.length > 0 && (<>
            <CommandGroup heading={tSearch('authors')}>
              {authors.map(author => (
                <Link key={`${author._id}+searched`} href={'/authors/'+author._id}>
                  <CommandItem className="cursor-pointer">
                    <span className="mr-4">{author.authorName}</span>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          </>)}
          <CommandSeparator />
          <CommandGroup heading={tSearch('pages')}>
            {pageButtons.map((btn,index) => (
              <Link  href={btn.href} key={`${btn.href}${index}`}>
                <CommandItem className="cursor-pointer">
                  {btn.icon && btn.icon}
                  <span>{tSearch(btn.name)}</span>
                  <CommandShortcut className='capitalize'>⌘{btn.shortcut}</CommandShortcut>
                </CommandItem>
              </Link>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
