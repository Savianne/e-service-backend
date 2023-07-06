import express, { RequestHandler } from 'express';
import { IUserRequest } from '../types/IUserRequest';

//Handlers 
import handleAddResidentRecord from '../request-handlers/add-resident-handler';
import handleGetResidentsRecord from '../request-handlers/get-residents-record-handler';
import handleGetResidentRecord from '../request-handlers/get-resident-record-handler';
import handleDeleteResidentRecord from '../request-handlers/delete-resident-record';
import handleUpdateResidentRecord from '../request-handlers/update-resident-record-handler';
import handleUpdateResidentAddress from '../request-handlers/update-resident-address';
import getCommitteeHandler from '../request-handlers/get-committee-handler';
import handleAddTerm from '../request-handlers/add-term-handler';
import handleGetTerm from '../request-handlers/handle-get-term';
import handleGetTerms from '../request-handlers/get-terms';
import handleAddSKTerm from '../request-handlers/add-sk-term-handler';
import handleGetSKTerms from '../request-handlers/get-sk-terms-handler';
import handleGetSeniorCitizenResidentsRecord from '../request-handlers/get-senio-citizens-handler';
import generatePDFEnpoint from '../request-handlers/generate-pdf-endpoit';
import handleGetResidentDocRequest from '../request-handlers/get-resident-doc-request';
import handleOnCreateStatusUpdate from '../request-handlers/handle-oncreate-status-update';

//Custom Middleware
import verifyUserMiddleware from '../CustomMiddleware/verifyUserRequest';
import handleUpdateDocReqStatus from '../request-handlers/update-doc-request-status';

const apiRoute = express.Router();

apiRoute.use(verifyUserMiddleware as RequestHandler);

apiRoute.post('/add-resident-record', handleAddResidentRecord);

apiRoute.post('/get-residents-record', handleGetResidentsRecord);

apiRoute.post('/get-resident-record', handleGetResidentRecord);

apiRoute.delete('/delete-resident-record', handleDeleteResidentRecord);

apiRoute.patch('/update-resident-record', handleUpdateResidentRecord);

apiRoute.patch('/update-resident-address', handleUpdateResidentAddress);

apiRoute.post('/add-term', handleAddTerm);

apiRoute.post('/add-sk-term', handleAddSKTerm);

apiRoute.get('/get-committee/:org', getCommitteeHandler);

apiRoute.get('/get-term/:termID', handleGetTerm);

apiRoute.post('/get-terms', handleGetTerms);

apiRoute.post('/get-sk-terms', handleGetSKTerms);

apiRoute.post('/get-senior-citizens', handleGetSeniorCitizenResidentsRecord);

apiRoute.post('/generate-pdf', generatePDFEnpoint);

apiRoute.post('/get-doc-request', handleGetResidentDocRequest);

apiRoute.patch(`/update-request-status/:reqID/:statusCode/:from`, handleUpdateDocReqStatus);

apiRoute.patch('/update-doc-req-as-created/:residentUID/:reqID', handleOnCreateStatusUpdate);

export default apiRoute;