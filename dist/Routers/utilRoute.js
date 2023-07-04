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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pool_1 = __importDefault(require("../mysql/pool"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
//pdf generator
const indigency_1 = __importDefault(require("../pdf-generators/indigency"));
dotenv_1.default.config();
const utilityRoute = express_1.default.Router();
utilityRoute.use(verifyUserRequest_1.default);
utilityRoute.get("/doc-download/:reqInfo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = req.params.reqInfo;
    if (!info) {
        return res.sendStatus(404);
    }
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    jsonwebtoken_1.default.verify(info, access_token_secret, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            return res.sendStatus(404);
        }
        if (decoded) {
            const request = decoded;
            //For now its only for indigency
            const doc = request.documentType.toLowerCase() == 'indigency' ? (0, indigency_1.default)({
                name: request.from.name,
                maritalStatus: request.from.maritalStatus,
                dateOfBirth: request.from.dateOfBirth,
                purpose: request.purpose,
                barangayChairperson: request.barangayChairperson
            }) : null;
            if (doc) {
                // Set the response headers for file download
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment; filename="downloaded.pdf"');
                // Create a stream and pipe the PDF data to it
                doc.end();
            }
            else
                res.sendStatus(404);
        }
    }));
}));
utilityRoute.get("/pdf-generator/indigency/:reqInfo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = req.params.reqInfo;
    if (!info) {
        return res.sendStatus(404);
    }
    const PollConnection = pool_1.default.promise();
    const brgyChairpersonQ = (yield PollConnection.query(`
        SELECT 
            fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName
        FROM barangay_chairperson AS bc
        JOIN residents AS r ON bc.resident_uid = r.resident_uid
        JOIN personal_information AS pi ON r.personal_information = pi.id
        JOIN full_name AS fn ON pi.full_name = fn.id;
    `))[0][0];
    const barangayChairperson = brgyChairpersonQ ? `Hon. ${brgyChairpersonQ.firstName.toUpperCase()} ${brgyChairpersonQ.middleName[0].toUpperCase()}. ${brgyChairpersonQ.surname.toUpperCase()} ${brgyChairpersonQ.extName ? brgyChairpersonQ.extName.toUpperCase() : ""}` : "";
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
    jsonwebtoken_1.default.verify(info, access_token_secret, (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            return res.sendStatus(404);
        }
        if (decoded) {
            const request = decoded;
            const doc = (0, indigency_1.default)(Object.assign(Object.assign({}, request), { barangayChairperson }));
            // Set response headers
            res.setHeader('Content-Disposition', 'inline; filename="sandiat-centro-cert-of-indigency.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            // Pipe the PDF document to the response
            doc.pipe(res);
            // End the PDF document
            doc.end();
        }
        else {
            return res.sendStatus(404);
        }
    }));
}));
exports.default = utilityRoute;
