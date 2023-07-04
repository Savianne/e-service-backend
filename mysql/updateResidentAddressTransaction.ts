import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { IQueryPromise } from "./IQueryPromise";

type TRecordFKeys = {
    permanentAddressID: string | null,
    currentAddressID: string | null
}

type TAddress = {
    region: string,
    province: string,
    cityMun: string,
    barangay: string,
    zone: string
}

type TUpdateValues = {
    currentAddress: TAddress | null,
    permanentAddress: TAddress | null
}


async function updateResidentAddressTransaction(residentUID: string, update: TUpdateValues): Promise<{ querySuccess: boolean }> {
    const promisePool = pool.promise();
    const getFKeys = `
    SELECT 
        pi.permanent_address AS permanentAddressID, pi.current_address AS currentAddressID
    FROM residents AS r
    JOIN personal_information AS pi ON r.personal_information = pi.id
    WHERE r.resident_uid = ?
    `;

    console.log(update)
    return new Promise<IQueryPromise>((resolve, reject) => {
        promisePool.getConnection()
        .then(connection => {
            connection.beginTransaction()
            .then(async () => {
                const FKeys = ((await connection.query(getFKeys, [residentUID]) as RowDataPacket[][])[0])[0] as TRecordFKeys;
            
                update.currentAddress && await connection.query("UPDATE current_address SET region = ?, province = ?, city_mun = ?, barangay = ?, zone = ? WHERE current_address.id = ?", 
                [update.currentAddress.region, update.currentAddress.province, update.currentAddress.cityMun, update.currentAddress.barangay, update.currentAddress.zone, FKeys.currentAddressID]);
               
                update.permanentAddress && await connection.query("UPDATE permanent_address SET region = ?, province = ?, city_mun = ?, barangay = ?, zone = ? WHERE permanent_address.id = ?", 
                [update.permanentAddress.region, update.permanentAddress.province, update.permanentAddress.cityMun, update.permanentAddress.barangay, update.permanentAddress.zone, FKeys.permanentAddressID])
                
                connection.commit()
                .then(() => {
                    connection.release();
                    resolve({ querySuccess: true });
                })
                .catch((commitError) => {
                    connection.release()
                    reject({
                        querySuccess: false,
                        error: commitError,
                    });
                });
            })
            .catch((beginTransactionError) => {
                connection.rollback();
                connection.release()
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
        })
    });
  }
  
  export default updateResidentAddressTransaction;
  