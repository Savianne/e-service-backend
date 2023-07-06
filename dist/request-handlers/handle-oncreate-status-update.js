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
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pool_1 = __importDefault(require("../mysql/pool"));
const getResidentRecord_1 = __importDefault(require("../mysql/getResidentRecord"));
const __1 = require("..");
dotenv_1.default.config();
const handleOnCreateStatusUpdate = (req, res) => {
    const residentUID = req.params.residentUID;
    const reqID = req.params.reqID;
    if (!residentUID)
        return res.sendStatus(404);
    const promisePool = pool_1.default.promise();
    promisePool.getConnection()
        .then(connection => {
        connection.beginTransaction()
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            const updateQ = (yield connection.query(`UPDATE resident_doc_request SET status = 2 WHERE id = ?`, [reqID]))[0];
            if (updateQ.affectedRows == 0)
                throw Error;
            const residentRecord = yield (0, getResidentRecord_1.default)(residentUID);
            if (!residentRecord.result)
                throw residentRecord.result;
            const r = residentRecord.result;
            const sender = {
                name: `${r.firstName} ${r.middleName[0]}. ${r.surname} ${r.extName ? r.extName : ""}`,
                dateOfBirth: r.dateOfBirth,
                gender: r.gender,
                maritalStatus: r.maritalStatus,
            };
            const requestDoc = (yield connection.query(`
                SELECT dt.document_type AS documentType, rdr.purpose, rs.status, rdr.id
                FROM resident_doc_request AS rdr
                JOIN request_statuses AS rs ON rdr.status = rs.id
                JOIN document_type AS dt ON rdr.document_type = dt.id
                WHERE rdr.resident_uid = ? AND rdr.id = ?
            `, [residentUID, reqID]))[0][0];
            const brgyChairpersonQ = (yield connection.query(`
                SELECT 
                    fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName
                FROM barangay_chairperson AS bc
                JOIN residents AS r ON bc.resident_uid = r.resident_uid
                JOIN personal_information AS pi ON r.personal_information = pi.id
                JOIN full_name AS fn ON pi.full_name = fn.id;
            `))[0][0];
            const barangayChairperson = brgyChairpersonQ ? `Hon. ${brgyChairpersonQ.firstName.toUpperCase()} ${brgyChairpersonQ.middleName[0].toUpperCase()}. ${brgyChairpersonQ.surname.toUpperCase()} ${brgyChairpersonQ.extName ? brgyChairpersonQ.extName.toUpperCase() : ""}` : "";
            const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
            const token = jsonwebtoken_1.default.sign({
                from: Object.assign({}, sender),
                barangayChairperson: barangayChairperson,
                documentType: requestDoc.documentType,
                purpose: requestDoc.purpose
            }, access_token_secret, { expiresIn: '1h' });
            const docDownload = res.json({ success: true, data: `http://localhost:3005/utils/doc-download/${token}` });
            connection.commit()
                .then(() => {
                connection.release();
                __1.io.emit(`DOC_REQ_STATUS_UPDATE_FOR_${residentUID}`);
                res.json({ success: true, data: docDownload });
            })
                .catch((commitError) => {
                connection.release();
                throw new Error;
            });
        }))
            .catch((beginTransactionError) => {
            connection.rollback();
            connection.release();
            throw new Error;
        });
    })
        .catch((getConnectionError) => {
        console.log(getConnectionError);
        res.sendStatus(500);
    });
};
exports.default = handleOnCreateStatusUpdate;
