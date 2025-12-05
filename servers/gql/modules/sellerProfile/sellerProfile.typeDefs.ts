import { gql } from "graphql-tag";

export const sellerProfileTypeDefs = gql`
  enum VerificationStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type SellerProfile {
    id: ID!
    userId: ID!
    shopName: String!
    slug: String!
    logo: String
    banner: String
    description: String
    tagline: String
    businessName: String
    businessRegNo: String
    businessType: String
    phone: String!
    altPhone: String
    email: String
    verificationStatus: VerificationStatus!
    verifiedAt: DateTime
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    address: Address
  }


  
`;

