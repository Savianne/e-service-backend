import pool from "./pool";
import { OkPacket } from "mysql2";
import { IAdmin } from "../types/IAdmin";

async function makeSuperAdmin(admin: IAdmin) {
    const promisePool = pool.promise();
    try {
        const result = ((await promisePool.query("INSERT INTO user_account (account_uid, name, password, email, main_admin, avatar) VALUES (?, ?, ?, ?, ?, ?)", [admin.account_uid, admin.name, admin.password, admin.email, admin.main_admin, admin.avatar])) as unknown as OkPacket).affectedRows;
        if(result > 0) return  { success: true }
        throw "Error";
    }
    catch(err) {
        console.log(err)
        throw err;
    }
}

export default makeSuperAdmin;