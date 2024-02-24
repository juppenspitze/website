import { CircularProgress } from "@nextui-org/react";

export default function Spinner({noPadding}) {
  return (
    <div className={noPadding ? '' : 'pt-[20vh]'}>
      <div className="w-full flex justify-center">
        <CircularProgress aria-label="Loading..." />
      </div>
    </div>
  );
}