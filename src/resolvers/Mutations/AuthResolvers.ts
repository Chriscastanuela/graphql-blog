import { Context } from '../../index';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { UserInputError } from 'apollo-server';
import { JSON_SIGNATURE } from '../Keys';

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
    token:string|null
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
                token:null
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
                token:null
            }
        }
        if(!name || !bio) {
            return {
                userErrors:[
                    {
                        message:"Invalid name or bio"
                    }
                ],
                token:null
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data:{
                email,
                name,
                password:hashedPassword
            }
        })

        const token = await JWT.sign({
            userId:user.id 
        }, JSON_SIGNATURE,{
            expiresIn:360000
        });
        return {
            userErrors:[],
            token
        }
    }
}