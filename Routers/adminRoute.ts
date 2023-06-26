import express, { RequestHandler } from 'express';
import { IUserRequest } from '../types/IUserRequest';

//Custom Middleware
import verifyUserMiddleware from '../CustomMiddleware/verifyUserRequest';

//Routes
import apiRoute from './apiRoute';

const adminRoute = express.Router();

adminRoute.use(verifyUserMiddleware as RequestHandler);

adminRoute.get("/", (req, res) => {
    const userReq = req as IUserRequest;

    userReq.user? res.json(userReq.user) : res.redirect("/login")
});

adminRoute.use("/api", apiRoute)

export default adminRoute;