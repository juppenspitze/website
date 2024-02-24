import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@nextui-org/react";
import { Chrome, Eye, EyeOff, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

export default function LoginForm() {
  const tLogin = useTranslations('Login');
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError(tLogin('invalid_credentials'));
        return;
      };
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const emailIsValid = email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);

  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <div className="relative m-6 sm:w-[420px] w-[calc(100vw-48px)] p-9 blurred rounded-2xl">
        <div className="w-full text-2xl text-center mb-6">{tLogin('welcome_back')}</div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col gap-3 items-center">
            <Input onChange={(e) => setEmail(e.target.value)} type="text" placeholder={tLogin('your_email')} label={tLogin('email')} isRequired 
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "shadow-xl",
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
            />
            <Input onChange={(e) => setPassword(e.target.value)} type={isVisible ? "text" : "password"} placeholder={tLogin('your_password')} label={tLogin('password')} isRequired
              classNames={{
                label: "text-black/50 dark:text-white/90",
                input: [
                  "bg-transparent",
                  "text-black/90 dark:text-white/90",
                  "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                ],
                innerWrapper: "bg-transparent",
                inputWrapper: [
                  "shadow-xl",
                  "bg-default-200/50",
                  "dark:bg-default/60",
                  "backdrop-blur-xl",
                  "backdrop-saturate-200",
                  "hover:bg-default-200/70",
                  "dark:hover:bg-default/70",
                  "group-data-[focused=true]:bg-default-200/50",
                  "dark:group-data-[focused=true]:bg-default/60",
                  "!cursor-text",
                ],
              }}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <Eye className="w-5 h-5 text-default-400 pointer-events-none" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-default-400 pointer-events-none" />
                  )}
                </button>
              } 
            />
          </div>

          {error && (
            <div className="mb-[-5px] mt-1 text-danger-500 text-sm">
              {error}
            </div>
          )}

          <button disabled={!email || !password || !emailIsValid} onClick={handleSubmit} type="submit" className="flex items-center justify-center gap-2 w-full mb-3 mt-6 p-3 bg-black bg-opacity-60 rounded-xl">
            <LogIn className="inline-block mr-2" size={20} />
            Login
          </button>
        </form>

        <div className="flex items-center mb-3">
          <div className="h-[1px] mt-[1px] w-full bg-border"></div>
          <div className="mx-4">{tLogin('or')}</div>
          <div className="h-[1px] mt-[1px] w-full bg-border"></div>
        </div>
        
        <button onClick={() => signIn('google')} type="submit" className="flex items-center justify-center gap-2 w-full p-3 text-background bg-slate-400 bg-opacity-60 rounded-xl">
          <Chrome className="inline-block mr-2" size={20} />
          {tLogin('login_with_google')}
        </button>
      </div>
    </div>
  );
};