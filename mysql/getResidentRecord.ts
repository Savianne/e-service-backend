import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { IQueryPromise } from "./IQueryPromise";

async function getResidentRecord(residentUID: string) {

    const promisePool = pool.promise();
    return new Promise<IQueryPromise>((resolve, reject) => {
        const getResidentQ = `
        SELECT 
            r.resident_uid AS residentUID,
            fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
            pi.gender, pi.marital_status AS maritalStatus, pi.date_of_birth AS dateOfBirth,
            hci.email AS homeEmail, hci.cp_number AS homeCPNumber, hci.tel_number AS homeTelNumber,
            pci.email AS personalEmail, pci.cp_number AS personalCPNumber, pci.tel_number AS personalTelNumber,
            pa.region AS permanentRegion, pa.province AS permanentProvince, pa.city_mun AS permanentCityMun, pa.barangay AS permanentBarangay, pa.zone AS permanentZone,
            ca.region AS currentRegion, ca.province currentProvince, ca.city_mun AS currentCityMun, ca.barangay AS currentBarangay, ca.zone AS currentZone,
            CONCAT_WS("", pa.region, ", Province of ", pa.province, ", City/Municipality of ", pa.city_mun, ", Brgy. ", pa.barangay, " Zone ", pa.zone) AS permanentAddress,
            CONCAT_WS("", ca.region, ", Province of ", ca.province, ", City/Municipality of ", ca.city_mun, ", Brgy. ", ca.barangay, " Zone ", ca.zone) AS currentAddress,
            dp.picture
            FROM residents AS r
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            JOIN permanent_address AS pa ON pi.permanent_address = pa.id
            LEFT JOIN current_address as ca ON pi.current_address = ca.id
            LEFT JOIN home_contact_info AS hci ON r.home_contact_information = hci.id
            LEFT JOIN personal_contact_info AS pci ON r.personal_contact_information = pci.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
        WHERE r.resident_uid = ?
        `;

        promisePool.query(getResidentQ, [residentUID])
        .then(queryResult => {
            const result = queryResult[0] as RowDataPacket[][];
            resolve({querySuccess: true, result: result[0]})
        })
        .catch(err => {
            reject(err);
        })
    });
}
  
export default getResidentRecord;
  