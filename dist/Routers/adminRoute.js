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
const pool_1 = __importDefault(require("../mysql/pool"));
const path_1 = __importDefault(require("path"));
const bcrypt_1 = __importDefault(require("bcrypt"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
//Routes
const apiRoute_1 = __importDefault(require("./apiRoute"));
const adminRoute = express_1.default.Router();
adminRoute.use(verifyUserRequest_1.default);
adminRoute.get("/", (req, res) => {
    const userReq = req;
    userReq.user ? res.sendFile(path_1.default.join(__dirname, '../../Views/admin.html')) : res.redirect("/login");
});
adminRoute.get('*', (req, res) => {
    const userReq = req;
    userReq.user ? res.sendFile(path_1.default.join(__dirname, '../../Views/admin.html')) : res.redirect("/login");
});
adminRoute.post('/get-account-info', (req, res) => {
    const request = req;
    res.json({
        success: true,
        data: request.user
    });
});
adminRoute.delete('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_rt = req.cookies.user_rt;
    const poolCon = pool_1.default.promise();
    if (user_rt) {
        yield poolCon.query('DELETE FROM refresh_token WHERE refresh_token = ?', [user_rt]);
        res.clearCookie('user');
        res.clearCookie('user_rt');
        res.json({ success: true });
    }
    else {
        res.clearCookie('user');
        res.json({ success: true });
    }
}));
adminRoute.patch('/edit-name', (req, res) => {
    var _a;
    const admin = req;
    const newName = req.body.name;
    const poolCon = pool_1.default.promise();
    poolCon.query('UPDATE user_account SET name = ? WHERE account_uid = ?', [newName, (_a = admin.user) === null || _a === void 0 ? void 0 : _a.UID])
        .then(r => {
        res.json({ success: true });
    })
        .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});
adminRoute.patch('/edit-email', (req, res) => {
    var _a;
    const admin = req;
    const newEmail = req.body.email;
    const poolCon = pool_1.default.promise();
    poolCon.query('UPDATE user_account SET email = ? WHERE account_uid = ?', [newEmail, (_a = admin.user) === null || _a === void 0 ? void 0 : _a.UID])
        .then(r => {
        res.json({ success: true });
    })
        .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});
adminRoute.delete('/change-pass', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const admin = req;
    const data = req.body;
    const poolCon = pool_1.default.promise();
    const oldPass = (yield poolCon.query('SELECT password FROM user_account WHERE account_uid = ?', [(_a = admin.user) === null || _a === void 0 ? void 0 : _a.UID]))[0][0].password;
    const isPasswordMatch = yield bcrypt_1.default.compare(oldPass, data.old);
    if (isPasswordMatch) {
        const newPass = yield bcrypt_1.default.hash(data.new, 10);
        const updateQ = yield poolCon.query('UPDATE user_account SET password = ? WHERE account_uid = ?', [newPass, (_b = admin.user) === null || _b === void 0 ? void 0 : _b.UID]);
        if (updateQ[0].affectedRows > 0) {
            res.json({ success: true });
        }
        else {
            res.sendStatus(500);
        }
    }
    else {
        res.sendStatus(404);
    }
}));
adminRoute.use("/api", apiRoute_1.default);
exports.default = adminRoute;
