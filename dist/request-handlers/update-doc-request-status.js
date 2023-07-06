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
const __1 = require("..");
const pool_1 = __importDefault(require("../mysql/pool"));
const handleUpdateDocReqStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqID = req.params.reqID;
    const newStatus = req.params.statusCode;
    const from = req.params.from;
    const poolCon = pool_1.default.promise();
    try {
        const updateQ = (yield poolCon.query(`UPDATE resident_doc_request SET status = ? WHERE id = ?`, [newStatus, reqID]))[0];
        if (updateQ.affectedRows > 0) {
            __1.io.emit(`DOC_REQ_STATUS_UPDATE_FOR_${from}`);
            res.send({ success: true });
        }
        else {
            res.sendStatus(500);
        }
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});
exports.default = handleUpdateDocReqStatus;
