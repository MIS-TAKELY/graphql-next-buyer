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
    <form onSubmit={handleSearch} className={`relative ${className} w-full`}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 h-10 text-sm bg-secondary/30 focus:bg-background border-transparent focus:border-primary/20 hover:bg-secondary/50 transition-all duration-200 rounded-full"
        />
      </div>

      {showSuggestions && searchQuery && (
        <div className="absolute top-full left-0 right-0 bg-popover/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg mt-2 z-50 max-h-64 overflow-y-auto animate-fade-in custom-scrollbar">
          {error && (
            <div className="px-4 py-3 text-sm text-destructive">
              Error loading suggestions
            </div>
          )}
          {!error && suggestions.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
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
                  className={`px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 ${index === activeIndex
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
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