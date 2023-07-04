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
function getTermTransaction(termID) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => {
            promisePool.getConnection()
                .then(connection => {
                connection.beginTransaction()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const selectBarangayChairpersonQ = `
                SELECT 
                    dp.picture, 
                    fn.first_name AS firstName, fn.middle_name AS middleName, fn.ext_name AS extName,
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
                    fn.first_name AS firstName, fn.middle_name AS middleName, fn.ext_name AS extName,
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
                    fn.first_name AS firstName, fn.middle_name AS middleName, fn.ext_name AS extName,
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
                    fn.first_name AS firstName, fn.middle_name AS middleName, fn.ext_name AS extName,
                    r.resident_uid AS residentUID 
                from barangay_counsilors AS bc 
                JOIN residents AS r ON bc.resident_uid = r.resident_uid
                JOIN personal_information AS pi ON r.personal_information = pi.id
                JOIN full_name AS fn ON pi.full_name = fn.id
                LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
                WHERE bc.term = ?`;
                    const barangayChairperson = (yield connection.query(selectBarangayChairpersonQ, [termID]))[0][0];
                    console.log(barangayChairperson);
                    connection.commit()
                        .then(() => {
                        connection.release();
                        resolve({ querySuccess: true });
                    })
                        .catch((commitError) => {
                        connection.release();
                        reject({
                            querySuccess: false,
                            error: commitError,
                        });
                    });
                }))
                    .catch((beginTransactionError) => {
                    connection.rollback();
                    connection.release();
                    reject({
                        querySuccess: false,
                        error: beginTransactionError,
                    });
                });
            })
                .catch((getConnectionError) => {
                reject({
                    querySuccess: false,
                    error: getConnectionError,
                });
            });
        });
    });
}
exports.default = getTermTransaction;
