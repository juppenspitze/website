import { useEffect } from 'react';

function useHotKey(key, callback) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === key && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback]);
}

export default useHotKey;