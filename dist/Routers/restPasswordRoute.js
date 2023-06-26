"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resetPasswordRoute = express_1.default.Router();
resetPasswordRoute.get('/:token/*', (req, res) => {
    const token = req.params.token;
    res.cookie("rpAccount", token).send("Reset Password view");
});
exports.default = resetPasswordRoute;
