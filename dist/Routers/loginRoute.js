"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
//Request Handlers
const verify_login_1 = __importDefault(require("../request-handlers/verify-login"));
const get_pending_user_login_1 = __importDefault(require("../request-handlers/get-pending-user-login"));
const find_account_1 = __importDefault(require("../request-handlers/find-account"));
const send_forgot_password_link_handler_1 = __importDefault(require("../request-handlers/send-forgot-password-link-handler"));
const loginRoute = express_1.default.Router();
loginRoute.use(verifyUserRequest_1.default);
// loginRoute.use(serveStatic(path.join(__dirname, '../../Public')));
loginRoute.get("/", (req, res) => {
    const userReq = req;
    userReq.user ? res.redirect("/admin") : res.sendFile(path_1.default.join(__dirname, '../../Views/login.html'));
});
// loginRoute.get("/create-super-admin", async (req, res) => {
//     const hashedPassword = await bcrypt.hash("savianne", 10);
//     const accountUID = generateUID();
//     const admin: IAdmin = {
//         name: "Mark Nino Baylon",
//         account_uid: accountUID, 
//         password: hashedPassword, 
//         email: "www.ninzxky@gmail.com", 
//         main_admin: true, 
//         avatar: "mark.png"
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
    res.send(req.ip);
});
loginRoute.delete('/remove-pending-user-login', (req, res) => {
    res.clearCookie('pendingUserLogin');
    res.json({ success: true });
});
loginRoute.post('/find-account', find_account_1.default);
loginRoute.post('/verify-login', verify_login_1.default);
loginRoute.post('/get-pending-user-login', get_pending_user_login_1.default);
loginRoute.post('/send-reset-link', send_forgot_password_link_handler_1.default);
exports.default = loginRoute;
