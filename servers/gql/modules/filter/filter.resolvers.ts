import { getDynamicFilters } from "@/filter/getFilters";

export const filterResolvers = {
  Query: {
    getDynamicFilters: async (_: any, args: { searchTerm: string }) => {
      const { searchTerm } = args;
      return await getDynamicFilters(searchTerm);
    },
  },
};
