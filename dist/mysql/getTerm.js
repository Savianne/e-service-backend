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
function getTerm(termID) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const selectBarangayChairpersonQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from barangay_chairperson AS bc 
            JOIN residents AS r ON bc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE bc.term = ?`;
                const selectBarangayTreasurerQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from barangay_treasurer AS bc 
            JOIN residents AS r ON bc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE bc.term = ?`;
                const selectBarangaySecretaryQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from barangay_secretary AS bc 
            JOIN residents AS r ON bc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE bc.term = ?`;
                const selectALlBarangayCouncilorsOfTheTermQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID ,
                c.committee
            from barangay_councilors AS bc 
            JOIN residents AS r ON bc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            JOIN committee AS c ON bc.committee = c.id
            WHERE bc.term = ?`;
                const barangayChairperson = (yield promisePool.query(selectBarangayChairpersonQ, [termID]))[0][0];
                const barangaySecretary = (yield promisePool.query(selectBarangaySecretaryQ, [termID]))[0][0];
                const barangayTreasurer = (yield promisePool.query(selectBarangayTreasurerQ, [termID]))[0][0];
                const barangayCouncilors = (yield promisePool.query(selectALlBarangayCouncilorsOfTheTermQ, [termID]))[0];
                resolve({ success: true, result: {
                        barangayChairperson,
                        barangaySecretary,
                        barangayTreasurer,
                        barangayCouncilors
                    } });
            }
            catch (err) {
                reject({ success: false, error: err });
            }
        }));
    });
}
exports.default = getTerm;
