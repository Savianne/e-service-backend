"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
//Routes
const apiRoute_1 = __importDefault(require("./apiRoute"));
const adminRoute = express_1.default.Router();
adminRoute.use(verifyUserRequest_1.default);
adminRoute.get("/", (req, res) => {
    const userReq = req;
    userReq.user ? res.json(userReq.user) : res.redirect("/login");
});
adminRoute.use("/api", apiRoute_1.default);
exports.default = adminRoute;
