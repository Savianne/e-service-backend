"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getPendingUserLogin = (req, res) => {
    const pendingUserLoginCookie = req.cookies.pendingUserLogin;
    if (!pendingUserLoginCookie) {
        return res.status(404).send("No pending user login");
    }
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    jsonwebtoken_1.default.verify(pendingUserLoginCookie, access_token_secret, (error, decoded) => {
        if (error) {
            return res.status(404).send("No pending user login, Token expired");
        }
        if (decoded) {
            const userDecoded = decoded;
            return res.json(userDecoded);
        }
        else {
            return res.status(404).send("No pending user login");
        }
    });
};
exports.default = getPendingUserLogin;
