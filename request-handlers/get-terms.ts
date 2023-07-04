import { Request, Response } from "express";
import getTerms from "../mysql/getTerms";

const handleGetTerms = async (req: Request, res: Response) => {
    try {
        const term = await getTerms();
        res.json({success: true, data: term.result});
    }
    catch (err) {
        res.sendStatus(500);
    }

}

export default handleGetTerms;