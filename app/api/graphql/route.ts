import { createContext } from "@/servers/gql/context";
import { createYoga } from "graphql-yoga";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import type { NextRequest } from "next/server";
import { schema } from "../../../servers/gql/index";

const yoga = createYoga<{
  req: NextRequest;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Request, Response },
  context: async ({ request }: { request: NextRequest }) => {
    return await createContext(request);
  },
  graphiql: process.env.NODE_ENV !== "production",
  plugins: [
    process.env.NODE_ENV === "production" && {
      onValidate({ addValidationRule }: { addValidationRule: any }) {
        addValidationRule(NoSchemaIntrospectionCustomRule);
      },
    },
  ].filter(Boolean) as any,
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
          "https://vanijay.com",
          "https://www.vanijay.com",
          "https://graphql-next-buyer.vercel.app",
          "https://graphql-next-buyer-hmu9c58z1-mailitttome-4974s-projects.vercel.app",
        ]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});

export async function GET(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    !request.nextUrl.searchParams.has("query")
  ) {
    return Response.redirect(new URL("/", request.url));
  }
  return yoga.handleRequest(request, { req: request });
}

export async function POST(request: NextRequest) {
  return yoga.handleRequest(request, { req: request });
}