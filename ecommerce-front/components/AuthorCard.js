import Image from "next/image";
import Link from "next/link";

export default function AuthorCard({author}) {
  return (
    <Link href={`/authors/${author._id}`}>
      <div className="max-w-[364px] h-fit rounded-md p-4">
        <div className='relative w-full h-28 overflow-hidden'>
         {author.image && <Image src={author.image} width={100} height={100} />}
        </div>
        <div className="text-xl text-center font-semibold">{author.authorName}</div>
      </div>
    </Link>
  );
};