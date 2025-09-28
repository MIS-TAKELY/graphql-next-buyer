import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";

export type FilterState = {
  activeTab: "all" | "verified" | "featured";
  sortBy: "newest" | "oldest" | "highest" | "lowest" | "helpful";
  filterRating: "all" | "1" | "2" | "3" | "4" | "5";
};

export const ReviewFilters = ({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (v: FilterState) => void;
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <Tabs
        value={value.activeTab}
        onValueChange={(activeTab) =>
          onChange({
            ...value,
            activeTab: activeTab as FilterState["activeTab"],
          })
        }
        className="w-full sm:w-auto"
      >
        <TabsList className="grid w-full grid-cols-3 sm:w-auto">
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-3 w-full sm:w-auto">
        <Select
          value={value.filterRating}
          onValueChange={(filterRating) =>
            onChange({
              ...value,
              filterRating: filterRating as FilterState["filterRating"],
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.sortBy}
          onValueChange={(sortBy) =>
            onChange({ ...value, sortBy: sortBy as FilterState["sortBy"] })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
