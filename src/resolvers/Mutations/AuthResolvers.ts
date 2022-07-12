import { Context } from '../../index';
import validator from 'validator';
import bcrypt from 'bcryptjs';

interface SignUpArgs {
    email:string
    bio:string
    name:string
    password:string
}

interface UserPayload {
    userErrors:{
        message:string
    }[];
    user:null
}

export const AuthResolvers = {
    signup: async(
        _:any, 
        { email, name, password, bio }:SignUpArgs, 
        { prisma }:Context
    ):Promise<UserPayload> => {
        const isEmail = validator.isEmail(email);
        const isLength = validator.isLength(password, {
            min:5
        })
        if(!isEmail){
            return {
                userErrors:[
                    {
                        message:"Invalid Email"
                    }
                ],
                user:null
            }
        }

        const isValidPassword = validator.isLength(password, {
            min:5
        })
        if(!isValidPassword){
            return {
                userErrors:[
                    {
                        message:"Invalid Password"
                    }
                ],
                user:null
            }
        }
        if(!name || !bio) {
            return {
                userErrors:[
                    {
                        message:"Invalid name or bio"
                    }
                ],
                user:null
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data:{
                email,
                name,
                password:hashedPassword
            }
        })
        return {
            userErrors:[],
            user:null
        }
    }
}