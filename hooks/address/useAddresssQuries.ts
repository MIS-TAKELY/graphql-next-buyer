import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import { useQuery } from "@apollo/client";

export const useAddressQueries = () => {
  const {
    data: addresses,
    loading: addressesLoading,
    error: addressesError,
  } = useQuery(GET_ADDRESS_OF_USER, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-and-network",
  });

  return {
    addresses,
    addressesLoading,
    addressesError,
  };
};
