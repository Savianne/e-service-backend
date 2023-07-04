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
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const getUserAccountInfoByEmail_1 = __importDefault(require("../mysql/getUserAccountInfoByEmail"));
const addRefreshToken_1 = __importDefault(require("../mysql/addRefreshToken"));
dotenv_1.default.config();
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const data = yield (0, getUserAccountInfoByEmail_1.default)(email);
    const user = data;
    if (!user.length)
        return res.json({ login: false, error: "No Account found associated with the information you provided", code: "NO_ACCOUNT" });
    const userInfo = {
        name: user[0].name,
        avatar: user[0].avatar,
        email: user[0].email,
        UID: user[0].account_uid,
        role: +user[0].main_admin == 1 ? "main admin" : "admin"
    };
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jsonwebtoken_1.default.sign(userInfo, access_token_secret, { expiresIn: '1m' });
    const isPasswordMatch = yield bcrypt_1.default.compare(password, user[0].password);
    if (isPasswordMatch) {
        const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
        const refreshToken = jsonwebtoken_1.default.sign(userInfo, refresh_token_secret);
        const refreshTokenExpiration = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        try {
            const result = yield (0, addRefreshToken_1.default)(refreshToken, refreshTokenExpiration.toLocaleString());
            if (result && result.affectedRows > 0) {
                res.cookie('user', token);
                res.cookie('user_rt', refreshToken);
                return res.json({ login: true });
            }
        }
        catch (err) {
            res.cookie('pendingUserLogin', token);
            res.json({ login: false, error: 'Internal Server Error!', userLoginInfo: userInfo, code: "INTERNAL_SERVER_ERROR" });
        }
    }
    else {
        res.cookie('pendingUserLogin', token);
        res.json({ login: false, error: 'Incorrect Password!', userLoginInfo: userInfo, code: "INCORRECT_PASS" });
    }
});
exports.default = verifyLogin;
