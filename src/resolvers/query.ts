import { Context } from "../";

export const Query = {
    me:(
        _:any,
        __:any,
        {
            userInfo,
            prisma
        }:Context
    ) => {
        if(!userInfo) return null;
        return prisma.user.findUnique({
            where:{
                id:userInfo.userId,
            }
        })
    },
    posts: (
        _:any,
        __:any,
        { prisma }: Context
    ) => {
        return prisma.post.findMany({
            orderBy: [
                {
                    createdAt:"desc",
                },
            ]
        });
    }
}