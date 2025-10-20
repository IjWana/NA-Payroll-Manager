import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children, debounceMs = 300 }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const value = useMemo(() => ({
    query,
    setQuery,
    debouncedQuery: debounced,
    clear: () => setQuery(''),
  }), [query, debounced]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider');
  return ctx;
}