import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { IQueryPromise } from "./IQueryPromise";

async function getResidentDocumentRequest() {

    const promisePool = pool.promise();
    return new Promise<IQueryPromise>((resolve, reject) => {
        const getResidentDocRequestQ = `
        SELECT dt.document_type AS documentType, rdr.purpose, rs.status, rdr.id,
        r.resident_uid AS residentUID,
        dp.picture,
        CONCAT(COALESCE(fn.first_name, ''), ' ', LEFT(fn.middle_name, 1), '.', ' ', fn.surname, ' ', COALESCE(fn.ext_name, '')) AS fullName
        FROM resident_doc_request AS rdr
        JOIN request_statuses AS rs ON rdr.status = rs.id
        JOIN document_type AS dt ON rdr.document_type = dt.id
        JOIN residents AS r ON rdr.resident_uid = r.resident_uid
        JOIN personal_information AS pi ON r.personal_information = pi.id
        JOIN full_name AS fn ON pi.full_name = fn.id
        LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
        WHERE rdr.status NOT IN (3, 5)
        `;

        promisePool.query(getResidentDocRequestQ)
        .then(queryResult => {
            const result = queryResult[0] as RowDataPacket[][];
            resolve({querySuccess: true, result: result})
        })
        .catch(err => {
            reject(err);
        })
    });
}
  
export default getResidentDocumentRequest;
  