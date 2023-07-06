import express, { RequestHandler } from 'express';
import { RowDataPacket } from 'mysql2';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from '../mysql/pool';

//Custom Middleware
import verifyUserMiddleware from '../CustomMiddleware/verifyUserRequest';

//pdf generator
import generateIndigency from '../pdf-generators/indigency';

dotenv.config();

const utilityRoute = express.Router();

utilityRoute.use(verifyUserMiddleware as RequestHandler);

utilityRoute.get("/doc-download/:reqInfo", async (req, res) => {
    const info = req.params.reqInfo;
    if(!info) {
        return res.sendStatus(404);
    }
    
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

    jwt.verify(info, access_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(error) {
            return res.sendStatus(404);
        }

        if(decoded) {
            const request = decoded as {
                from: {
                    name: string,
                    maritalStatus: string,
                    dateOfBirth: string,
                    gender: string
                },
                barangayChairperson: string,
                documentType: string,
                purpose: string,
            };

            //For now its only for indigency
            const doc = request.documentType.toLowerCase() == 'indigency'? generateIndigency({
                    name: request.from.name,
                    maritalStatus: request.from.maritalStatus,
                    dateOfBirth: request.from.dateOfBirth,
                    purpose: request.purpose,
                    barangayChairperson: request.barangayChairperson
                }
            ) : null;
            
            if(doc) {
                // Set the response headers for file download
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', 'attachment; filename="downloaded.pdf"');
    
                // Create a stream and pipe the PDF data to it
                doc.pipe(res);
                
                doc.end();

            } else res.sendStatus(404);

        }
    })
});


utilityRoute.get("/pdf-generator/indigency/:reqInfo", async (req, res) => {
    const info = req.params.reqInfo;
    if(!info) {
        return res.sendStatus(404);
    }
    
    const PollConnection = pool.promise();

    const brgyChairpersonQ = (await PollConnection.query(`
        SELECT 
            fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName
        FROM barangay_chairperson AS bc
        JOIN residents AS r ON bc.resident_uid = r.resident_uid
        JOIN personal_information AS pi ON r.personal_information = pi.id
        JOIN full_name AS fn ON pi.full_name = fn.id;
    `) as RowDataPacket[][])[0][0];

    const barangayChairperson = brgyChairpersonQ? `Hon. ${brgyChairpersonQ.firstName.toUpperCase()} ${brgyChairpersonQ.middleName[0].toUpperCase()}. ${brgyChairpersonQ.surname.toUpperCase()} ${brgyChairpersonQ.extName? brgyChairpersonQ.extName.toUpperCase() : ""}` : ""
    
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

    jwt.verify(info, access_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(error) {
            return res.sendStatus(404);
        }

        if(decoded) {
            const request = decoded as {
                name: string,
                maritalStatus: string,
                dateOfBirth: string,
                purpose: string,
            };

            const doc = generateIndigency({...request, barangayChairperson});

            // Set response headers
            res.setHeader('Content-Disposition', 'inline; filename="sandiat-centro-cert-of-indigency.pdf"');
            res.setHeader('Content-Type', 'application/pdf');

            // Pipe the PDF document to the response
            doc.pipe(res);

            // End the PDF document
            doc.end();

        } else {
            return res.sendStatus(404);
        }
    });
    
});


export default utilityRoute;