import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { PrismaClient, Prisma } from '@prisma/client';
import { Query, Mutation, Profile } from './Resolvers';
import { getUserFromToken } from './Utils/GetUserFromToken';

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient<
    Prisma.PrismaClientOptions, 
    never, 
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >
    userInfo: {
        userId: number;
    } | null;
}

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Query,
        Mutation,
        Profile
    },
    context: async ({ req }:any): Promise<Context> => {
        const userInfo = await getUserFromToken(req.headers.authorization);
        return {
            prisma,
            userInfo
        };
    },
});

server.listen().then(({url}) => {
    console.log(`Server ready on ${url}`)
});