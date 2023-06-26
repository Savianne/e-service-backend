import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../types/IUser";

const getPendingUserLogin = (req: Request, res: Response) => {
    const pendingUserLoginCookie = req.cookies.pendingUserLogin;
    if(!pendingUserLoginCookie) {
      return res.status(404).send("No pending user login");
    }
  
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;
  
    jwt.verify(pendingUserLoginCookie, access_token_secret, (error: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(error) {
          return res.status(404).send("No pending user login, Token expired");
        }
  
        if(decoded) {
          const userDecoded = decoded as IUser;
          return res.json(userDecoded)
        } else {
          return res.status(404).send("No pending user login");
        }
    })
}

export default getPendingUserLogin;