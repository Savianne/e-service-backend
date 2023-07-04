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
function getSKTerm(termID) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const selectSKChairpersonQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from sk_chairperson AS skc 
            JOIN residents AS r ON skc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE skc.term = ?`;
                const selectSKTreasurerQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from sk_treasurer AS skt
            JOIN residents AS r ON skt.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE skt.term = ?`;
                const selectSKSecretaryQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from sk_secretary AS sks 
            JOIN residents AS r ON sks.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE sks.term = ?`;
                const selectALlSKCouncilorsOfTheTermQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID ,
                c.committee
            from sk_councilors AS skc
            JOIN residents AS r ON skc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            JOIN committee AS c ON skc.committee = c.id
            WHERE skc.term = ?`;
                const skChairperson = (yield promisePool.query(selectSKChairpersonQ, [termID]))[0][0];
                const skSecretary = (yield promisePool.query(selectSKSecretaryQ, [termID]))[0][0];
                const skTreasurer = (yield promisePool.query(selectSKTreasurerQ, [termID]))[0][0];
                const skCouncilors = (yield promisePool.query(selectALlSKCouncilorsOfTheTermQ, [termID]))[0];
                resolve({ success: true, result: {
                        skChairperson,
                        skSecretary,
                        skTreasurer,
                        skCouncilors
                    } });
            }
            catch (err) {
                reject({ success: false, error: err });
            }
        }));
    });
}
exports.default = getSKTerm;
