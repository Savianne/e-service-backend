import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { IQueryPromise } from "./IQueryPromise";

interface IPerson {
    firstName: string,
    surname: string,
    middleName: string,
    extName: string | null,
    residentUID: string,
    picture: string | null
}

interface IPersonWidthCommittee extends IPerson {
    committee: string,
}

async function getTerm(termID: string | number): Promise<{success: boolean, result?: any}> {
    const promisePool = pool.promise();
    return new Promise<{success: boolean, result?: any}>( async (resolve, reject) => {
        try {
            
            const selectBarangayChairpersonQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
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
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
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
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
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
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID ,
                c.committee
            from barangay_councilors AS bc 
            JOIN residents AS r ON bc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            JOIN committee AS c ON bc.committee = c.id
            WHERE bc.term = ?`;

            const barangayChairperson = (await promisePool.query(selectBarangayChairpersonQ, [termID]) as RowDataPacket[][])[0][0];
            const barangaySecretary = (await promisePool.query(selectBarangaySecretaryQ, [termID]) as RowDataPacket[][])[0][0];
            const barangayTreasurer = (await promisePool.query(selectBarangayTreasurerQ, [termID]) as RowDataPacket[][])[0][0];
            const barangayCouncilors = (await promisePool.query(selectALlBarangayCouncilorsOfTheTermQ, [termID]) as RowDataPacket[][])[0];

            resolve({success: true, result: {
                barangayChairperson,
                barangaySecretary,
                barangayTreasurer,
                barangayCouncilors
            }})
        }
        catch(err) {
            reject({success: false, error: err});
        }
    });
  }
  
  export default getTerm;
  