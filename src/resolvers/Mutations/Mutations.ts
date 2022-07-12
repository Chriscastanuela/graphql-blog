import { AuthResolvers } from "./AuthResolvers";
import { PostResolvers } from "./PostResolvers";

export const Mutation = {
    ...PostResolvers,
    ...AuthResolvers
}