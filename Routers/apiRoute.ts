import express, { RequestHandler } from 'express';
import { IUserRequest } from '../types/IUserRequest';

//Handlers 
import handleAddResidentRecord from '../request-handlers/add-resident-handler';
import handleGetResidentsRecord from '../request-handlers/get-residents-record-handler';

//Custom Middleware
import verifyUserMiddleware from '../CustomMiddleware/verifyUserRequest';

const apiRoute = express.Router();

apiRoute.use(verifyUserMiddleware as RequestHandler);

apiRoute.post('/add-resident-record', handleAddResidentRecord);

apiRoute.post('/get-residents-record', handleGetResidentsRecord);

export default apiRoute;