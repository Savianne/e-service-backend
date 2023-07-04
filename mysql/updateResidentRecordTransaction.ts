import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { generateResidentssUID } from "../Helpers/generateUID";
import { IQueryPromise } from "./IQueryPromise";

type TRecordFKeys = {
    fullName: string,
    personalInformation: string,
    personalContactInfo: string | null,
    homeContactInfo: string | null,
}

type TPersonalInformation = {
    firstName: string,
    surName: string,
    middleName: string,
    extName: string | null,
    gender: string,
    dateOfBirth: string,
    maritalStatus: string
}

type TContactInfo = {
    email: string | null,
    cpNumber: string | null,
    telNumber: string | null,
}

type TUpdateValues = {
    personalInformation: TPersonalInformation,
    personalContactInfo: TContactInfo,
    homeContactInfo: TContactInfo,
}

type TUpdateQuery = {
    values: TUpdateValues,
    tableStateUpdates: {
        full_name: "MODIFIED" | "CURRENT_STATE",
        personal_information: "MODIFIED" | "CURRENT_STATE",
        personal_contact_info: "MODIFIED" | "CURRENT_STATE" | "REMOVED" | "CREATED",
        home_contact_info: "MODIFIED" | "CURRENT_STATE" | "REMOVED" | "CREATED"
    }
}

async function updateResidentRecordTransaction(residentUID: string, update: TUpdateQuery): Promise<{ querySuccess: boolean }> {
    const promisePool = pool.promise();
    const getFKeys = `
    SELECT 
        pi.full_name AS fullName,
        r.personal_information AS personalInformation, 
        r.personal_contact_information AS personalContactInfo, 
        r.home_contact_information AS homeContactInfo
    FROM residents AS r
    JOIN personal_information AS pi ON r.personal_information = pi.id
    JOIN full_name AS fn ON pi.full_name = fn.id
    WHERE r.resident_uid = ?
    `;

    return new Promise<IQueryPromise>((resolve, reject) => {
        promisePool.getConnection()
        .then(connection => {
            connection.beginTransaction()
            .then(async () => {
                const FKeys = ((await connection.query(getFKeys, [residentUID]) as RowDataPacket[][])[0])[0] as TRecordFKeys;

                update.tableStateUpdates.full_name == "MODIFIED" && 
                    await connection.query(`
                    UPDATE full_name SET first_name = ?, middle_name = ?, surname = ?, ext_name = ? 
                    WHERE full_name.id = ?`, 
                    [
                        update.values.personalInformation.firstName, 
                        update.values.personalInformation.middleName, 
                        update.values.personalInformation.surName, 
                        update.values.personalInformation.extName, 
                        FKeys.fullName
                    ]);

                update.tableStateUpdates.home_contact_info == "MODIFIED" && 
                    await connection.query(`UPDATE home_contact_info SET email = ?, cp_number = ?, tel_number = ? WHERE home_contact_info.id = ?`, 
                    [
                        update.values.homeContactInfo.email,
                        update.values.homeContactInfo.cpNumber,
                        update.values.homeContactInfo.telNumber,
                        FKeys.homeContactInfo
                    ]);

                update.tableStateUpdates.personal_contact_info == "MODIFIED" && 
                    await connection.query(`UPDATE personal_contact_info SET email = ?, cp_number = ?, tel_number = ? WHERE personal_contact_info.id = ?`, 
                    [
                        update.values.personalContactInfo.email,
                        update.values.personalContactInfo.cpNumber,
                        update.values.personalContactInfo.telNumber,
                        FKeys.personalContactInfo
                    ]); 
                
                update.tableStateUpdates.home_contact_info == "REMOVED" && 
                    await connection.query(`DELETE FROM home_contact_info WHERE home_contact_info.id = ?`, [FKeys.homeContactInfo]);
                
                update.tableStateUpdates.home_contact_info == "REMOVED" &&
                    await connection.query(`UPDATE residents SET home_contact_information = NULL WHERE home_contact_information = ?`, [FKeys.homeContactInfo]);
                
                update.tableStateUpdates.personal_contact_info == "REMOVED" && 
                    await connection.query(`DELETE FROM personal_contact_info WHERE personal_contact_info.id = ?`, [FKeys.personalContactInfo])

                const newHomeContactInfo = update.tableStateUpdates.home_contact_info == "CREATED" ?
                    (await connection.query(`INSERT INTO home_contact_info (email, cp_number, tel_number) VALUES (?, ?, ?)`, [update.values.homeContactInfo.email, update.values.homeContactInfo.cpNumber, update.values.homeContactInfo.telNumber]) as OkPacket[])[0].insertId : null;


                const newPersonalContactInfo = update.tableStateUpdates.personal_contact_info == "CREATED" ?
                    (await connection.query(`INSERT INTO personal_contact_info (email, cp_number, tel_number) VALUES (?, ?, ?)`, [update.values.personalContactInfo.email, update.values.personalContactInfo.cpNumber, update.values.personalContactInfo.telNumber]) as OkPacket[])[0].insertId : null;
                
                update.tableStateUpdates.personal_information == "MODIFIED" && 
                    await connection.query(`UPDATE personal_information SET date_of_birth = ?, marital_status = ?, gender = ? WHERE personal_information.id = ?`,
                    [update.values.personalInformation.dateOfBirth, update.values.personalInformation.maritalStatus, update.values.personalInformation.gender, FKeys.personalInformation]);

                !(update.tableStateUpdates.home_contact_info == "CURRENT_STATE" && update.tableStateUpdates.personal_contact_info == "CURRENT_STATE") &&
                    await connection.query(`UPDATE residents SET personal_contact_information = ?, home_contact_information = ? WHERE residents.resident_uid = ?`, [
                        update.tableStateUpdates.personal_contact_info == "CREATED"? newPersonalContactInfo : 
                        update.tableStateUpdates.personal_contact_info == "REMOVED"? null : FKeys.personalContactInfo,
                        update.tableStateUpdates.home_contact_info == "CREATED"? newHomeContactInfo :
                        update.tableStateUpdates.home_contact_info == "REMOVED"? null : FKeys.homeContactInfo ,
                        residentUID
                    ])
                
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
  
  export default updateResidentRecordTransaction;
  