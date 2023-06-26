import pool from "./pool";
import { OkPacket } from "mysql2";

async function addRefreshToken(token: string, exp_date: string) {
    const promisePool = pool.promise();
    try {
        const [res] = await promisePool.query(
            "INSERT INTO refresh_token (refresh_token, exp_date) VALUES (?, ?)",
            [token, exp_date]
        );
    
        return res as OkPacket;
      } catch (error) {
        console.error("Error occurred while executing the query:", error);
        throw error; // Re-throw the error to be handled at the caller level
      }
}

export default addRefreshToken;