import { Request, Response } from "express";
import getCommittee from "../mysql/getCommittee";

const getCommitteeHandler = async (req: Request, res: Response) => {
    const org = req.params.org;
    const committee = await getCommittee(org as "barangay" | "sk");

    res.json({success: true, data: committee});
}

export default getCommitteeHandler;