import { useSession } from 'next-auth/react';

function useIsLoggedIn() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isLoggedIn = !!session;

  return { isLoggedIn, isLoading };
}

export default useIsLoggedIn;