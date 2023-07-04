"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const calculateAge_1 = __importDefault(require("../Helpers/calculateAge"));
const transformText_1 = __importDefault(require("../Helpers/transformText"));
function generateIndigency(request) {
    // Create a new PDF document
    const doc = new pdfkit_1.default();
    doc.opacity(0.02);
    doc.image(path_1.default.join(__dirname, "../../public/brgy-sandiat-centro-logo.jpg"), 40, 170, { width: (doc.page.width - 80), height: (doc.page.width - 80) });
    doc.opacity(0.15);
    doc.image(path_1.default.join(__dirname, "../../public/assets/images/phflag.jpg"), 0, 0, { width: 500 });
    doc.opacity(1);
    doc.font('Times-Roman');
    doc.fontSize(12);
    doc.lineGap(3);
    doc.text(`Republic of the Philippines`, 0, 30, {
        width: doc.page.width,
        align: 'center'
    });
    doc.text(`Province of Isabela`, {
        width: doc.page.width,
        align: 'center'
    });
    doc.text(`Municipality of San Manuel`, {
        width: doc.page.width,
        lineGap: 10,
        align: 'center'
    });
    doc.font('Times-Bold');
    doc.text(`BARANGAY SANDIAT CENTRO`, {
        width: doc.page.width,
        align: 'center'
    });
    doc.image(path_1.default.join(__dirname, "../../public/san-manuel-logo.png"), 70, 40, { width: 70, height: 70 });
    doc.image(path_1.default.join(__dirname, "../../public/brgy-sandiat-centro-logo.jpg"), (doc.page.width - 70) - 70, 40, { width: 70, height: 70 });
    doc.moveDown(0.3);
    doc.fontSize(16);
    doc.text(`OFFICE OF THE BARANGAY CAPTAIN`, {
        width: doc.page.width,
        align: 'center'
    });
    doc.moveDown(0.1);
    doc.font('Helvetica-Bold');
    doc.fontSize(10);
    doc.text(`Brgy. Hall at Purok 2, Sandiat Centro, San Manuel, Isabela`, {
        width: doc.page.width,
        align: 'center'
    });
    doc.lineWidth(4);
    doc.strokeColor('gray')
        .strokeOpacity(0.09)
        .lineCap('round')
        .moveTo(50, 160)
        .lineTo(doc.page.width - 50, 160)
        .stroke();
    doc.strokeColor('black')
        .strokeOpacity(1);
    doc.moveDown(5);
    doc.font('Times-Bold');
    doc.fontSize(30);
    doc.text(`CERTIFICATE OF INDIGENCY`, {
        width: doc.page.width,
        align: 'center'
    });
    doc.moveDown(1);
    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text(`TO WHOM IT MAY CONCERN:`, 72, 300, {
        width: doc.page.width - 144,
        align: 'left'
    })
        .moveDown(1)
        .font('Helvetica')
        .text(`This is to certify that ${request.name.toUpperCase()}, ${(0, calculateAge_1.default)(new Date(request.dateOfBirth))} years of age, ${request.maritalStatus}, Filipino and a Bonafede resident of this Barangay Sandiat Centro, San Manuel, Isabela.`, { indent: 72 })
        .moveDown(1)
        .text(`It is further certified that the said person who is known to be undersigned is a person of good moral and character, law abiding citizen no criminal records as to this date and one of the INDIGENT fellows in our community.`, { indent: 72 })
        .moveDown(1)
        .text(`This CERTIFICATION is being issued upon request of the above-named person in connection to the purpose stated below:`, { indent: 72 })
        .moveDown(1)
        .text(`Given this ${(0, transformText_1.default)(new Date())} at Sandiat Centro, San Manuel, Isabela.`, { indent: 72 })
        .moveDown(2)
        .font('Helvetica-Bold')
        .text(`Purpose:`, { continued: true })
        .font('Helvetica')
        .text(`${request.purpose}`, { underline: true });
    doc.lineWidth(1);
    doc.strokeColor('black')
        .strokeOpacity(1)
        .lineCap('round')
        .moveTo(72, 630)
        .lineTo(72 + 200, 630)
        .stroke();
    doc.fontSize(11)
        .font('Helvetica-Bold')
        .text(`${request.name.toUpperCase()}`, 72, 615, { width: 200, align: 'center' });
    doc.fontSize(9)
        .font('Helvetica')
        .text(`Signature over printed name`, 72, 635, { width: 200, align: 'center' });
    doc.lineWidth(1);
    doc.strokeColor('black')
        .strokeOpacity(1)
        .lineCap('round')
        .moveTo((doc.page.width - 72) - 200, 680)
        .lineTo(doc.page.width - 72, 680)
        .stroke();
    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text(`${request.barangayChairperson.toUpperCase()}`, (doc.page.width - 72) - 200, 665, { width: 200, align: 'center' });
    doc.fontSize(9)
        .font('Helvetica')
        .text('Punong Barangay', (doc.page.width - 72) - 200, 685, { width: 200, align: 'center' });
    return doc;
}
exports.default = generateIndigency;
