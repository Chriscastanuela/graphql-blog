// Imports
import { Context } from '../../index';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { JSON_SIGNATURE } from '../Keys';

// Types
interface SignUpArgs {
    credentials:{
        email:string,
        password:string
    }
    bio:string
    name:string
}

interface SignInArgs {
    credentials:{
        email:string,
        password:string
    }
}

interface UserPayload {
    userErrors:{
        message:string
    }[];
    token:string|null
}

// Resolvers
export const AuthResolvers = {

    // Signup resolver
    signup: async(
        _:any, 
        { credentials, name, bio }:SignUpArgs, 
        { prisma }:Context
    ):Promise<UserPayload> => {
        const { email, password } = credentials;
        const isEmail = validator.isEmail(email);
        const isValidPassword = validator.isLength(password, {
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password:hashedPassword
            }
        });

        // Create Profile
        await prisma.profile.create({
            data: {
                bio,
                userId:user.id
            }
        });

        //Return token
        return {
            userErrors:[],
            token:await JWT.sign({
                userId:user.id
            }, JSON_SIGNATURE,{
                expiresIn:360000
            })
        };
    },
    signin: async (
        _:any, 
        { credentials }:SignInArgs, 
        { prisma }:Context
    ):Promise<UserPayload> => {
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!user) {
            return {
                userErrors:[
                    {
                        message:"Invalid credentials"
                    }
                ],
                token:null
            }
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return {
                userErrors:[
                    {
                        message:"Invalid credentials"
                    }
                ],
                token:null
            }
        }
        return {
            userErrors:[],
            token:JWT.sign({userId:user.id}, JSON_SIGNATURE, {
                expiresIn:360000
            })
        };
    }
}