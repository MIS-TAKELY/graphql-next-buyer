import { Client } from "@opensearch-project/opensearch";

console.log("connecting....")

export const opensearchClient = new Client({
  node: "https://ip-54-190-240-3.5297655623e44b18a4d3b5fcd589b1f8.cnodes.io:9200",
  auth: {
    username: "icopensearch",
    password: "ef584c69831d9bc1d01943b1a267a337",
  },
  ssl: {
    rejectUnauthorized: false,
  },
  requestTimeout: 60000
});
console.log("connected")

export const PRODUCT_INDEX = "products";
export const EMBEDDING_DIMENSION = 384;
