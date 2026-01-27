const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

try {
    const instance = new PDFParse();
    console.log("Instance:", instance);
    console.log("Prototype:", Object.getPrototypeOf(instance));
    console.log("Keys:", Object.keys(instance));
} catch (e) {
    console.log("Constructor Error:", e.message);
}
