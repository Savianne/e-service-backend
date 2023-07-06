"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getRefreshToken_1 = __importDefault(require("../mysql/getRefreshToken"));
dotenv_1.default.config();
function verifyUserMiddleware(request, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const req = request;
        if (config_1.default.allowCORS) {
            req.user = {
                name: "Mark Baylon",
                avatar: "http://localhost:3009/assets/images/avatar/apple.png",
                email: "www.ninzxky@gmail.com",
                UID: "CfBWlamSJ5eF6AL",
                role: "main admin"
            };
            return next();
        }
        const userCookie = req.cookies.user;
        if (!userCookie) {
            req.user = null;
            return next();
        }
        const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
        try {
            const decoded = jsonwebtoken_1.default.verify(userCookie, access_token_secret);
            req.user = decoded;
            return next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                const refreshTokenCookie = req.cookies.user_rt;
                if (!refreshTokenCookie) {
                    req.user = null;
                    return next();
                }
                const getRefreshTokenFrDb = yield (0, getRefreshToken_1.default)(refreshTokenCookie);
                const refreshTokenFrDb = getRefreshTokenFrDb;
                if (!refreshTokenFrDb.length || new Date().getTime() > new Date(refreshTokenFrDb[0].exp_date).getTime()) {
                    req.user = null;
                    return next();
                }
                const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
                try {
                    const decodedRefresh = jsonwebtoken_1.default.verify(refreshTokenFrDb[0].refresh_token, refresh_token_secret);
                    const userInfo = {
                        name: decodedRefresh.name,
                        avatar: decodedRefresh.avatar,
                        email: decodedRefresh.email,
                        UID: decodedRefresh.UID,
                        role: decodedRefresh.role
                    };
                    const newToken = jsonwebtoken_1.default.sign(userInfo, access_token_secret, { expiresIn: "1m" });
                    req.user = userInfo;
                    res.cookie('user', newToken);
                    return next();
                }
                catch (error) {
                    req.user = null;
                    return next();
                }
            }
            else {
                req.user = null;
                return next();
            }
        }
    });
}
exports.default = verifyUserMiddleware;
// import { Response, NextFunction } from 'express';
// import config from '../config';
// //Types
// import { IUserRequest } from '../types/IUserRequest';
// import { IUser } from '../types/IUser';
// import dotenv from 'dotenv';
// import jwt from 'jsonwebtoken';
// import getRefreshToken from '../mysql/getRefreshToken';
// dotenv.config();
// function verifyUserMiddleware(req: IUserRequest, res: Response, next: NextFunction) {
//     if(config.allowCORS) {
//         req.user = {
//             name: "Mark Baylon",
//             avatar: "http://localhost:3009/assets/images/avatar/apple.png",
//             email: "www.ninzxky@gmail.com",
//             UID: "CfBWlamSJ5eF6AL",
//             role: "main admin"
//         } as IUser
//         return next();
//     }
//     const userCookie = req.cookies.user;
//     if(!userCookie) {
//         req.user = null;
//         return next()
//     }
//     const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;
//     jwt.verify(userCookie, access_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
//         if(error) {
//             if(error instanceof jwt.TokenExpiredError) {
//                 const refreshTokenCookie = req.cookies.user_rt;
//                 if(!refreshTokenCookie) {
//                     req.user = null;
//                     return next()
//                 }
//                 const getRefreshTokenFrDb = await getRefreshToken(refreshTokenCookie);
//                 const refreshTokenFrDb = getRefreshTokenFrDb as any[];
//                 if(!refreshTokenFrDb.length) {
//                     req.user = null;
//                     return next();
//                 }
//                 if(new Date().getTime() > new Date(refreshTokenFrDb[0].exp_date).getTime()) {
//                     req.user = null;
//                     return next();
//                 }
//                 const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET as string;
//                 jwt.verify(refreshTokenFrDb[0].refresh_token, refresh_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
//                     if(error) {
//                         req.user = null;
//                         return next();
//                     }
//                     if(decoded) {
//                         const userDecoded = decoded as IUser;
//                         const userInfo = {
//                             name: userDecoded.name,
//                             avatar: userDecoded.avatar,
//                             email: userDecoded.email,
//                             UID: userDecoded.UID,
//                             role: userDecoded.role
//                         };
//                         const newToken = jwt.sign(userInfo, access_token_secret, { expiresIn: "1m" });
//                         req.user = userInfo;
//                         res.cookie('user', newToken);
//                         return next();
//                     }
//                 })
//             }
//         }
//         if(decoded) {
//             const userDecoded = decoded as IUser;
//             req.user = userDecoded;
//             next();
//         } else {
//             req.user = null;
//             return next();
//         }
//     })
// }
// export default verifyUserMiddleware; 
