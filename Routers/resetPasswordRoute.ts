import express, { RequestHandler } from 'express';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from 'path';
import serveStatic from 'serve-static';
import bcrypt from "bcrypt";
import { IUserRequest } from '../types/IUserRequest';
import { IUser } from '../types/IUser';
import resetPassword from '../mysql/resetPassword';

dotenv.config();

const resetPasswordRoute = express.Router();

resetPasswordRoute.get('/:token', (req, res) => {
    const token = req.params.token;
    
    if(!token) return res.sendStatus(404);

    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

    jwt.verify(token as string, access_token_secret, (error: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if(error) {
        return res.sendStatus(404);
      }

      if(decoded) {
        res.cookie('rpAccount', token).sendFile(path.join(__dirname, '../../Views/reset-password.html'));
      } else {
          res.sendStatus(404);
      }
  })
});

resetPasswordRoute.post('/:token/get-account', (req, res) => {
    const rpAccountCookie = req.cookies.rpAccount;

    if(!rpAccountCookie) return res.sendStatus(404);

    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

    jwt.verify(rpAccountCookie, access_token_secret, (error: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(error) {
          return res.status(404).send("No pending user login, Token expired");
        }
  
        if(decoded) {
          const tokenDecoded = decoded;
          return res.json(tokenDecoded)
        } else {
          return res.status(404).send("No pending user login");
        }
    })
});

resetPasswordRoute.post('/:token/reset', async (req, res) => {
  const data = req.body;
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await resetPassword(hashedPassword, data.account_uid);
  result.success? res.sendStatus(200) : res.sendStatus(500)
});

export default resetPasswordRoute;