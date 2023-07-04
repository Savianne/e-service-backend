import { Request, Response } from "express";
import updateResidentRecordTransaction from "../mysql/updateResidentRecordTransaction";

const handleUpdateResidentRecord = (req: Request, res: Response) => {
    const residentUID = req.body.residentUID;
    const recordUpdates = req.body.recordUpdates;

    updateResidentRecordTransaction(residentUID, recordUpdates)
    .then(response => {
        res.status(200).json({success: true});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({success: false});
    })
    
}

export default handleUpdateResidentRecord;