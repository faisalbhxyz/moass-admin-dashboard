"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Search, Clock, X } from "lucide-react";

const SEARCH_HISTORY_KEY = "searchHistory";
const MAX_HISTORY = 8;
const MAX_TRENDING = 9;

type HistoryItem = { query: string; searchedAt?: string };

export interface SearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  className?: string;
  /** Base URL for API (default same origin). */
  apiBase?: string;
}

function getGuestHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function setGuestHistory(queries: string[]) {
  try {
    const updated = queries.slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function SearchDropdown({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  className = "",
  apiBase = "",
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [trending, setTrending] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [guestHistory, setGuestHistoryState] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchTrending = useCallback(async () => {
    setLoadingTrending(true);
    try {
      const res = await fetch(`${apiBase}/api/search/trending`);
      if (res.ok) {
        const data = await res.json();
        setTrending(Array.isArray(data.trending) ? data.trending : []);
      }
    } catch {
      setTrending([]);
    } finally {
      setLoadingTrending(false);
    }
  }, [apiBase]);

  const fetchHistory = useCallback(async () => {
    if (isLoggedIn !== true) {
      setGuestHistoryState(getGuestHistory());
      return;
    }
    setLoadingHistory(true);
    try {
      const res = await fetch(`${apiBase}/api/search/history`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.history)
          ? data.history.map((h: { query: string; searchedAt?: string }) => ({
              query: h.query,
              searchedAt: h.searchedAt,
            }))
          : [];
        setHistory(list);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [apiBase, isLoggedIn]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/ecommerce/auth/me`, {
          credentials: "include",
        });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    })();
  }, [apiBase]);

  useEffect(() => {
    if (open) {
      if (isLoggedIn === true) fetchHistory();
      else setGuestHistoryState(getGuestHistory());
    }
  }, [open, isLoggedIn, fetchHistory]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filterBy = value.trim().toLowerCase();
  const filteredHistory = useMemo(() => {
    const list = isLoggedIn === true ? history.map((h) => h.query) : guestHistory;
    if (!filterBy) return list;
    return list.filter((q) => q.toLowerCase().includes(filterBy));
  }, [isLoggedIn, history, guestHistory, filterBy]);
  const filteredTrending = useMemo(() => {
    if (!filterBy) return trending;
    return trending.filter((q) => q.toLowerCase().includes(filterBy));
  }, [trending, filterBy]);

  const showHistorySection =
    (isLoggedIn === true && (history.length > 0 || loadingHistory)) ||
    (isLoggedIn !== true && guestHistory.length > 0);
  const showTrendingSection = trending.length > 0 || loadingTrending;

  const handleSubmit = useCallback(
    async (query: string) => {
      const q = query.trim();
      if (!q) return;
      setOpen(false);
      onChange(q);
      onSubmit(q);

      try {
        await fetch(`${apiBase}/api/search/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query: q }),
        });
      } catch {
        // continue with localStorage fallback for guest
      }

      if (isLoggedIn === false) {
        const prev = getGuestHistory();
        const updated = [q, ...prev.filter((x) => x !== q)].slice(0, MAX_HISTORY);
        setGuestHistory(updated);
        setGuestHistoryState(updated);
      } else if (isLoggedIn === true) {
        setHistory((prev) => [
          { query: q, searchedAt: new Date().toISOString() },
          ...prev.filter((h) => h.query !== q),
        ].slice(0, MAX_HISTORY));
      }
    },
    [apiBase, isLoggedIn, onChange, onSubmit]
  );

  const handleClearHistory = useCallback(async () => {
    if (isLoggedIn === true) {
      try {
        await fetch(`${apiBase}/api/search/history`, {
          method: "DELETE",
          credentials: "include",
        });
        setHistory([]);
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setGuestHistoryState([]);
    }
    setOpen(true);
  }, [apiBase, isLoggedIn]);

  const handleRemoveHistoryItem = useCallback(
    async (query: string) => {
      if (isLoggedIn === true) {
        try {
          await fetch(
            `${apiBase}/api/search/history?query=${encodeURIComponent(query)}`,
            { method: "DELETE", credentials: "include" }
          );
          setHistory((prev) => prev.filter((h) => h.query !== query));
        } catch {
          // ignore
        }
      } else {
        const prev = getGuestHistory().filter((q) => q !== query);
        setGuestHistory(prev);
        setGuestHistoryState(prev);
      }
    },
    [apiBase, isLoggedIn]
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-200">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(value);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          aria-label="Search"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
      </div>

      {open && (showHistorySection || showTrendingSection) && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[320px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
          role="listbox"
        >
          {showHistorySection && (
            <section className="px-3 pb-2">
              <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                আমার আগের খোঁজ
              </h3>
              {loadingHistory ? (
                <p className="py-2 text-sm text-gray-400">Loading...</p>
              ) : (
                <ul className="space-y-0.5">
                  {filteredHistory.slice(0, MAX_HISTORY).map((q) => (
                    <li key={q} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
                      <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left text-sm text-gray-900"
                        onClick={() => handleSubmit(q)}
                      >
                        {q}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHistoryItem(q);
                        }}
                        className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        aria-label={`Remove ${q}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!loadingHistory && filteredHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="mt-2 w-full rounded-md py-1.5 text-center text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  Clear History
                </button>
              )}
            </section>
          )}

          {showTrendingSection && (
            <section className="border-t border-gray-100 px-3 pt-2">
              <h3 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                Trending Now
              </h3>
              {loadingTrending ? (
                <p className="py-2 text-sm text-gray-400">Loading...</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {filteredTrending.slice(0, MAX_TRENDING).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSubmit(q)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                    >
                      <Search className="h-3.5 w-3.5 text-gray-400" />
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
