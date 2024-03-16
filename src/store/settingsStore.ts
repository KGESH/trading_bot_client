export const useLocalStorage = () => {
  const set = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const get = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  return { set, get };
};
