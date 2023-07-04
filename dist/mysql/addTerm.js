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
function addTermTransaction(term) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => {
            promisePool.getConnection()
                .then(connection => {
                connection.beginTransaction()
                    .then(() => __awaiter(this, void 0, void 0, function* () {
                    //Delete the current term
                    yield connection.query("DELETE FROM term_of_service");
                    yield connection.query("DELETE FROM barangay_chairperson");
                    yield connection.query("DELETE FROM barangay_secretary");
                    yield connection.query("DELETE FROM barangay_treasurer");
                    yield connection.query("DELETE FROM barangay_councilors");
                    const createTermQ = "INSERT INTO term_of_service (start, end) VALUES(?, ?)";
                    const insertBarangayChairperson = "INSERT INTO barangay_chairperson (term, resident_uid) VALUES(?, ?)";
                    const insertBarangaySercretary = "INSERT INTO barangay_secretary (term, resident_uid) VALUES(?, ?)";
                    const insertBarangayTreasurer = "INSERT INTO barangay_treasurer (term, resident_uid) VALUES(?, ?)";
                    const insertBarangayCouncilors = "INSERT INTO barangay_councilors (term, resident_uid, committee) VALUES(?, ?, ?)";
                    const termID = (yield connection.query(createTermQ, [term.startYear, term.endYear]))[0].insertId;
                    yield connection.query(insertBarangayChairperson, [termID, term.barangayChairperson.residentUID]);
                    yield connection.query(insertBarangaySercretary, [termID, term.barangaySecretary.residentUID]);
                    yield connection.query(insertBarangayTreasurer, [termID, term.barangayTreasurer.residentUID]);
                    for (let c = 0; c < term.barangayCouncilors.length; c++) {
                        yield connection.query(insertBarangayCouncilors, [termID, term.barangayCouncilors[c].residentUID, term.barangayCouncilors[c].committee]);
                    }
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
exports.default = addTermTransaction;
