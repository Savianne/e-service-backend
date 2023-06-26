import pool from "./pool";
import { OkPacket } from "mysql2";

async function resetPassword(password: string, accountUID: string) {
    const promisePool = pool.promise();
    try {
        const result = ((await promisePool.query("UPDATE user_account SET password = ? WHERE account_uid = ?", [password, accountUID])) as OkPacket[])[0].affectedRows;
        return result > 0? { success: true } : { success: false };
    }
    catch(err) {
        console.log(err)
        return  { success: false }
    }
}

export default resetPassword;