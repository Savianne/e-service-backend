import { Request, Response } from "express";
import getSenioCitizenResidentsRecordTransaction from "../mysql/getSeniorCitizenResident";

const handleGetSeniorCitizenResidentsRecord = async (req: Request, res: Response) => {
    try {
        const residentsRecord = await getSenioCitizenResidentsRecordTransaction();
        res.json({success: true, data: residentsRecord.result});
    }
    catch (err) {
        res.sendStatus(500);
    }

}

export default handleGetSeniorCitizenResidentsRecord;