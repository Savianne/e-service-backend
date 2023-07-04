import { Request, Response } from "express";
import getResidentRecord from "../mysql/getResidentRecord";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generatePDFEnpoint = async (req: Request, res: Response) => {
    const residentUID = req.body.residentUID;
    const purpose = req.body.purpose;
    const type = req.body.type;
    try {
        const residentRecord = await getResidentRecord(residentUID);
        if(residentRecord.result) {
            const r = residentRecord.result as unknown as {
                firstName: string,
                middleName: string,
                surname: string,
                extName: string | null,
                gender: string,
                maritalStatus: string,
                dateOfBirth: string,
            }

            const resident = {
                name: `${r.firstName} ${r.middleName[0]}. ${r.surname} ${r.extName? r.extName : ""}`,
                dateOfBirth: r.dateOfBirth,
                gender: r.gender,
                maritalStatus: r.maritalStatus,
                purpose: purpose
            }

            const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;
  
            const token = jwt.sign(resident, access_token_secret);

            res.json({success: true, data: `http://localhost:3005/utils/pdf-generator/indigency/${token}`});
        } else {
            res.sendStatus(404);
        }
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500);
    }

}

export default generatePDFEnpoint;