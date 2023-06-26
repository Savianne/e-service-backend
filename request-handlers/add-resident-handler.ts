import { Request, Response } from "express";
import addResidentRecordTransaction from "../mysql/addResidentTransaction";
import { IUserRequest } from "../types/IUserRequest";

const handleAddResidentRecord = async (req: Request, res: Response) => {
    const adminRequest = req as IUserRequest;
    const residentRecord = req.body.residentRecord;
    
    addResidentRecordTransaction(residentRecord, adminRequest.user?.UID as string)
    .then(q => {
        res.status(200).json({success: true});
    })
    .catch(err => {
        console.log(err)
        res.status(401).json({success: false, error: err.error})
    })
}

export default handleAddResidentRecord;