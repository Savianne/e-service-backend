"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//Handlers 
const add_resident_handler_1 = __importDefault(require("../request-handlers/add-resident-handler"));
const get_residents_record_handler_1 = __importDefault(require("../request-handlers/get-residents-record-handler"));
const get_resident_record_handler_1 = __importDefault(require("../request-handlers/get-resident-record-handler"));
const delete_resident_record_1 = __importDefault(require("../request-handlers/delete-resident-record"));
const update_resident_record_handler_1 = __importDefault(require("../request-handlers/update-resident-record-handler"));
const update_resident_address_1 = __importDefault(require("../request-handlers/update-resident-address"));
const get_committee_handler_1 = __importDefault(require("../request-handlers/get-committee-handler"));
const add_term_handler_1 = __importDefault(require("../request-handlers/add-term-handler"));
const handle_get_term_1 = __importDefault(require("../request-handlers/handle-get-term"));
const get_terms_1 = __importDefault(require("../request-handlers/get-terms"));
const add_sk_term_handler_1 = __importDefault(require("../request-handlers/add-sk-term-handler"));
const get_sk_terms_handler_1 = __importDefault(require("../request-handlers/get-sk-terms-handler"));
const get_senio_citizens_handler_1 = __importDefault(require("../request-handlers/get-senio-citizens-handler"));
const generate_pdf_endpoit_1 = __importDefault(require("../request-handlers/generate-pdf-endpoit"));
const get_resident_doc_request_1 = __importDefault(require("../request-handlers/get-resident-doc-request"));
const handle_oncreate_status_update_1 = __importDefault(require("../request-handlers/handle-oncreate-status-update"));
//Custom Middleware
const verifyUserRequest_1 = __importDefault(require("../CustomMiddleware/verifyUserRequest"));
const update_doc_request_status_1 = __importDefault(require("../request-handlers/update-doc-request-status"));
const apiRoute = express_1.default.Router();
apiRoute.use(verifyUserRequest_1.default);
apiRoute.post('/add-resident-record', add_resident_handler_1.default);
apiRoute.post('/get-residents-record', get_residents_record_handler_1.default);
apiRoute.post('/get-resident-record', get_resident_record_handler_1.default);
apiRoute.delete('/delete-resident-record', delete_resident_record_1.default);
apiRoute.patch('/update-resident-record', update_resident_record_handler_1.default);
apiRoute.patch('/update-resident-address', update_resident_address_1.default);
apiRoute.post('/add-term', add_term_handler_1.default);
apiRoute.post('/add-sk-term', add_sk_term_handler_1.default);
apiRoute.get('/get-committee/:org', get_committee_handler_1.default);
apiRoute.get('/get-term/:termID', handle_get_term_1.default);
apiRoute.post('/get-terms', get_terms_1.default);
apiRoute.post('/get-sk-terms', get_sk_terms_handler_1.default);
apiRoute.post('/get-senior-citizens', get_senio_citizens_handler_1.default);
apiRoute.post('/generate-pdf', generate_pdf_endpoit_1.default);
apiRoute.post('/get-doc-request', get_resident_doc_request_1.default);
apiRoute.patch(`/update-request-status/:reqID/:statusCode`, update_doc_request_status_1.default);
apiRoute.patch('/update-doc-req-as-created/:residentUID/:reqID', handle_oncreate_status_update_1.default);
exports.default = apiRoute;
