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
function getResidentDocumentRequest() {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => {
            const getResidentDocRequestQ = `
        SELECT dt.document_type AS documentType, rdr.purpose, rs.status, rdr.id,
        r.resident_uid AS residentUID,
        dp.picture,
        rdr.date_created AS date,
        CONCAT(COALESCE(fn.first_name, ''), ' ', LEFT(fn.middle_name, 1), '.', ' ', fn.surname, ' ', COALESCE(fn.ext_name, '')) AS fullName
        FROM resident_doc_request AS rdr
        JOIN request_statuses AS rs ON rdr.status = rs.id
        JOIN document_type AS dt ON rdr.document_type = dt.id
        JOIN residents AS r ON rdr.resident_uid = r.resident_uid
        JOIN personal_information AS pi ON r.personal_information = pi.id
        JOIN full_name AS fn ON pi.full_name = fn.id
        LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
        WHERE rdr.status NOT IN (3, 5)
        `;
            promisePool.query(getResidentDocRequestQ)
                .then(queryResult => {
                const result = queryResult[0];
                resolve({ querySuccess: true, result: result });
            })
                .catch(err => {
                reject(err);
            });
        });
    });
}
exports.default = getResidentDocumentRequest;
