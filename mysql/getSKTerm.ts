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

async function getSKTerm(termID: string | number): Promise<{success: boolean, result?: any}> {
    const promisePool = pool.promise();
    return new Promise<{success: boolean, result?: any}>( async (resolve, reject) => {
        try {
            const selectSKChairpersonQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from sk_chairperson AS skc 
            JOIN residents AS r ON skc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE skc.term = ?`;

            const selectSKTreasurerQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from sk_treasurer AS skt
            JOIN residents AS r ON skt.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE skt.term = ?`;

            const selectSKSecretaryQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID 
            from sk_secretary AS sks 
            JOIN residents AS r ON sks.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            WHERE sks.term = ?`;

            const selectALlSKCouncilorsOfTheTermQ = `
            SELECT 
                dp.picture, 
                fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName,
                r.resident_uid AS residentUID ,
                c.committee
            from sk_councilors AS skc
            JOIN residents AS r ON skc.resident_uid = r.resident_uid
            JOIN personal_information AS pi ON r.personal_information = pi.id
            JOIN full_name AS fn ON pi.full_name = fn.id
            LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
            JOIN committee AS c ON skc.committee = c.id
            WHERE skc.term = ?`;

            const skChairperson = (await promisePool.query(selectSKChairpersonQ, [termID]) as RowDataPacket[][])[0][0];
            const skSecretary = (await promisePool.query(selectSKSecretaryQ, [termID]) as RowDataPacket[][])[0][0];
            const skTreasurer = (await promisePool.query(selectSKTreasurerQ, [termID]) as RowDataPacket[][])[0][0];
            const skCouncilors = (await promisePool.query(selectALlSKCouncilorsOfTheTermQ, [termID]) as RowDataPacket[][])[0];

            resolve({success: true, result: {
                skChairperson,
                skSecretary,
                skTreasurer,
                skCouncilors
            }})
        }
        catch(err) {
            reject({success: false, error: err});
        }
    });
  }
  
  export default getSKTerm;
  