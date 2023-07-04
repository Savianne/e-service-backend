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
const getResidentRecord_1 = __importDefault(require("../mysql/getResidentRecord"));
const handleGetResidentRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const residentUID = req.body.residentUID;
    try {
        const residentRecord = yield (0, getResidentRecord_1.default)(residentUID);
        if (residentRecord.result) {
            res.json({ success: true, data: residentRecord.result });
        }
        else {
            res.sendStatus(404);
        }
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});
exports.default = handleGetResidentRecord;
