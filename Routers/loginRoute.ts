import express, { RequestHandler } from 'express';
import path from 'path';
import serveStatic from 'serve-static';
import bcrypt from "bcrypt";
import { IUserRequest } from '../types/IUserRequest';
import { IAdmin } from '../types/IAdmin';

//Controllers
import { generateUID } from '../Helpers/generateUID';

//Queries
import makeSuperAdmin from '../mysql/mekeSuperAdmin';

//Custom Middleware
import verifyUserMiddleware from '../CustomMiddleware/verifyUserRequest';

//Request Handlers
import verifyLogin from '../request-handlers/verify-login';
import getPendingUserLogin from '../request-handlers/get-pending-user-login';
import findAccount from '../request-handlers/find-account';
import sendForgotPasswordLinkHandler from '../request-handlers/send-forgot-password-link-handler';

const loginRoute = express.Router();

loginRoute.use(verifyUserMiddleware as RequestHandler);

// loginRoute.use(serveStatic(path.join(__dirname, '../../Public')));

loginRoute.get("/", (req, res) => {
    const userReq = req as IUserRequest;

    userReq.user? res.redirect("/admin") :  res.sendFile(path.join(__dirname, '../../Views/login.html'));
});

// loginRoute.get("/create-super-admin", async (req, res) => {
//     const hashedPassword = await bcrypt.hash("sandiatcentro", 10);
//     const accountUID = generateUID();
//     const admin: IAdmin = {
//         name: "Danielle Macabitas",
//         account_uid: accountUID, 
//         password: hashedPassword, 
//         email: "denramosmac@gmail.com", 
//         main_admin: true, 
//         avatar: ""
//     };

//     try {
//         const result = makeSuperAdmin(admin);
//         res.json(admin);
//     }
//     catch(error) {
//         res.send(error);
//     }
// });

loginRoute.get("/server-ip", (req, res) => {
    res.send(req.ip)
});

loginRoute.delete('/remove-pending-user-login', (req, res) => {
    res.clearCookie('pendingUserLogin');
    res.json({success: true});
});

loginRoute.post('/find-account', findAccount);

loginRoute.post('/verify-login', verifyLogin);

loginRoute.post('/get-pending-user-login', getPendingUserLogin);

loginRoute.post('/send-reset-link', sendForgotPasswordLinkHandler);

export default loginRoute;