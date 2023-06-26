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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getUserAccountInfoByEmail_1 = __importDefault(require("../mysql/getUserAccountInfoByEmail"));
const findAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const data = yield (0, getUserAccountInfoByEmail_1.default)(email);
    const account = data;
    if (!account.length)
        return res.status(404).json({ error: "No Account found associated with the information you provided" });
    const accountInfo = {
        name: account[0].name,
        avatar: account[0].avatar,
        email: account[0].email,
        UID: account[0].account_uid,
        role: +account[0].main_admin == 1 ? "main admin" : "admin"
    };
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    const token = jsonwebtoken_1.default.sign(accountInfo, access_token_secret, { expiresIn: '15m' });
    res.cookie('pendingUserLogin', token);
    res.json(Object.assign({}, accountInfo));
});
exports.default = findAccount;
