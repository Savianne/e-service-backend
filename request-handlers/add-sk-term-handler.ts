import { Request, Response } from "express";
import addSKTermTransaction from "../mysql/addSKTerm";

const handleAddSKTerm = async (req: Request, res: Response) => {
    const term = req.body;
    addSKTermTransaction(term)
    .then(q => {
        res.status(200).json({success: true});
    })
    .catch(err => {
        console.log(err)
        res.status(401).json({success: false, error: err.error})
    })
}

export default handleAddSKTerm;