import { Post } from '.prisma/client';
import { Context } from '../index';

interface PostCreateArgs {
    title:string,
    content:string
}

interface PostPayloadType {
    userErrors:{
        message:string
    }[],
    post:Post | null
}

export const Mutation = {
    postCreate: async (
        _:any, 
        {title, content}:PostCreateArgs, 
        { prisma }: Context
    ): Promise<PostPayloadType> => {

        /* If either argument does not exist */
        if(!title || !content) {
            return {
                userErrors: [{
                    message: "You must provide a title and content to create this post"
                }],
                post:null
            }
        }

        /* Create a post if both arguments do exist */
        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId:1
            }
        })

        /* return data */
        return {
            userErrors: [],
            post
        }
    }
}