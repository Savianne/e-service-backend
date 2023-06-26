"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
const loginRoute = express_1.default.Router();
loginRoute.use(verifyUserRequest_1.default);
loginRoute.get("/", (req, res) => {
    const userReq = req;
    userReq ? res.send("Login Page") : res.redirect("/admin");
});
exports.default = loginRoute;
