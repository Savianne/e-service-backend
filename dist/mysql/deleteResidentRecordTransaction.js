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
function deleteResidentRecordTransaction(residentUID) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        const getFKeys = `
    SELECT 
        pi.full_name AS fullName,
        r.personal_information AS personalInformation, 
        r.personal_contact_information AS personalContactInfo, 
        r.home_contact_information AS homeContactInfo, 
        r.display_picture AS displayPicture, 
        pi.current_address AS currentAddress, 
        pi.permanent_address AS permanentAddress,
        scm.id AS scm
    FROM residents AS r
    JOIN personal_information AS pi ON r.personal_information = pi.id
    JOIN full_name AS fn ON pi.full_name = fn.id
    LEFT JOIN senior_citizen_members AS scm ON r.resident_uid = scm.resident_uid
    WHERE r.resident_uid = ?
    `;
        const deleteFullNameQ = "DELETE FROM full_name WHERE full_name.id = ?";
        const deletePermanentAddressQ = "DELETE FROM permanent_address WHERE permanent_address.id = ?";
        const deleteCurrentAddressQ = "DELETE FROM current_address WHERE current_address.id = ?";
        const deletePersonalInfoQ = "DELETE FROM personal_information WHERE personal_information.id = ?";
        const deletePersonalContactInfoQ = "DELETE FROM personal_contact_info WHERE personal_contact_info.id = ?";
        const deleteHomeContactInfoQ = "DELETE FROM home_contact_info WHERE home_contact_info.id = ?";
        const deleteDisplayPictureQ = "DELETE FROM display_picture WHERE display_picture.id = ?";
        const deleteSeniorCitizenMembership = "DELETE FROM senior_citizen_members WHERE senior_citizen_members.id = ?";
        const deleteResidentQ = "DELETE FROM residents WHERE resident_uid = ?";
        return new Promise((resolve, reject) => {
            promisePool.getConnection()
                .then(connection => {
                connection.beginTransaction()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const FKeys = ((yield connection.query(getFKeys, [residentUID]))[0])[0];
                    //Delete full_name
                    yield connection.query(deleteFullNameQ, [FKeys.fullName]);
                    //Delete Permanent Address
                    yield connection.query(deletePermanentAddressQ, [FKeys.permanentAddress]);
                    //Delete Current Address
                    yield connection.query(deleteCurrentAddressQ, [FKeys.currentAddress]);
                    //Delete Personal Info
                    yield connection.query(deletePersonalInfoQ, [FKeys.personalInformation]);
                    //Delete Personal Contact Info if theres any
                    FKeys.personalContactInfo && (yield connection.query(deletePersonalContactInfoQ, [FKeys.personalContactInfo]));
                    //Delete Home contact info if there is any
                    FKeys.homeContactInfo && (yield connection.query(deleteHomeContactInfoQ, [FKeys.homeContactInfo]));
                    //Delete Display Picture 
                    FKeys.displayPicture && (yield connection.query(deleteDisplayPictureQ, [FKeys.displayPicture]));
                    //Delete Senior Citizen Membership
                    FKeys.scm && (yield connection.query(deleteSeniorCitizenMembership, [FKeys.scm]));
                    //Delete the resident
                    yield connection.query(deleteResidentQ, [residentUID]);
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
exports.default = deleteResidentRecordTransaction;
