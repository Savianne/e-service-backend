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
function updateResidentRecordTransaction(residentUID, update) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        const getFKeys = `
    SELECT 
        pi.full_name AS fullName,
        r.personal_information AS personalInformation, 
        r.personal_contact_information AS personalContactInfo, 
        r.home_contact_information AS homeContactInfo
    FROM residents AS r
    JOIN personal_information AS pi ON r.personal_information = pi.id
    JOIN full_name AS fn ON pi.full_name = fn.id
    WHERE r.resident_uid = ?
    `;
        return new Promise((resolve, reject) => {
            promisePool.getConnection()
                .then(connection => {
                connection.beginTransaction()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const FKeys = ((yield connection.query(getFKeys, [residentUID]))[0])[0];
                    update.tableStateUpdates.full_name == "MODIFIED" &&
                        (yield connection.query(`
                    UPDATE full_name SET first_name = ?, middle_name = ?, surname = ?, ext_name = ? 
                    WHERE full_name.id = ?`, [
                            update.values.personalInformation.firstName,
                            update.values.personalInformation.middleName,
                            update.values.personalInformation.surName,
                            update.values.personalInformation.extName,
                            FKeys.fullName
                        ]));
                    update.tableStateUpdates.home_contact_info == "MODIFIED" &&
                        (yield connection.query(`UPDATE home_contact_info SET email = ?, cp_number = ?, tel_number = ? WHERE home_contact_info.id = ?`, [
                            update.values.homeContactInfo.email,
                            update.values.homeContactInfo.cpNumber,
                            update.values.homeContactInfo.telNumber,
                            FKeys.homeContactInfo
                        ]));
                    update.tableStateUpdates.personal_contact_info == "MODIFIED" &&
                        (yield connection.query(`UPDATE personal_contact_info SET email = ?, cp_number = ?, tel_number = ? WHERE personal_contact_info.id = ?`, [
                            update.values.personalContactInfo.email,
                            update.values.personalContactInfo.cpNumber,
                            update.values.personalContactInfo.telNumber,
                            FKeys.personalContactInfo
                        ]));
                    update.tableStateUpdates.home_contact_info == "REMOVED" &&
                        (yield connection.query(`DELETE FROM home_contact_info WHERE home_contact_info.id = ?`, [FKeys.homeContactInfo]));
                    update.tableStateUpdates.home_contact_info == "REMOVED" &&
                        (yield connection.query(`UPDATE residents SET home_contact_information = NULL WHERE home_contact_information = ?`, [FKeys.homeContactInfo]));
                    update.tableStateUpdates.personal_contact_info == "REMOVED" &&
                        (yield connection.query(`DELETE FROM personal_contact_info WHERE personal_contact_info.id = ?`, [FKeys.personalContactInfo]));
                    const newHomeContactInfo = update.tableStateUpdates.home_contact_info == "CREATED" ?
                        (yield connection.query(`INSERT INTO home_contact_info (email, cp_number, tel_number) VALUES (?, ?, ?)`, [update.values.homeContactInfo.email, update.values.homeContactInfo.cpNumber, update.values.homeContactInfo.telNumber]))[0].insertId : null;
                    const newPersonalContactInfo = update.tableStateUpdates.personal_contact_info == "CREATED" ?
                        (yield connection.query(`INSERT INTO personal_contact_info (email, cp_number, tel_number) VALUES (?, ?, ?)`, [update.values.personalContactInfo.email, update.values.personalContactInfo.cpNumber, update.values.personalContactInfo.telNumber]))[0].insertId : null;
                    update.tableStateUpdates.personal_information == "MODIFIED" &&
                        (yield connection.query(`UPDATE personal_information SET date_of_birth = ?, marital_status = ?, gender = ? WHERE personal_information.id = ?`, [update.values.personalInformation.dateOfBirth, update.values.personalInformation.maritalStatus, update.values.personalInformation.gender, FKeys.personalInformation]));
                    !(update.tableStateUpdates.home_contact_info == "CURRENT_STATE" && update.tableStateUpdates.personal_contact_info == "CURRENT_STATE") &&
                        (yield connection.query(`UPDATE residents SET personal_contact_information = ?, home_contact_information = ? WHERE residents.resident_uid = ?`, [
                            update.tableStateUpdates.personal_contact_info == "CREATED" ? newPersonalContactInfo :
                                update.tableStateUpdates.personal_contact_info == "REMOVED" ? null : FKeys.personalContactInfo,
                            update.tableStateUpdates.home_contact_info == "CREATED" ? newHomeContactInfo :
                                update.tableStateUpdates.home_contact_info == "REMOVED" ? null : FKeys.homeContactInfo,
                            residentUID
                        ]));
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
exports.default = updateResidentRecordTransaction;
