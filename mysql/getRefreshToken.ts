import pool from "./pool";

async function getRefreshToken(token: string) {
    const promisePool = pool.promise();
    const [rows, fields] = await promisePool.query("SELECT * FROM refresh_token WHERE refresh_token = ?", [token]);
    return rows;
}

export default getRefreshToken;