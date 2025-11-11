import { GET_SEARCH_SUGGESTIONS } from "@/client/search/search.query";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/servers/utils/useDebounce";
import { useLazyQuery } from "@apollo/client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
}

const SearchBar = ({
  className,
  placeholder = "Search products...",
  isMobile = false,
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [previousSuggestions, setPreviousSuggestions] = useState<string[]>([]);
  const router = useRouter();

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Lazy query to fetch suggestions dynamically
  const [getSuggestions, { data, loading, error }] = useLazyQuery(
    GET_SEARCH_SUGGESTIONS,
    {
      fetchPolicy: "no-cache",
    }
  );

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      getSuggestions({ variables: { query: debouncedSearchQuery } });
      setActiveIndex(-1);
    }
  }, [debouncedSearchQuery, getSuggestions]);

  // Update previousSuggestions when new data is successfully fetched
  useEffect(() => {
    if (!loading && !error && data?.searchSuggestions) {
      setPreviousSuggestions(data.searchSuggestions);
    }
  }, [data, loading, error]);

  // Map GraphQL response to string array
  const suggestions: string[] = loading
    ? previousSuggestions
    : data?.searchSuggestions || [];

  // Handle selecting a suggestion (click or Enter key)
  const selectSuggestion = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    },
    [router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      selectSuggestion(searchQuery.trim());
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) selectSuggestion(suggestions[activeIndex]);
      else selectSuggestion(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-8 md:pl-10 pr-3 md:pr-4 h-8 md:h-10 text-xs md:text-sm lg:text-base bg-input text-foreground border-border placeholder-muted-foreground "
        />
      </div>

      {showSuggestions && searchQuery && (
        <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 z-10 max-h-48 md:max-h-60 overflow-y-auto">
          {error && (
            <div className="px-3 py-2 text-xs md:text-sm text-red-500">
              Error loading suggestions
            </div>
          )}
          {!error && suggestions.length === 0 && (
            <div className="px-3 py-2 text-xs md:text-sm">
              No suggestions found
            </div>
          )}
          {!error &&
            suggestions.map((suggestion, index) => (
              <Link
                href={`/search?q=${encodeURIComponent(suggestion)}`}
                key={index}
              >
                <div
                  className={`px-3 py-2 cursor-pointer text-xs md:text-sm lg:text-base ${
                    index === activeIndex
                      ? "bg-accent text-white"
                      : "text-popover-foreground hover:bg-accent hover:text-white"
                  }`}
                  onMouseDown={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {suggestion}
                </div>
              </Link>
            ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;