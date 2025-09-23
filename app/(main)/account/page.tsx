export const dynamic = "force-dynamic";
import { GET_ADDRESS_OF_USER } from "@/client/address/address.queries";
import { GET_USER_PROFILE_DETAILS } from "@/client/user/user.queries";
import AccountClient from "@/components/page/account/AccountClient";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { SSRApolloProvider } from "@/lib/apollo/apollo-wrapper";

const mockUser = {
  id: "1",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
};

export default async function AccountPage() {
  let initialData: { addresses?: any[]; userProfile?: any } = {};

  try {
    const client = await getServerApolloClient();

    console.time("db-fetch");
    // Run both queries in parallel
    // const [userProfileRes, addressesRes] = await Promise.all([
    //   client.query({
    //     query: GET_USER_PROFILE_DETAILS,
    //     fetchPolicy: "no-cache",
    //     errorPolicy: "all",
    //   }),
    //   client.query({
    //     query: GET_ADDRESS_OF_USER,
    //     fetchPolicy: "no-cache",
    //     errorPolicy: "all",
    //   }),
    // ]);

    const userProfileRes = await client.query({
      query: GET_USER_PROFILE_DETAILS,
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    });

    const userProfileDetails = userProfileRes.data;
    const addressesData = userProfileRes.data.addresses;

    console.log("user profile details", userProfileDetails);
    // console.log("addressesData", addressesData);

    // Write user profile to cache
    if (userProfileDetails?.getUserProfileDetails) {
      client.cache.writeQuery({
        query: GET_USER_PROFILE_DETAILS,
        data: userProfileDetails,
      });
    }

    console.timeEnd("db-fetch");

    // Clean & write addresses to cache
    if (addressesData?.getAddressOfUser) {
      const cleanedAddresses = addressesData.getAddressOfUser.map(
        (addr: any) => {
          const { __typename, ...clean } = addr;
          return clean;
        }
      );

      client.cache.writeQuery({
        query: GET_ADDRESS_OF_USER,
        data: { getAddressOfUser: cleanedAddresses },
      });

      initialData.addresses = cleanedAddresses;
    }

    // Keep hydrated user profile
    if (userProfileDetails?.getUserProfileDetails) {
      const { __typename, ...cleanProfile } =
        userProfileDetails.getUserProfileDetails;
      initialData.userProfile = { getUserProfileDetails: cleanProfile };
    }
  } catch (error) {
    console.error("Server prefetch failed:", error);
  }

  return (
    <div className="min-h-screen ">
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
