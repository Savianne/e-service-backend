import express, { RequestHandler } from 'express';
import { IUserRequest } from '../types/IUserRequest';
import pool from '../mysql/pool';
import path from 'path';
import bcrypt from "bcrypt";
//Custom Middleware
import verifyUserMiddleware from '../CustomMiddleware/verifyUserRequest';

//Routes
import apiRoute from './apiRoute';
import { OkPacket, RowDataPacket } from 'mysql2';

const adminRoute = express.Router();

adminRoute.use(verifyUserMiddleware as RequestHandler);

adminRoute.get("/", (req, res) => {
    const userReq = req as IUserRequest;

    userReq.user? res.sendFile(path.join(__dirname, '../../Views/admin.html')) : res.redirect("/login")
});

adminRoute.get('*', (req, res) => {
    const userReq = req as IUserRequest;

    userReq.user? res.sendFile(path.join(__dirname, '../../Views/admin.html')) : res.redirect("/login")
});

adminRoute.post('/get-account-info', (req, res) => {
    const request = req as IUserRequest;
    res.json({
        success: true,
        data: request.user
    });
});

adminRoute.delete('/logout', async (req, res) => {
    const user_rt = req.cookies.user_rt;
    const poolCon = pool.promise();
    if(user_rt) {
        await poolCon.query('DELETE FROM refresh_token WHERE refresh_token = ?', [user_rt])
        res.clearCookie('user');
        res.clearCookie('user_rt');
        res.json({success: true});
    } else {
        res.clearCookie('user')
        res.json({success: true})
    }

})

adminRoute.patch('/edit-name', (req, res) => {
    const admin = req as IUserRequest;
    const newName = req.body.name;
    const poolCon = pool.promise();
    poolCon.query('UPDATE user_account SET name = ? WHERE account_uid = ?', [newName, admin.user?.UID])
    .then(r => {
        res.json({success: true});
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

adminRoute.patch('/edit-email', (req, res) => {
    const admin = req as IUserRequest;
    const newEmail = req.body.email;
    const poolCon = pool.promise();
    poolCon.query('UPDATE user_account SET email = ? WHERE account_uid = ?', [newEmail, admin.user?.UID])
    .then(r => {
        res.json({success: true});
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

adminRoute.delete('/change-pass', async (req, res) => {
    const admin = req as IUserRequest;
    const data = req.body;

    const poolCon = pool.promise();

    const oldPass = (await poolCon.query('SELECT password FROM user_account WHERE account_uid = ?', [admin.user?.UID]) as RowDataPacket[][])[0][0].password;

    const isPasswordMatch = await bcrypt.compare(oldPass, data.old);

    if(isPasswordMatch) {
        const newPass = await bcrypt.hash(data.new, 10);
        const updateQ = await poolCon.query('UPDATE user_account SET password = ? WHERE account_uid = ?', [newPass, admin.user?.UID]) as OkPacket[]
       if(updateQ[0].affectedRows > 0) {
            res.json({success: true})
       } else {
        res.sendStatus(500);
    }
    } else {
        res.sendStatus(404);
    }
    
})


adminRoute.use("/api", apiRoute)

export default adminRoute;