import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import getUserAccountInfoByEmail from "../mysql/getUserAccountInfoByEmail";

const findAccount = async (req: Request, res: Response) => {
    const email = req.body.email;
    const data = await getUserAccountInfoByEmail(email);
    const account = data as any[];
  
    if(!account.length) return res.status(404).json({error: "No Account found associated with the information you provided"});
  
    const accountInfo = {
      name: account[0].name,
      avatar: account[0].avatar,
      email: account[0].email,
      UID: account[0].account_uid,
      role: +account[0].main_admin == 1? "main admin" : "admin"
    };
  
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;
  
    const token = jwt.sign(accountInfo, access_token_secret, { expiresIn: '15m' });
  
    res.cookie('pendingUserLogin', token);
    res.json({...accountInfo});
}

export default findAccount;