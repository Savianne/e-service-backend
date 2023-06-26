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
const pool_1 = __importDefault(require("./pool"));
function makeSuperAdmin(admin) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        try {
            const result = (yield promisePool.query("INSERT INTO user_account (account_uid, name, password, email, main_admin, avatar) VALUES (?, ?, ?, ?, ?, ?)", [admin.account_uid, admin.name, admin.password, admin.email, admin.main_admin, admin.avatar])).affectedRows;
            if (result > 0)
                return { success: true };
            throw "Error";
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = makeSuperAdmin;
