import pool from "./pool";

async function getCommittee(org: "barangay" | "sk") {
    const promisePool = pool.promise();
    const [rows, fields] = org == "barangay"? await promisePool.query("SELECT * FROM committee") : await promisePool.query("SELECT * FROM committee_for_sk");
    return rows;
}

export default getCommittee;