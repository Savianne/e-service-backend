import { Request, Response } from "express";
import { OkPacket } from "mysql2";
import { io } from "..";
import pool from "../mysql/pool";

const handleUpdateDocReqStatus = async (req: Request, res: Response) => {
    const reqID = req.params.reqID;
    const newStatus = req.params.statusCode;
    const from = req.params.from

    const poolCon = pool.promise();

    try {
        const updateQ = (await poolCon.query(`UPDATE resident_doc_request SET status = ? WHERE id = ?`, [newStatus, reqID]) as OkPacket[])[0];
       
        if(updateQ.affectedRows > 0) {
            io.emit(`DOC_REQ_STATUS_UPDATE_FOR_${from}`);
            res.send({success: true});
        } else {
            res.sendStatus(500);
        }
    }
    catch(err) {
        console.log(err);
        res.sendStatus(500);
    }

}

export default handleUpdateDocReqStatus;