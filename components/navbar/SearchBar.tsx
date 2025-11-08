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
}

const SearchBar = ({
  className,
  placeholder = "Search for products, brands and more",
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // for arrow navigation
  const [previousSuggestions, setPreviousSuggestions] = useState<string[]>([]); // store previous suggestions
  const router = useRouter();

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay

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
      setActiveIndex(-1); // reset selection on new input
      console.log("data-->",data)
    }
  }, [debouncedSearchQuery, getSuggestions]);

  // Update previousSuggestions when new data is successfully fetched
  useEffect(() => {
    if (!loading && !error && data?.searchSuggestions) {
      setPreviousSuggestions(data.searchSuggestions);
    }
  }, [data, loading, error]);

  // Map GraphQL response to string array
  const suggestions: string[] = loading ? previousSuggestions : (data?.searchSuggestions || []);

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
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-12 text-sm md:text-base bg-input text-foreground border-border placeholder-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5 text-[#0040c7]" />
        </button>
      </div>

      {showSuggestions && searchQuery && (
        <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
          {error && (
            <div className="px-4 py-2 text-sm text-red-500">
              Error loading suggestions
            </div>
          )}
          {!error && suggestions.length === 0 && (
            <div className="px-4 py-2 text-sm">No suggestions found</div>
          )}
          {!error &&
            suggestions.map((suggestion, index) => (
              <Link
                href={`http://localhost:3000/search?q=${encodeURIComponent(suggestion)}`}
                key={index}
              >
                <div
                  className={`px-4 py-2 cursor-pointer text-sm md:text-base ${
                    index === activeIndex
                      ? "bg-accent text-white"
                      : "text-popover-foreground hover:bg-accent hover:text-white"
                  }`}
                  onMouseDown={() => selectSuggestion(suggestion)} // use onMouseDown to avoid blur
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