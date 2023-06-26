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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const resetPassword_1 = __importDefault(require("../mysql/resetPassword"));
dotenv_1.default.config();
const resetPasswordRoute = express_1.default.Router();
resetPasswordRoute.get('/:token', (req, res) => {
    const token = req.params.token;
    if (!token)
        return res.sendStatus(404);
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    jsonwebtoken_1.default.verify(token, access_token_secret, (error, decoded) => {
        if (error) {
            return res.sendStatus(404);
        }
        if (decoded) {
            res.cookie('rpAccount', token).sendFile(path_1.default.join(__dirname, '../../Views/reset-password.html'));
        }
        else {
            res.sendStatus(404);
        }
    });
});
resetPasswordRoute.post('/:token/get-account', (req, res) => {
    const rpAccountCookie = req.cookies.rpAccount;
    if (!rpAccountCookie)
        return res.sendStatus(404);
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    jsonwebtoken_1.default.verify(rpAccountCookie, access_token_secret, (error, decoded) => {
        if (error) {
            return res.status(404).send("No pending user login, Token expired");
        }
        if (decoded) {
            const tokenDecoded = decoded;
            return res.json(tokenDecoded);
        }
        else {
            return res.status(404).send("No pending user login");
        }
    });
});
resetPasswordRoute.post('/:token/reset', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
    const result = yield (0, resetPassword_1.default)(hashedPassword, data.account_uid);
    result.success ? res.sendStatus(200) : res.sendStatus(500);
}));
exports.default = resetPasswordRoute;
