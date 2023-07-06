import express, { RequestHandler } from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from '../mysql/pool';
import { io } from '../index';

dotenv.config();

const residentRoute = express.Router();

residentRoute.post('/logout', (req, res) => {
    res.clearCookie('residentToken');
    res.json({success: true});
})

residentRoute.post('/login', async (req, res) => {
    const residentUID = req.body.residentUID;

    if(!residentUID) return res.sendStatus(404);

    const poolCon = pool.promise();

    try {
        const userExist = ((await poolCon.query(`
        SELECT fn.first_name AS firstName, fn.middle_name AS middleName, fn.surname, fn.ext_name AS extName, dp.picture, r.resident_uid AS residentUID
        FROM residents AS r
        JOIN personal_information AS pi ON r.personal_information = pi.id
        JOIN full_name AS fn ON pi.full_name = fn.id
        LEFT JOIN display_picture AS dp ON r.display_picture = dp.id
        WHERE r.resident_uid = ?`, [residentUID]) as RowDataPacket[][])[0][0]) as {
            firstName: string,
            middleName: string, 
            surname: string,
            extName: string | null,
            residentUID: string,
            picture: string | null,
        }

        if(!userExist) return res.sendStatus(404);

        const user = {
            name: `${userExist.firstName} ${userExist.middleName[0]}. ${userExist.surname} ${userExist.extName? userExist.extName : ""}.`.toUpperCase(),
            picture: userExist.picture,
            residentUID: userExist.residentUID
        }

        const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

        const token = jwt.sign(user, access_token_secret, { expiresIn: '1h' });

        res.cookie('residentToken', token);
        
        res.json(
            {
                success: true,
                data: {
                login: true,
                user: user
            }
        });
    }
    catch(err) {
        res.sendStatus(404);
    }
});

residentRoute.post('/get-user-info', (req, res) => {
    const userToken = req.cookies.residentToken;

    if(!userToken) return res.sendStatus(404);

    const access_token_secret = process.env.ACCESS_TOKEN_SECRET as string;

    jwt.verify(userToken, access_token_secret, async (error: jwt.VerifyErrors | jwt.TokenExpiredError | null, decoded: string | jwt.JwtPayload | undefined) => {
        if(error) return res.sendStatus(404);

        if(decoded) {
            return res.json({
                success: true,
                data: decoded,
            });
        }
    })
});

residentRoute.post('/make-request', (req, res) => {
    const reqData = req.body as {
        residentUID: string,
        documentType: string,
        purpose: string
    }

    const poolCon = pool.promise();

    poolCon.getConnection()
    .then(connection => {
        connection.beginTransaction()
        .then(async () => {
            const insertRequest = (await connection.query(`
            INSERT INTO resident_doc_request (resident_uid, document_type, purpose) VALUES(?, ?, ?)
            `, [
                reqData.residentUID,
                reqData.documentType,
                reqData.purpose
            ]) as OkPacket[])[0].insertId;

            if(insertRequest) {
                connection.commit();
                connection.release();
                io.emit("NEW_DOC_REQUEST");
                io.emit("REFRESH_REQUEST_LIST");
                res.json({success: true, data: insertRequest});
            } else {
                connection.rollback();
                connection.release();
                res.sendStatus(500);
            }

        })
        .catch((beginTransactionError) => {
            console.log(beginTransactionError)
            connection.rollback();
            connection.release();
            res.sendStatus(500);
        });
    })
    .catch((getConnectionError) => {
        console.log(getConnectionError)
        res.sendStatus(500);
    })
    
})

residentRoute.post('/get-request-list', async (req, res) => {
    const residentUID = req.body.residentUID;
    
    if(!residentUID) return res.sendStatus(404);

    const poolCon = pool.promise();

    try {
        const getList = (await poolCon.query(`
            SELECT dt.document_type AS documentType, rdr.purpose, rs.status, rdr.id
            FROM resident_doc_request AS rdr
            JOIN request_statuses AS rs ON rdr.status = rs.id
            JOIN document_type AS dt ON rdr.document_type = dt.id
            WHERE rdr.resident_uid = ?
        `, [residentUID]) as RowDataPacket[][])[0];
    
        res.json({success: true, data: getList});

    }
    catch(err) {
        console.log(err);
        res.sendStatus(500)
    }

})

residentRoute.delete(`/delete-request/:reqID`, async (req, res) => {
    const reqID = req.params.reqID;

    const poolCon = pool.promise();

    try {
        const deleteQ = (await poolCon.query(`DELETE FROM resident_doc_request AS r WHERE r.id = ?`, [reqID]) as OkPacket[])[0];
        if(deleteQ.affectedRows > 0) {
            io.emit("REFRESH_REQUEST_LIST")
            res.send({success: true});
        } else {
            res.sendStatus(500);
        }
    }
    catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

residentRoute.delete(`/update-request-status/:reqID/:statusCode`, async (req, res) => {
    const reqID = req.params.reqID;
    const newStatus = req.params.statusCode;

    const poolCon = pool.promise();

    try {
        const updateQ = (await poolCon.query(`UPDATE resident_doc_request SET status = ? WHERE id = ?`, [newStatus, reqID]) as OkPacket[])[0];
        console.log(updateQ.affectedRows)
        if(updateQ.affectedRows > 0) {
            io.emit("REFRESH_REQUEST_LIST")
            res.send({success: true});
        } else {
            res.sendStatus(500);
        }
    }
    catch(err) {
        console.log(err);
        res.sendStatus(500);
    }
});

residentRoute.post('/send-mail', (req, res) => {
    const sender = req.body.mail as {
        fullName: string,
        email: string,
        subject: string,
        query: string
    }

    const config = {
        service: 'gmail',
        auth: {
            user: process.env.GOOGLE_EMAIL,
            pass: process.env.GOOGLE_MAIL_APP_PASS
        }
    }

    const transport = nodemailer.createTransport(config);

    const notifyAdminThroughEmail = {
        from: process.env.GOOGLE_EMAIL,
        to: process.env.QUERY_MAIL_RECIEVER,
        subject: "New Query Received from Contact Us Form",
        html: `
        <!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                }

                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }

                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                }

                p {
                    line-height: inherit
                }

                .desktop_hide,
                .desktop_hide table {
                    mso-hide: all;
                    display: none;
                    max-height: 0px;
                    overflow: hidden;
                }

                .image_block img+div {
                    display: none;
                }

                @media (max-width:520px) {
                    .row-content {
                        width: 100% !important;
                    }

                    .mobile_hide {
                        display: none;
                    }

                    .stack .column {
                        width: 100%;
                        display: block;
                    }

                    .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0px;
                    }

                    .desktop_hide,
                    .desktop_hide table {
                        display: table !important;
                        max-height: none !important;
                    }
                }
            </style>
        </head>

        <body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;">
                <tbody>
                    <tr>
                        <td>
                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img src="https://bd95b7e152.imgdist.com/public/users/BeeFree/beefree-x22v0atqm3a/logo.png" style="display: block; height: auto; border: 0; width: 125px; max-width: 100%;" width="125"></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px;" width="500">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="color:#101112;direction:ltr;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                            <p style="margin: 0; margin-bottom: 16px;">Dear Admin, <br><br>You have received a new query from a user through the contact us form. <br><br>Here are the details: </p>
                                                                            <p style="margin: 0;">Full Name: ${sender.fullName} <br>Email: ${sender.email} <br>Subject: ${sender.subject} <br>Query: ${sender.query} <br><br>Please take the necessary actions to address the user's query promptly. Best regards,</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="color:#101112;direction:ltr;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                            <p style="margin: 0;">-Sandiat Centro Information & E-Services System</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="divider_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div class="alignment" align="center">
                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #BBBBBB;"><span>&#8202;</span></td>
                                                                                </tr>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="image_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/1012187_997059/brgy-sandiat-centro-logo.jpg" style="display: block; height: auto; border: 0; width: 100px; max-width: 100%;" width="100"></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table><!-- End -->
        </body>

        </html>
        `
    };

    const message = {
        from: process.env.GOOGLE_EMAIL,
        to: sender.email,
        subject: "Sandiat Centro Information and E-Services System (System Generated Message)",
        html: `
        <!DOCTYPE html>
        <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 0;
                }

                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: inherit !important;
                }

                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                }

                p {
                    line-height: inherit
                }

                .desktop_hide,
                .desktop_hide table {
                    mso-hide: all;
                    display: none;
                    max-height: 0px;
                    overflow: hidden;
                }

                .image_block img+div {
                    display: none;
                }

                @media (max-width:520px) {
                    .row-content {
                        width: 100% !important;
                    }

                    .mobile_hide {
                        display: none;
                    }

                    .stack .column {
                        width: 100%;
                        display: block;
                    }

                    .mobile_hide {
                        min-height: 0;
                        max-height: 0;
                        max-width: 0;
                        overflow: hidden;
                        font-size: 0px;
                    }

                    .desktop_hide,
                    .desktop_hide table {
                        display: table !important;
                        max-height: none !important;
                    }
                }
            </style>
        </head>

        <body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
            <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;">
                <tbody>
                    <tr>
                        <td>
                            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="image_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img src="https://bd95b7e152.imgdist.com/public/users/BeeFree/beefree-x22v0atqm3a/logo.png" style="display: block; height: auto; border: 0; width: 125px; max-width: 100%;" width="125"></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-radius: 0; color: #000000; width: 500px;" width="500">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="color:#101112;direction:ltr;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                            <p style="margin: 0;">Thank you, ${sender.fullName}, for contacting us! We appreciate your message and will respond to you promptly. If you have any further questions or concerns, feel free to let us know. Have a wonderful day!</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 500px;" width="500">
                                                <tbody>
                                                    <tr>
                                                        <td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                            <table class="paragraph_block block-1" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div style="color:#101112;direction:ltr;font-family:Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:16px;font-weight:400;letter-spacing:0px;line-height:120%;text-align:left;mso-line-height-alt:19.2px;">
                                                                            <p style="margin: 0;">-Sandiat Centro Information & E-Services System</p>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="divider_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad">
                                                                        <div class="alignment" align="center">
                                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                                <tr>
                                                                                    <td class="divider_inner" style="font-size: 1px; line-height: 1px; border-top: 1px solid #BBBBBB;"><span>&#8202;</span></td>
                                                                                </tr>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                            <table class="image_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                                <tr>
                                                                    <td class="pad" style="width:100%;padding-right:0px;padding-left:0px;">
                                                                        <div class="alignment" align="center" style="line-height:10px"><img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/1012187_997059/brgy-sandiat-centro-logo.jpg" style="display: block; height: auto; border: 0; width: 100px; max-width: 100%;" width="100"></div>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table><!-- End -->
        </body>

        </html>
        `
    }

    transport.sendMail(notifyAdminThroughEmail).then(response => {
        transport.sendMail(message).then(response => {
            return res.json({success: true});
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(500);
        })
    })
    .catch((err) => {
        console.log(err)
        res.sendStatus(500);
    })
});

export default residentRoute;