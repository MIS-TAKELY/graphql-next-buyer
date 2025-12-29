import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import gql from "graphql-tag";
import { addressResolvers } from "./modules/address/address.resolvers";
import { addressTypeDefs } from "./modules/address/address.typeDefs";
import { brandTypeDefs } from "./modules/brand/brand.typedefs";
import { cartItemResolvers } from "./modules/cartItem/cart.resolvers";
import { cartItemTypeDefs } from "./modules/cartItem/cartitem.typedefs";
import { categoryResolvers } from "./modules/category/category.resolvers";
import { categoryTypeDefs } from "./modules/category/category.typeDefs";
import { categorySpecificationsTypeDefs } from "./modules/categorySpecification/categorySpecification.typeDefs";
import { categorySpecificationResolvers } from "./modules/categorySpecification/categorySpecifications.resolvers";
import { conversationResolvers } from "./modules/conversation/conversation.resolvers";
import { conversationTypedefs } from "./modules/conversation/conversaton.typeDefs";
import { deliveryTypedefs } from "./modules/delivery/delivery.typeDefs";
import { faqResolvers } from "./modules/faq/faq.resolvers";
import { faqTypeDefs } from "./modules/faq/faq.typeDefs";
import { filterResolvers } from "./modules/filter/filter.resolvers";
import { filterTypeDefs } from "./modules/filter/filter.typeDefs";
import { topDealsResolvers } from "./modules/landingPage/topDeals/topDeals.resolvers";
import { topDealsTypeDefs } from "./modules/landingPage/topDeals/topDeals.typeDefs";
import { landingPageResolvers } from "./modules/landingPage/landingPage.resolvers";
import { landingPageTypeDefs } from "./modules/landingPage/landingPage.typeDefs";
import { bannerResolvers } from "./modules/landingPage/banner/banner.resolvers";
import { bannerTypeDefs } from "./modules/landingPage/banner/banner.typeDefs";
import { messageResolvers } from "./modules/message/message.resolvers";
import { messageTypedefs } from "./modules/message/message.typeDefs";
import { offerTypeDefs } from "./modules/offer/offer.typedefs";
import { orderResolvers } from "./modules/order/order.resolvers";
import { orderTypeDefs } from "./modules/order/order.typeDefs";
import { orderItemTypeDefs } from "./modules/orderItem/orderItem.typeDefs";
import { paymentResolvers } from "./modules/payment/payment.resolvers";
import { paymentTypeDefs } from "./modules/payment/payment.typeDefs";
import { paymentMethodTypeDefs } from "./modules/paymentMethod/paymentMethod.typeDefs";
import { payoutTypeDefs } from "./modules/payout/payout.typeDefs";
import { productImageTypeDefs } from "./modules/productImage/productImage.typeDefs";
import { productResolvers } from "./modules/products/product.resolvers";
import { productTypeDefs } from "./modules/products/product.typeDefs";
import { productSpecificationTypeDefs } from "./modules/productSpecification/productSpecification.typeDefs";
import { productVariantTypeDefs } from "./modules/productVariant/productVariant.typeDefs";
import { returnTypedefs } from "./modules/return/return.typeDefs";
import { reviewResolvers } from "./modules/review/review.resolvers";
import { reviewTypeDefs } from "./modules/review/review.typeDefs";
import { searchResolvers } from "./modules/search/search.resolvers";
import { searchTypeDef } from "./modules/search/search.typeDef";
import { sellerOrderTypeDefs } from "./modules/sellerOrder/sellerOrder.typeDefs";
import { sellerOrderItemTypeDefs } from "./modules/sellerOrderItem/sellerOrderItem.typeDefs";
import { sellerProfileTypeDefs } from "./modules/sellerProfile/sellerProfile.typeDefs";
import { shipmentTypeDefs } from "./modules/shipment/shipment.typeDefs";
import { userResolvers } from "./modules/user/user.resolvers";
import { userTypeDefs } from "./modules/user/user.typeDefs";
import { warrentyTypeDefs } from "./modules/warrenty/warrenty.typeDefs";
import { wishlistResolvers } from "./modules/wishlist/wishlist.resolvers";
import { wishlistTypeDefs } from "./modules/wishlist/wishlist.typeDefs";
import { productNotificationResolvers } from "./modules/productNotification/productNotification.resolvers";
import { productNotificationTypeDefs } from "./modules/productNotification/productNotification.schema";

const rootTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const typeDefs = mergeTypeDefs([
  rootTypeDefs,
  addressTypeDefs,
  brandTypeDefs,
  cartItemTypeDefs,
  categoryTypeDefs,
  categorySpecificationsTypeDefs,
  deliveryTypedefs,
  orderTypeDefs,
  orderItemTypeDefs,
  paymentTypeDefs,
  paymentMethodTypeDefs,
  payoutTypeDefs,
  productImageTypeDefs,
  productTypeDefs,
  productSpecificationTypeDefs,
  productVariantTypeDefs,
  reviewTypeDefs,
  sellerOrderTypeDefs,
  sellerOrderItemTypeDefs,
  shipmentTypeDefs,
  userTypeDefs,
  wishlistTypeDefs,
  offerTypeDefs,

  returnTypedefs,
  warrentyTypeDefs,
  messageTypedefs,
  conversationTypedefs,
  searchTypeDef,
  faqTypeDefs,
  filterTypeDefs,
  topDealsTypeDefs,
  landingPageTypeDefs,
  sellerProfileTypeDefs,
  bannerTypeDefs,
  productNotificationTypeDefs,
]);

import { GraphQLScalarType, Kind } from 'graphql';

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    // value sent to the client
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  },
  parseValue(value: any) {
    // value from the client
    return new Date(value);
  },
  parseLiteral(ast) {
    // value from the client query
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const resolvers = mergeResolvers([
  { DateTime: DateTime }, // Add the scalar resolver here
  addressResolvers,
  productResolvers,
  categoryResolvers,
  categorySpecificationResolvers,
  cartItemResolvers,
  userResolvers,
  addressResolvers,
  orderResolvers,
  paymentResolvers,
  reviewResolvers,
  conversationResolvers,
  wishlistResolvers,
  messageResolvers,
  searchResolvers,
  faqResolvers,
  filterResolvers,
  topDealsResolvers,
  landingPageResolvers,
  bannerResolvers,
  productNotificationResolvers,
]);

export const schema = makeExecutableSchema({ typeDefs, resolvers });
