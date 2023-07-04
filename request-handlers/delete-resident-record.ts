import { Request, Response } from "express";
import deleteResidentRecordTransaction from "../mysql/deleteResidentRecordTransaction";
import identifyIfBarangayOfficial from "../mysql/identifyRelation";

const handleDeleteResidentRecord = async (req: Request, res: Response) => {
    const residentUID = req.body.residentUID;
    
    try {
        const isBargyOfficial = await identifyIfBarangayOfficial(residentUID);

        if(isBargyOfficial.related) return res.status(400).json({success: false});
        
        const success = await  deleteResidentRecordTransaction(residentUID);

        if(success.querySuccess) res.status(200).json({success: true});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({success: false});
    }
    
}

export default handleDeleteResidentRecord;