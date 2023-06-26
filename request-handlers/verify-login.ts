import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import getUserAccountInfoByEmail from "../mysql/getUserAccountInfoByEmail";
import addRefreshToken from "../mysql/addRefreshToken";

const verifyLogin = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
  
    const data = await getUserAccountInfoByEmail(email);
    const user = data as any[];
  
    if(!user.length) return res.json({login: false, error: "No Account found associated with the information you provided", code: "NO_ACCOUNT"});
  
    const userInfo = {
      name: user[0].name,
      avatar: user[0].avatar,
      email: user[0].email,
      UID: user[0].account_uid,
      role: +user[0].main_admin == 1? "main admin" : "admin"
    };
  
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;
  
    const token = jwt.sign(userInfo, access_token_secret, { expiresIn: '1m' });
    
    const isPasswordMatch = await bcrypt.compare(password, user[0].password);
  
    if(isPasswordMatch) {
      const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET as string;
      const refreshToken = jwt.sign(userInfo, refresh_token_secret);
      const refreshTokenExpiration = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      try {
        const result = await addRefreshToken(refreshToken, refreshTokenExpiration.toLocaleString());
        if (result && result.affectedRows > 0) {
          res.cookie('user', token);
          res.cookie('user_rt', refreshToken);
          return res.json({login: true});
        }
      }
      catch(err) {
        res.cookie('pendingUserLogin', token);
        res.json({login: false, error: 'Internal Server Error!', userLoginInfo: userInfo, code: "INTERNAL_SERVER_ERROR"});
      }
      
    } else {
      res.cookie('pendingUserLogin', token);
      res.json({login: false, error: 'Incorrect Password!', userLoginInfo: userInfo, code: "INCORRECT_PASS"});
    }
}

export default verifyLogin;