import { Request, Response } from "express";
import addTermTransaction from "../mysql/addTerm";

const handleAddTerm = async (req: Request, res: Response) => {
    const term = req.body;
    addTermTransaction(term)
    .then(q => {
        res.status(200).json({success: true});
    })
    .catch(err => {
        console.log(err)
        res.status(401).json({success: false, error: err.error})
    })
}

export default handleAddTerm;