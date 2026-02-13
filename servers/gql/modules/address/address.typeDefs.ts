import { gql } from "graphql-tag";
export const addressTypeDefs = gql`
  enum AddressType {
    SHIPPING
    BILLING
    BUSINESS
    WAREHOUSE
  }

  scalar DateTime

  type Address {
    id: ID!
    userId: String!
    type: AddressType!
    label: String
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
    phoneNumber: String
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  input AddAddressInput {
    type: String!
    label: String
    line1: String!
    line2: String
    city: String!
    state: String!
    country: String!
    postalCode: String!
    phoneNumber: String
    isDefault: Boolean!
  }

  input UpdateAddressInput {
    id: ID!
    type: String
    label: String
    line1: String
    line2: String
    city: String
    state: String
    country: String
    postalCode: String
    phoneNumber: String
    isDefault: Boolean
  }

  extend type Query {
    getAddress: [Address!]!
    getAddressOfUser: [Address]
  }

  extend type Mutation {
    addAddress(input: AddAddressInput): Boolean!
    updateAddress(input: UpdateAddressInput): Boolean!
    deleteAddressById(id: ID!): Boolean!
  }
`;
