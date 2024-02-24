import {useTheme} from "next-themes";
import {Switch} from "@nextui-org/react";
import { MoonIcon, SunIcon } from "@/Icons/Icons";
import { useEffect, useState } from "react";

export const ThemeSwitcher = () => {
  const ls = localStorage;
  let currentTheme = ls.getItem('theme')
  const { theme, setTheme } = useTheme(currentTheme);
  const [isSelected, setIsSelected] = useState(true);
  useEffect(() => {(
    currentTheme = ls.getItem('theme'),
    console.log(currentTheme),
    setTheme(currentTheme),
    setIsSelected(currentTheme === 'light' ? true : false),
    changeTheme(currentTheme)
  )}, []);

  function changeTheme() {
    if (isSelected) { 
        setTheme('dark');
        ls.setItem('theme', 'dark');
    } else if (!isSelected) { 
        setTheme('light');
        ls.setItem('theme', 'light');
    }
  };

  return (
    <Switch isSelected={isSelected} onValueChange={setIsSelected} onClick={() => changeTheme()} defaultSelected size="sm" color="primary"
        thumbIcon={({ isSelected, className }) => isSelected ? (<SunIcon height='16px' className={className} />) : (<MoonIcon className={className} />)}>
    </Switch>
  )
};
