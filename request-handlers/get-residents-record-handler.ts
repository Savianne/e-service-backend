import { Request, Response } from "express";
import getResidentsRecord from "../mysql/getResidentsRecordTransaction";

const handleGetResidentsRecord = async (req: Request, res: Response) => {
    try {
        const residentsRecord = await getResidentsRecord();
        res.json({success: true, data: residentsRecord.result});
    }
    catch (err) {
        res.sendStatus(500);
    }

}

export default handleGetResidentsRecord;