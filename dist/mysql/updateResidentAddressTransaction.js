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
function updateResidentAddressTransaction(residentUID, update) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        const getFKeys = `
    SELECT 
        pi.permanent_address AS permanentAddressID, pi.current_address AS currentAddressID
    FROM residents AS r
    JOIN personal_information AS pi ON r.personal_information = pi.id
    WHERE r.resident_uid = ?
    `;
        console.log(update);
        return new Promise((resolve, reject) => {
            promisePool.getConnection()
                .then(connection => {
                connection.beginTransaction()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    const FKeys = ((yield connection.query(getFKeys, [residentUID]))[0])[0];
                    update.currentAddress && (yield connection.query("UPDATE current_address SET region = ?, province = ?, city_mun = ?, barangay = ?, zone = ? WHERE current_address.id = ?", [update.currentAddress.region, update.currentAddress.province, update.currentAddress.cityMun, update.currentAddress.barangay, update.currentAddress.zone, FKeys.currentAddressID]));
                    update.permanentAddress && (yield connection.query("UPDATE permanent_address SET region = ?, province = ?, city_mun = ?, barangay = ?, zone = ? WHERE permanent_address.id = ?", [update.permanentAddress.region, update.permanentAddress.province, update.permanentAddress.cityMun, update.permanentAddress.barangay, update.permanentAddress.zone, FKeys.permanentAddressID]));
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
exports.default = updateResidentAddressTransaction;
