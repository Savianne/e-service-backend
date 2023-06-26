import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";
export interface IQueryPromise {
    querySuccess: boolean;
    error?: string;
    result?: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader
}