export default function Spinner({fullwidth}) {
  return (
    <div className='flex justify-center mb-3'>
      <div className="rounded-md h-5 w-5 border-2 border-t-2 border-muted-foreground animate-spin"></div>
    </div>
  );
}