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
function getResidentsRecordTransaction() {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => {
            const getAllResidents = `
        SELECT 
        r.resident_uid AS residentUID,
        fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
        pi.gender, pi.marital_status AS maritalStatus, pi.date_of_birth AS dateOfBirth,
        hci.email AS homeEmail, hci.cp_number AS homeCPNumber, hci.tel_number AS homeTelNumber,
        pci.email AS personalEmail, pci.cp_number AS personalCPNumber, pci.tel_number AS personalTelNumber,
        dp.picture,
        CONCAT_WS(" ", pa.region, pa.province, pa.city_mun, pa.barangay, pa.zone) AS permanentAddress,
        CONCAT_WS(" ", ca.region, ca.province, ca.city_mun, ca.barangay, ca.zone) AS currentAddress
        FROM residents AS r
        JOIN personal_information AS pi ON r.personal_information = pi.id
        JOIN full_name AS fn ON pi.full_name = fn.id
        JOIN permanent_address AS pa ON pi.permanent_address = pa.id
        LEFT JOIN current_address as ca ON pi.current_address = ca.id
        LEFT JOIN home_contact_info AS hci ON r.home_contact_information = hci.id
        LEFT JOIN personal_contact_info AS pci ON r.personal_contact_information = pci.id
        LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
        `;
            promisePool.query(getAllResidents)
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
exports.default = getResidentsRecordTransaction;
