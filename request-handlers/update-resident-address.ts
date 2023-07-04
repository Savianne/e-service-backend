import { Request, Response } from "express";
import updateResidentAddressTransaction from "../mysql/updateResidentAddressTransaction";

const handleUpdateResidentAddress = (req: Request, res: Response) => {
    const residentUID = req.body.residentUID;
    const recordUpdates = req.body.recordUpdates;

    // console.log(recordUpdates)
    updateResidentAddressTransaction(residentUID, recordUpdates)
    .then(response => {
        res.status(200).json({success: true});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({success: false});
    })
    
}

export default handleUpdateResidentAddress;