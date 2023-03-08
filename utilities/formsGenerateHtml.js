const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const htmlToPdf = require('html-pdf');

app.post('/ruta-a-tu-servidor', async (req, res) => {
  const { nombre, email, telefono } = req.body;

  const html = `
    <html>
      <head>
        <title>Formulario</title>
      </head>
      <body>
        <h1>Datos del formulario</h1>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
      </body>
    </html>
  `;

  // Convertimos el HTML a PDF utilizando html-pdf
  const pdfBuffer = await new Promise((resolve, reject) => {
    htmlToPdf.create(html).toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });

  // Creamos un nuevo PDF utilizando pdf-lib
  const pdfDoc = await PDFDocument.create();
  const existingPdfBytes = pdfBuffer;
  const pages = await pdfDoc.copyPages(
    PDFDocument.load(existingPdfBytes),
    [0]
  );
  pages.forEach((page) => pdfDoc.addPage(page));

  // Guardamos el PDF en el sistema de archivos local
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('formulario.pdf', pdfBytes);

  // Enviamos el PDF al cliente
  res.contentType('application/pdf');
  res.send(pdfBytes);

  // Eliminamos el archivo del sistema de archivos local
  const rutaPdf = path.join(__dirname, 'formulario.pdf');
  fs.unlinkSync(rutaPdf);
});
