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
const getResidentDocRequest_1 = __importDefault(require("../mysql/getResidentDocRequest"));
const handleGetResidentDocRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const residentRecord = yield (0, getResidentDocRequest_1.default)();
        if (residentRecord.result) {
            const r = residentRecord.result;
            res.json({ success: true, data: r.map(i => ({
                    from: {
                        fullName: i.fullName,
                        residentUID: i.residentUID,
                        picture: i.picture
                    },
                    documentType: i.documentType,
                    id: i.id,
                    purpose: i.purpose,
                    status: i.status
                })) });
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
exports.default = handleGetResidentDocRequest;
