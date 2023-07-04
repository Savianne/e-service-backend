import pool from "./pool";
import { OkPacket, RowDataPacket } from "mysql2";
import { IQueryPromise } from "./IQueryPromise";
import getTerm from "./getTerm";

type TTerm = {
    term: number,
    start: number,
    end: number
}

async function getTerms(): Promise<{success: boolean, result?: any}> {
    const promisePool = pool.promise();
    return new Promise<{success: boolean, result?: any}>( async (resolve, reject) => {
        try {
            const getTermIDs = (await promisePool.query("SELECT * FROM term_of_service") as RowDataPacket[][])[0] as TTerm[];
    
            const resultContainer = [];

            for(let c = 0; c < getTermIDs.length; c++) {
                const personels = await getTerm(getTermIDs[c].term);
                resultContainer.push({
                    ...getTermIDs[c],
                    ...personels.result
                })
            }
            
            resolve({success: true, result: resultContainer})
        }
        catch(err) {
            reject({success: false, error: err});
        }
    });
  }
  
  export default getTerms;
  