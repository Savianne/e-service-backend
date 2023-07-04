import { Request, Response } from "express";
import getSKTerms from "../mysql/getSKTerms";

const handleGetSKTerms = async (req: Request, res: Response) => {
    try {
        const term = await getSKTerms();
        res.json({success: true, data: term.result});
    }
    catch (err) {
        res.sendStatus(500);
    }

}

export default handleGetSKTerms;