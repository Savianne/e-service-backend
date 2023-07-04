import { Request, Response } from "express";
import getResidentDocumentRequest from "../mysql/getResidentDocRequest";

type TRequestDoc = {
    documentType: string,
    purpose: string,
    status: string,
    id: 1,
    residentUID: string,
    fullName: string,
    picture: string | null
}

const handleGetResidentDocRequest = async (req: Request, res: Response) => {
    try {
        const residentRecord = await getResidentDocumentRequest();
        if(residentRecord.result) {
            const r = residentRecord.result as TRequestDoc[];
            res.json({success: true, data: r.map(i => ({
                from: {
                    fullName: i.fullName,
                    residentUID: i.residentUID,
                    picture: i.picture
                },
                documentType: i.documentType,
                id: i.id,
                purpose: i.purpose,
                status: i.status
            }))});
        } else {
            res.sendStatus(404);
        }
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500);
    }

}

export default handleGetResidentDocRequest;