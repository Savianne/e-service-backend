import pool from "./pool";
import { RowDataPacket } from "mysql2";

async function identifyIfBarangayOfficial(residentUID: string) {
    const promisePool = pool.promise();

    return new Promise<{related: boolean}>( async (resolve, reject) => {
        try {
            const isBarangayChairperson = (await promisePool.query("SELECT COUNT(*) as count FROM  barangay_chairperson AS bc WHERE bc.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isBarangayChairperson.count) return resolve({related: true});
            const isBarangaySecretary = (await promisePool.query("SELECT COUNT(*) as count FROM  barangay_secretary AS bs WHERE bs.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isBarangaySecretary.count) return resolve({related: true});
            const isBarangayTreasurer = (await promisePool.query("SELECT COUNT(*) as count FROM  barangay_treasurer AS bt WHERE bt.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isBarangayTreasurer.count) return resolve({related: true});
            const isBarangayCouncilor = (await promisePool.query("SELECT COUNT(*) as count FROM  barangay_councilors AS bt WHERE bt.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isBarangayCouncilor.count) return resolve({related: true});
            const isSkChairperson = (await promisePool.query("SELECT COUNT(*) as count FROM sk_chairperson AS bt WHERE bt.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isSkChairperson.count) return resolve({related: true});
            const isSKSecretary = (await promisePool.query("SELECT COUNT(*) as count FROM sk_secretary AS bt WHERE bt.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isSKSecretary.count) return resolve({related: true});
            const isSkTreasurer = (await promisePool.query("SELECT COUNT(*) as count FROM sk_treasurer AS bt WHERE bt.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isSkTreasurer.count) return resolve({related: true});
            const isSKCouncilor = (await promisePool.query("SELECT COUNT(*) as count FROM sk_councilors AS bt WHERE bt.resident_uid = ?", [residentUID]) as RowDataPacket[][])[0][0];
            if(isSKCouncilor.count) return resolve({related: true});
    
            return resolve({related: false});
        }
        catch(err) {
            console.log(err);
        }
    })
}

export default identifyIfBarangayOfficial;