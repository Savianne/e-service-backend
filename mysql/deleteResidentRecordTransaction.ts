import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { generateResidentssUID } from "../Helpers/generateUID";
import { IQueryPromise } from "./IQueryPromise";

type TRecordFKeys = {
    fullName: string,
    personalInformation: string,
    personalContactInfo: string | null,
    homeContactInfo: string | null,
    displayPicture: string | null,
    currentAddress: string,
    permanentAddress: string,
    scm: string | null
}

async function deleteResidentRecordTransaction(residentUID: string): Promise<{ querySuccess: boolean }> {
    const promisePool = pool.promise();

    const getFKeys = `
    SELECT 
        pi.full_name AS fullName,
        r.personal_information AS personalInformation, 
        r.personal_contact_information AS personalContactInfo, 
        r.home_contact_information AS homeContactInfo, 
        r.display_picture AS displayPicture, 
        pi.current_address AS currentAddress, 
        pi.permanent_address AS permanentAddress,
        scm.id AS scm
    FROM residents AS r
    JOIN personal_information AS pi ON r.personal_information = pi.id
    JOIN full_name AS fn ON pi.full_name = fn.id
    LEFT JOIN senior_citizen_members AS scm ON r.resident_uid = scm.resident_uid
    WHERE r.resident_uid = ?
    `;

    const deleteFullNameQ = "DELETE FROM full_name WHERE full_name.id = ?";
    const deletePermanentAddressQ = "DELETE FROM permanent_address WHERE permanent_address.id = ?";
    const deleteCurrentAddressQ = "DELETE FROM current_address WHERE current_address.id = ?";
    const deletePersonalInfoQ = "DELETE FROM personal_information WHERE personal_information.id = ?";
    const deletePersonalContactInfoQ = "DELETE FROM personal_contact_info WHERE personal_contact_info.id = ?";
    const deleteHomeContactInfoQ = "DELETE FROM home_contact_info WHERE home_contact_info.id = ?";
    const deleteDisplayPictureQ = "DELETE FROM display_picture WHERE display_picture.id = ?";
    const deleteSeniorCitizenMembership = "DELETE FROM senior_citizen_members WHERE senior_citizen_members.id = ?";
    const deleteResidentQ = "DELETE FROM residents WHERE resident_uid = ?";

    return new Promise<IQueryPromise>((resolve, reject) => {
        promisePool.getConnection()
        .then(connection => {
            connection.beginTransaction()
            .then(async () => {
                const FKeys = ((await connection.query(getFKeys, [residentUID]) as RowDataPacket[][])[0])[0] as TRecordFKeys;
                
                //Delete full_name
                await connection.query(deleteFullNameQ, [FKeys.fullName]);
                
                //Delete Permanent Address
                await connection.query(deletePermanentAddressQ, [FKeys.permanentAddress]);

                //Delete Current Address
                await connection.query(deleteCurrentAddressQ, [FKeys.currentAddress]);

                //Delete Personal Info
                await connection.query(deletePersonalInfoQ, [FKeys.personalInformation]);

                //Delete Personal Contact Info if theres any
                FKeys.personalContactInfo && await connection.query(deletePersonalContactInfoQ, [FKeys.personalContactInfo]);

                //Delete Home contact info if there is any
                FKeys.homeContactInfo && await connection.query(deleteHomeContactInfoQ, [FKeys.homeContactInfo]);

                //Delete Display Picture 
                FKeys.displayPicture && await connection.query(deleteDisplayPictureQ, [FKeys.displayPicture]);

                //Delete Senior Citizen Membership
                FKeys.scm && await connection.query(deleteSeniorCitizenMembership, [FKeys.scm]);

                //Delete the resident
                await connection.query(deleteResidentQ, [residentUID]);

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
  
  export default deleteResidentRecordTransaction;
  