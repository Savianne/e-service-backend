import { Request, Response } from "express";
import getTerm from "../mysql/getTerm";

const handleGetTerm = async (req: Request, res: Response) => {
    const termID = req.params.termID;
    try {
        const term = await getTerm(termID);
        res.json({success: true, data: term.result});
    }
    catch (err) {
        res.sendStatus(500);
    }

}

export default handleGetTerm;