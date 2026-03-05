export const sellerProfileResolvers = {
    SellerProfile: {
        address: (parent: any) => parent.pickupAddress,
    },
};
