import pool from "./pool";
import { OkPacket } from "mysql2";
import { generateResidentssUID } from "../Helpers/generateUID";
import { IQueryPromise } from "./IQueryPromise";

interface IQueryPromiseWithResidentId extends IQueryPromise {
    residentUID: string
}

type TAddress = {
    region: string,
    province: string,
    cityOrMunicipality: string,
    barangay: string,
    zone: string | number
} 

type TContactInfo = {
    email: string | null,
    cpNumber: string | null,
    telephoneNumber: string | null,
}

type TResidentRecord = {
    personalInformation: {
        firstName: string,
        middleName: string,
        surName: string,
        extName: string | null, 
        maritalStatus: string,
        dateOfBirth: string,
        gender: string,
    },
    contactInformation: TContactInfo,
    homeContactInformation: TContactInfo,
    currentAddress: TAddress | null,
    permanentAddress: TAddress,
    senior_citizen: boolean
}

async function addResidentRecordTransaction(residentRecord: TResidentRecord, adminUID: string): Promise<IQueryPromiseWithResidentId> {
    const personalInfo = residentRecord.personalInformation;
    const contactInformation = residentRecord.contactInformation;
    const homeContactInfo = residentRecord.homeContactInformation;
    const currentAddress = residentRecord.currentAddress;
    const permanentAddress = residentRecord.permanentAddress;


    const promisePool = pool.promise();

    const addFullNameQuery = "INSERT INTO full_name (first_name, surname, middle_name, ext_name) VALUES (?, ?, ?, ?)";
    const addPermanentAddressQuery = "INSERT INTO permanent_address (region, province, city_mun, barangay, zone) VALUES (?, ?, ?, ?, ?)";
    const addCurrentAddressQuery = "INSERT INTO current_address (region, province, city_mun, barangay, zone) VALUES (?, ?, ?, ?, ?)";
    const addPersonalInfoQuery = "INSERT INTO personal_information (full_name, date_of_birth, gender, marital_status, current_address, permanent_address) VALUES (?, ?, ?, ?, ?, ?)";
    const addPersonalContactInfoQuery = "INSERT INTO personal_contact_info (cp_number, tel_number, email) VALUES (?, ?, ?)";
    const addHomeContactInfoQuery = "INSERT INTO home_contact_info (cp_number, tel_number, email) VALUES (?, ?, ?)";
    const addResidentQuery = "INSERT INTO residents (resident_uid, personal_information, personal_contact_information, home_contact_information, created_by) VALUES (?, ?, ?, ?, ?)";
    const addToSeniorCitizenOrganization = "INSERT INTO senior_citizen_members (resident_uid) VALUE(?)";

    return new Promise<IQueryPromiseWithResidentId>((resolve, reject) => {
        promisePool.getConnection()
        .then(connection => {
            connection.beginTransaction()
            .then(async () => {
               
                //Query 1 insert full_name 
                const fullNameID = (await connection.query(addFullNameQuery, [personalInfo.firstName, personalInfo.surName, personalInfo.middleName, personalInfo.extName]) as OkPacket[])[0].insertId;
                
                //Query 2 insert permanent address
                const permanentAddressID = (await connection.query(addPermanentAddressQuery, [permanentAddress.region, permanentAddress.province, permanentAddress.cityOrMunicipality, permanentAddress.barangay, permanentAddress.zone]) as OkPacket[])[0].insertId;

                //Query 3 insert current address if not null
                const currentAddressID = currentAddress? (await connection.query(addCurrentAddressQuery, [currentAddress.region, currentAddress.province, currentAddress.cityOrMunicipality, currentAddress.barangay, currentAddress.zone]) as OkPacket[])[0].insertId : null;

                //Query 4 Insert Personal Info
                const personalInfoID = (await connection.query(addPersonalInfoQuery, [fullNameID, personalInfo.dateOfBirth, personalInfo.gender, personalInfo.maritalStatus, currentAddressID, permanentAddressID]) as OkPacket[])[0].insertId;

                //Query 5 Insert personal contact info
                const personalContactInfoID = (contactInformation.cpNumber || contactInformation.email || contactInformation.telephoneNumber)? (await connection.query(addPersonalContactInfoQuery, [contactInformation.cpNumber, contactInformation.telephoneNumber, contactInformation.email]) as OkPacket[])[0].insertId : null;

                //Query 6 insert home contact info
                const homeContactInfoID = (homeContactInfo.cpNumber || homeContactInfo.email || homeContactInfo.telephoneNumber)? (await connection.query(addHomeContactInfoQuery, [homeContactInfo.cpNumber, homeContactInfo.telephoneNumber, homeContactInfo.email]) as OkPacket[])[0].insertId : null;

                //Query 7 insert display picture
                const residentUID = generateResidentssUID();
                await connection.query(addResidentQuery, [residentUID, personalInfoID, personalContactInfoID, homeContactInfoID, adminUID])

                //Query 8 final query
                residentRecord.senior_citizen && await connection.query(addToSeniorCitizenOrganization, [residentUID])

                connection.commit()
                .then(() => {
                    connection.release();
                    resolve({ querySuccess: true, residentUID: residentUID });
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
  
  export default addResidentRecordTransaction;
  