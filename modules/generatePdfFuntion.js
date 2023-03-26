const helpers = require('./helpers').default
const puppeteer = require('puppeteer');

async function generatePdfControl(html, res) {
    // Registra los helpers de Handlebars
    helpers(exphbs.create({}));

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);

    // Generar el PDF y enviarlo como respuesta
    const pdf = await page.pdf({ format: 'Letter' });
    res.type('application/pdf');
    res.send(pdf);
    // Cerrar el navegador virtual
    await browser.close();
}


module.exports = {
    generatePdfControl
};