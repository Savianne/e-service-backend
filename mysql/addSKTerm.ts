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

interface ISKTerm {
    startYear: number,
    endYear: number,
    skChairperson: TPerson,
    skTreasurer: TPerson,
    skSecretary: TPerson,
    skCouncilors: TPersonWidthCommittee[]
}

async function addSKTermTransaction(term: ISKTerm): Promise<IQueryPromise> {
    const promisePool = pool.promise();
    return new Promise<IQueryPromise>((resolve, reject) => {
        promisePool.getConnection()
        .then(connection => {
            connection.beginTransaction()
            .then(async () => {
               
                //Delete the current term
                await connection.query("DELETE FROM term_of_service_sk");
                await connection.query("DELETE FROM sk_chairperson");
                await connection.query("DELETE FROM sk_secretary");
                await connection.query("DELETE FROM sk_treasurer");
                await connection.query("DELETE FROM sk_councilors");

                const createTermQ = "INSERT INTO term_of_service_sk (start, end) VALUES(?, ?)";
                const insertSKChairperson = "INSERT INTO sk_chairperson (term, resident_uid) VALUES(?, ?)";
                const insertSKSercretary = "INSERT INTO sk_secretary (term, resident_uid) VALUES(?, ?)";
                const insertSKTreasurer = "INSERT INTO sk_treasurer (term, resident_uid) VALUES(?, ?)";
                const insertSKCouncilors = "INSERT INTO sk_councilors (term, resident_uid, committee) VALUES(?, ?, ?)";

                const termID = (await connection.query(createTermQ, [term.startYear, term.endYear]) as OkPacket[])[0].insertId;

                await connection.query(insertSKChairperson, [termID, term.skChairperson.residentUID]);
                await connection.query(insertSKSercretary, [termID, term.skSecretary.residentUID]);
                await connection.query(insertSKTreasurer, [termID, term.skTreasurer.residentUID]);

                for(let c = 0; c < term.skCouncilors.length; c++) {
                    await connection.query(insertSKCouncilors, [termID, term.skCouncilors[c].residentUID, term.skCouncilors[c].committee]);
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
  
  export default addSKTermTransaction;
  