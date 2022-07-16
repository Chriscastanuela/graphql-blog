import { Post, Prisma } from '.prisma/client';
import { Context } from '../../index';
import { CanUserMutatePost } from '../../Utils/CanUserMutatePost';

interface PostArgs {
    post:{
        title?:string
        content?:string
    }
}

interface PostPayloadType {
    userErrors:{
        message:string
    }[],
    post:Post | Prisma.Prisma__PostClient<Post> | null
}

export const PostResolvers = {
    postCreate: async (
        _:any, 
        { post }:PostArgs, 
        { prisma, userInfo }: Context
    ): Promise<PostPayloadType> => {

        if(!userInfo) {
            return {
                userErrors:[{
                    message: "No access, unauthenticated",
                }],
                post:null
            }
        }

        const { title, content } = post;

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

        /* return data */
        return {
            userErrors: [],
            post: prisma.post.create({
                data: {
                    title,
                    content,
                    authorId:userInfo.userId
                }
            })
        }
    },
    postUpdate:async (
        _:any,
        { post, postId }:{postId:string, post:PostArgs['post']},
        { prisma, userInfo }: Context
    ): Promise<PostPayloadType> => {
        if(!userInfo) {
            return {
                userErrors:[{
                    message: "No access, unauthenticated",
                }],
                post:null
            }
        }
        const error = await CanUserMutatePost({
            userId:userInfo.userId,
            postId:Number(postId),
            prisma
        })
        if(error) return error; 
        const { title, content } = post;
        if(!title && !content) {
            return {
                userErrors: [
                    {
                        message: 'Need at least one field updated'
                    }
                ],
                post:null
            }   
        };
        const existingPost = await prisma.post.findUnique({
            where: {
                id:Number(postId)
            }
        });
        if(!existingPost) {
            return {
                userErrors: [
                    {
                        message: 'Post ID does not exist'
                    }
                ],
                post:null
            }   
        };
        let payLoadToUpdate = {
            title,
            content
        }
        if(!title)delete payLoadToUpdate[`title`];
        if(!content)delete payLoadToUpdate[`content`];
        return {
            userErrors: [],
            post: prisma.post.update({
                data: {
                    ...payLoadToUpdate
                },
                where: {
                    id: Number(postId),
                }
            })
        }
    },
    postDelete:async(
        _:any, 
        { postId }:{postId:string},
        { prisma, userInfo }:Context
    ): Promise<PostPayloadType> => {
        if(!userInfo) {
            return {
                userErrors:[{
                    message: "No access, unauthenticated",
                }],
                post:null
            }
        }
        const error = await CanUserMutatePost({
            userId:userInfo.userId,
            postId:Number(postId),
            prisma
        })
        if(error) return error;
        const post = await prisma.post.findUnique({
            where: {
                id:Number(postId)
            }
        })
        if(!post) {
            return {
                userErrors: [
                    {
                        message: 'Post ID does not exist'
                    }
                ],
                post:null
            }   
        };
        await prisma.post.delete({
            where: {
                id:Number(postId)
            }
        });
        return {
            userErrors:[],
            post
        }
    }
}