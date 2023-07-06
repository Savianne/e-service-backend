import express, { RequestHandler, Request, Response } from 'express';
import { RowDataPacket, OkPacket } from 'mysql2';
import path from 'path';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from '../mysql/pool';
import getResidentRecord from '../mysql/getResidentRecord';
import { io } from '..';

dotenv.config();

const handleOnCreateStatusUpdate = (req: Request, res: Response) => {
    const residentUID = req.params.residentUID;
    const reqID = req.params.reqID;

    if(!residentUID) return res.sendStatus(404);
    
    const promisePool = pool.promise();

    promisePool.getConnection()
    .then(connection => {
        connection.beginTransaction()
        .then(async () => {
            const updateQ = (await connection.query(`UPDATE resident_doc_request SET status = 2 WHERE id = ?`, [reqID]) as OkPacket[])[0];
            
            if(updateQ.affectedRows == 0) throw Error
            
            const residentRecord = await getResidentRecord(residentUID);

            if(!residentRecord.result) throw residentRecord.result;

            const r = residentRecord.result as unknown as {
                firstName: string,
                middleName: string,
                surname: string,
                extName: string | null,
                gender: string,
                maritalStatus: string,
                dateOfBirth: string,
            }

            const sender = {
                name: `${r.firstName} ${r.middleName[0]}. ${r.surname} ${r.extName? r.extName : ""}`,
                dateOfBirth: r.dateOfBirth,
                gender: r.gender,
                maritalStatus: r.maritalStatus,
            }

            const requestDoc =  (await connection.query(`
                SELECT dt.document_type AS documentType, rdr.purpose, rs.status, rdr.id
                FROM resident_doc_request AS rdr
                JOIN request_statuses AS rs ON rdr.status = rs.id
                JOIN document_type AS dt ON rdr.document_type = dt.id
                WHERE rdr.resident_uid = ? AND rdr.id = ?
            `, [residentUID, reqID]) as RowDataPacket[][])[0][0];


            const brgyChairpersonQ = (await connection.query(`
                SELECT 
                    fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName
                FROM barangay_chairperson AS bc
                JOIN residents AS r ON bc.resident_uid = r.resident_uid
                JOIN personal_information AS pi ON r.personal_information = pi.id
                JOIN full_name AS fn ON pi.full_name = fn.id;
            `) as RowDataPacket[][])[0][0];

            const barangayChairperson = brgyChairpersonQ? `Hon. ${brgyChairpersonQ.firstName.toUpperCase()} ${brgyChairpersonQ.middleName[0].toUpperCase()}. ${brgyChairpersonQ.surname.toUpperCase()} ${brgyChairpersonQ.extName? brgyChairpersonQ.extName.toUpperCase() : ""}` : ""
            
            const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;
  
            const token = jwt.sign({
                from: { ...sender },
                barangayChairperson: barangayChairperson,
                documentType: requestDoc.documentType,
                purpose: requestDoc.purpose
            }, access_token_secret, {expiresIn: '1h'});

            const docDownload = res.json({success: true, data: `http://localhost:3005/utils/doc-download/${token}`});

            connection.commit()
            .then(() => {
                connection.release();
                io.emit(`DOC_REQ_STATUS_UPDATE_FOR_${residentUID}`)
                res.json({success: true, data: docDownload})
            })
            .catch((commitError) => {
                connection.release()
                throw new Error
            });
        })
        .catch((beginTransactionError) => {
            connection.rollback();
            connection.release()
            throw new Error
        });
    })
    .catch((getConnectionError) => {
        console.log(getConnectionError)
        res.sendStatus(500)
    })
}

export default handleOnCreateStatusUpdate;