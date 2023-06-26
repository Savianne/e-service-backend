import { Response, NextFunction } from 'express';
import config from '../config';

//Types
import { IUserRequest } from '../types/IUserRequest';
import { IUser } from '../types/IUser';

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import getRefreshToken from '../mysql/getRefreshToken';

dotenv.config();

function verifyUserMiddleware(req: IUserRequest, res: Response, next: NextFunction) {
    if(config.allowCORS) {
        req.user = {
            name: "Mark Baylon",
            avatar: "http://localhost:3009/assets/images/avatar/apple.png",
            email: "www.ninzxky@gmail.com",
            UID: "CfBWlamSJ5eF6AL",
            role: "main admin"
        } as IUser

        return next();
    }

    const userCookie = req.cookies.user;
    
    if(!userCookie) {
        req.user = null;
        return next()
    }

    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

    jwt.verify(userCookie, access_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(error) {
            if(error instanceof jwt.TokenExpiredError) {
                const refreshTokenCookie = req.cookies.user_rt;
                if(!refreshTokenCookie) {
                    req.user = null;
                    return next()
                }

                const getRefreshTokenFrDb = await getRefreshToken(refreshTokenCookie);

                const refreshTokenFrDb = getRefreshTokenFrDb as any[];
                
                if(!refreshTokenFrDb.length) {
                    req.user = null;
                    return next();
                }
                
                if(new Date().getTime() > new Date(refreshTokenFrDb[0].exp_date).getTime()) {
                    req.user = null;
                    return next();
                }

                const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET as string;

                jwt.verify(refreshTokenFrDb[0].refresh_token, refresh_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
                    if(error) {
                        req.user = null;
                        return next();
                    }
                    
                    if(decoded) {
                        const userDecoded = decoded as IUser;
                        const userInfo = {
                            name: userDecoded.name,
                            avatar: userDecoded.avatar,
                            email: userDecoded.email,
                            UID: userDecoded.UID,
                            role: userDecoded.role
                        };
                        const newToken = jwt.sign(userInfo, access_token_secret, { expiresIn: "1m" });
                        req.user = userInfo;
                        res.cookie('user', newToken);
                        return next();
                    }
                })
            }

        }

        if(decoded) {
            const userDecoded = decoded as IUser;
    
            req.user = userDecoded;
    
            next();
        } else {
            req.user = null;
            return next();
        }
    })

}

export default verifyUserMiddleware; 