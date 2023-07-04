import pool from "./pool";
import { OkPacket } from "mysql2";
import { IQueryPromise } from "./IQueryPromise";

type TPerson = {
    residentUID: string
}

type TPersonWidthCommittee = {
    residentUID: string,
    committee: string
}

interface ITerm {
    startYear: number,
    endYear: number,
    barangayChairperson: TPerson,
    barangayTreasurer: TPerson,
    barangaySecretary: TPerson,
    barangayCouncilors: TPersonWidthCommittee[]
}

async function addTermTransaction(term: ITerm): Promise<IQueryPromise> {
    const promisePool = pool.promise();
    return new Promise<IQueryPromise>((resolve, reject) => {
        promisePool.getConnection()
        .then(connection => {
            connection.beginTransaction()
            .then(async () => {
                //Delete the current term
                await connection.query("DELETE FROM term_of_service");
                await connection.query("DELETE FROM barangay_chairperson");
                await connection.query("DELETE FROM barangay_secretary");
                await connection.query("DELETE FROM barangay_treasurer");
                await connection.query("DELETE FROM barangay_councilors");

                const createTermQ = "INSERT INTO term_of_service (start, end) VALUES(?, ?)";
                const insertBarangayChairperson = "INSERT INTO barangay_chairperson (term, resident_uid) VALUES(?, ?)";
                const insertBarangaySercretary = "INSERT INTO barangay_secretary (term, resident_uid) VALUES(?, ?)";
                const insertBarangayTreasurer = "INSERT INTO barangay_treasurer (term, resident_uid) VALUES(?, ?)";
                const insertBarangayCouncilors = "INSERT INTO barangay_councilors (term, resident_uid, committee) VALUES(?, ?, ?)";

                const termID = (await connection.query(createTermQ, [term.startYear, term.endYear]) as OkPacket[])[0].insertId;

                await connection.query(insertBarangayChairperson, [termID, term.barangayChairperson.residentUID]);
                await connection.query(insertBarangaySercretary, [termID, term.barangaySecretary.residentUID]);
                await connection.query(insertBarangayTreasurer, [termID, term.barangayTreasurer.residentUID]);

                for(let c = 0; c < term.barangayCouncilors.length; c++) {
                    await connection.query(insertBarangayCouncilors, [termID, term.barangayCouncilors[c].residentUID, term.barangayCouncilors[c].committee]);
                }

                connection.commit()
                .then(() => {
                    connection.release();
                    resolve({ querySuccess: true});
                })
                .catch((commitError) => {
                    connection.release()
                    reject({
                        querySuccess: false,
                        error: commitError,
                    });
                });
            })
            .catch((beginTransactionError) => {
                connection.rollback();
                connection.release()
                reject({
                    querySuccess: false,
                    error: beginTransactionError,
                });
            });
        })
        .catch((getConnectionError) => {
            reject({
                querySuccess: false,
                error: getConnectionError,
            });
        })
    });
  }
  
  export default addTermTransaction;
  