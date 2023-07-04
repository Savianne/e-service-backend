import { Request, Response } from "express";
import getResidentRecord from "../mysql/getResidentRecord";

const handleGetResidentRecord = async (req: Request, res: Response) => {
    const residentUID = req.body.residentUID;
    try {
        const residentRecord = await getResidentRecord(residentUID);
        if(residentRecord.result) {
            res.json({success: true, data: residentRecord.result});
        } else {
            res.sendStatus(404);
        }
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500);
    }

}

export default handleGetResidentRecord;