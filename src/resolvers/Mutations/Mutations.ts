import { AuthResolvers } from "./AuthResolvers";
import { PostResolvers } from "./PostResolvers";

export const Mutations = {
    ...PostResolvers,
    ...AuthResolvers
}