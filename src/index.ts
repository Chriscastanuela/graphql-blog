import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

import { Query, Mutation } from './resolvers';

export interface Context {
    prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>
}

const server = new ApolloServer({
    typeDefs,
    resolvers: {
        Query,
        Mutation
    },
    context: {
        prisma
    }
})

server.listen().then(({url}) => {
    console.log(`Server ready on ${url}`)
})