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
function identifyIfBarangayOfficial(residentUID) {
    return __awaiter(this, void 0, void 0, function* () {
        const promisePool = pool_1.default.promise();
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const isBarangayChairperson = (yield promisePool.query("SELECT COUNT(*) as count FROM  barangay_chairperson AS bc WHERE bc.resident_uid = ?", [residentUID]))[0][0];
                if (isBarangayChairperson.count)
                    return resolve({ related: true });
                const isBarangaySecretary = (yield promisePool.query("SELECT COUNT(*) as count FROM  barangay_secretary AS bs WHERE bs.resident_uid = ?", [residentUID]))[0][0];
                if (isBarangaySecretary.count)
                    return resolve({ related: true });
                const isBarangayTreasurer = (yield promisePool.query("SELECT COUNT(*) as count FROM  barangay_treasurer AS bt WHERE bt.resident_uid = ?", [residentUID]))[0][0];
                if (isBarangayTreasurer.count)
                    return resolve({ related: true });
                const isBarangayCouncilor = (yield promisePool.query("SELECT COUNT(*) as count FROM  barangay_councilors AS bt WHERE bt.resident_uid = ?", [residentUID]))[0][0];
                if (isBarangayCouncilor.count)
                    return resolve({ related: true });
                const isSkChairperson = (yield promisePool.query("SELECT COUNT(*) as count FROM sk_chairperson AS bt WHERE bt.resident_uid = ?", [residentUID]))[0][0];
                if (isSkChairperson.count)
                    return resolve({ related: true });
                const isSKSecretary = (yield promisePool.query("SELECT COUNT(*) as count FROM sk_secretary AS bt WHERE bt.resident_uid = ?", [residentUID]))[0][0];
                if (isSKSecretary.count)
                    return resolve({ related: true });
                const isSkTreasurer = (yield promisePool.query("SELECT COUNT(*) as count FROM sk_treasurer AS bt WHERE bt.resident_uid = ?", [residentUID]))[0][0];
                if (isSkTreasurer.count)
                    return resolve({ related: true });
                const isSKCouncilor = (yield promisePool.query("SELECT COUNT(*) as count FROM sk_councilors AS bt WHERE bt.resident_uid = ?", [residentUID]))[0][0];
                if (isSKCouncilor.count)
                    return resolve({ related: true });
                return resolve({ related: false });
            }
            catch (err) {
                console.log(err);
            }
        }));
    });
}
exports.default = identifyIfBarangayOfficial;
