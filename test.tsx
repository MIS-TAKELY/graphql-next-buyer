import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import AccountClient from "@/components/page/account/AccountClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";

// Define TypeScript types
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Address {
  id: string;
  address: string;
  city: string;
  country: string;
}

interface InitialData {
  addresses?: Address[];
  userProfile?: { getUserProfileDetails: Omit<UserProfile, "__typename"> };
}

const mockUser: UserProfile = {
  id: "1",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let initialData: InitialData = {};

  try {
    const client = await getServerApolloClient();

    // Fetch data in parallel
    const [userProfileRes, addressesRes] = await Promise.all([
      client.query({
        query: GET_USER_PROFILE_DETAILS,
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      }),
      client.query({
        query: GET_ADDRESS_OF_USER,
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      }),
    ]);

    const userProfileDetails = userProfileRes.data?.getUserProfileDetails;
    const addressesData = addressesRes.data?.getAddressOfUser;

    // Handle user profile data
    if (userProfileDetails) {
      const { __typename, ...cleanProfile } = userProfileDetails;
      initialData.userProfile = { getUserProfileDetails: cleanProfile };
      client.cache.writeQuery({
        query: GET_USER_PROFILE_DETAILS,
        data: { getUserProfileDetails: cleanProfile },
      });
    }

    // Handle addresses data
    if (addressesData) {
      const cleanedAddresses = addressesData.map(({ __typename, ...clean }) => clean);
      initialData.addresses = cleanedAddresses;
      client.cache.writeQuery({
        query: GET_ADDRESS_OF_USER,
        data: { getAddressOfUser: cleanedAddresses },
      });
    }
  } catch (error) {
    console.error("Server prefetch failed:", error);
    // Fallback to mock data on error
    initialData.userProfile = { getUserProfileDetails: mockUser };
    initialData.addresses = []; // Empty array as fallback
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <SSRApolloProvider initialData={initialData}>
            <AccountClient user={mockUser} />
          </SSRApolloProvider>
        </div>
      </div>
    </div>
  );
}