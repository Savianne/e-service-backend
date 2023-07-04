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
const generateUID_1 = require("../Helpers/generateUID");
function addResidentRecordTransaction(residentRecord, adminUID) {
    return __awaiter(this, void 0, void 0, function* () {
        const personalInfo = residentRecord.personalInformation;
        const contactInformation = residentRecord.contactInformation;
        const homeContactInfo = residentRecord.homeContactInformation;
        const currentAddress = residentRecord.currentAddress;
        const permanentAddress = residentRecord.permanentAddress;
        const promisePool = pool_1.default.promise();
        const addFullNameQuery = "INSERT INTO full_name (first_name, surname, middle_name, ext_name) VALUES (?, ?, ?, ?)";
        const addPermanentAddressQuery = "INSERT INTO permanent_address (region, province, city_mun, barangay, zone) VALUES (?, ?, ?, ?, ?)";
        const addCurrentAddressQuery = "INSERT INTO current_address (region, province, city_mun, barangay, zone) VALUES (?, ?, ?, ?, ?)";
        const addPersonalInfoQuery = "INSERT INTO personal_information (full_name, date_of_birth, gender, marital_status, current_address, permanent_address) VALUES (?, ?, ?, ?, ?, ?)";
        const addPersonalContactInfoQuery = "INSERT INTO personal_contact_info (cp_number, tel_number, email) VALUES (?, ?, ?)";
        const addHomeContactInfoQuery = "INSERT INTO home_contact_info (cp_number, tel_number, email) VALUES (?, ?, ?)";
        const addResidentQuery = "INSERT INTO residents (resident_uid, personal_information, personal_contact_information, home_contact_information, created_by) VALUES (?, ?, ?, ?, ?)";
        const addToSeniorCitizenOrganization = "INSERT INTO senior_citizen_members (resident_uid) VALUE(?)";
        return new Promise((resolve, reject) => {
            promisePool.getConnection()
                .then(connection => {
                connection.beginTransaction()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    //Query 1 insert full_name 
                    const fullNameID = (yield connection.query(addFullNameQuery, [personalInfo.firstName, personalInfo.surName, personalInfo.middleName, personalInfo.extName]))[0].insertId;
                    //Query 2 insert permanent address
                    const permanentAddressID = (yield connection.query(addPermanentAddressQuery, [permanentAddress.region, permanentAddress.province, permanentAddress.cityOrMunicipality, permanentAddress.barangay, permanentAddress.zone]))[0].insertId;
                    //Query 3 insert current address if not null
                    const currentAddressID = currentAddress ? (yield connection.query(addCurrentAddressQuery, [currentAddress.region, currentAddress.province, currentAddress.cityOrMunicipality, currentAddress.barangay, currentAddress.zone]))[0].insertId : null;
                    //Query 4 Insert Personal Info
                    const personalInfoID = (yield connection.query(addPersonalInfoQuery, [fullNameID, personalInfo.dateOfBirth, personalInfo.gender, personalInfo.maritalStatus, currentAddressID, permanentAddressID]))[0].insertId;
                    //Query 5 Insert personal contact info
                    const personalContactInfoID = (contactInformation.cpNumber || contactInformation.email || contactInformation.telephoneNumber) ? (yield connection.query(addPersonalContactInfoQuery, [contactInformation.cpNumber, contactInformation.telephoneNumber, contactInformation.email]))[0].insertId : null;
                    //Query 6 insert home contact info
                    const homeContactInfoID = (homeContactInfo.cpNumber || homeContactInfo.email || homeContactInfo.telephoneNumber) ? (yield connection.query(addHomeContactInfoQuery, [homeContactInfo.cpNumber, homeContactInfo.telephoneNumber, homeContactInfo.email]))[0].insertId : null;
                    //Query 7 insert display picture
                    const residentUID = (0, generateUID_1.generateResidentssUID)();
                    yield connection.query(addResidentQuery, [residentUID, personalInfoID, personalContactInfoID, homeContactInfoID, adminUID]);
                    //Query 8 final query
                    residentRecord.senior_citizen && (yield connection.query(addToSeniorCitizenOrganization, [residentUID]));
                    connection.commit()
                        .then(() => {
                        connection.release();
                        resolve({ querySuccess: true, residentUID: residentUID });
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
exports.default = addResidentRecordTransaction;
