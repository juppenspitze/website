import { User } from "@nextui-org/react";
import {useSession} from "next-auth/react";

export default function HomeHeader() {
  const {data:session} = useSession();
  return (
    <div className="text-blue-900 flex justify-between">
      <User className="mb-4" name={session?.user?.name} description={session?.user?.email}
          avatarProps={{
            src: session?.user?.image
          }}
      />
    </div>
  );
}