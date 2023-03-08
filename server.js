const express = require('express');
const port = 3000;
const cors = require('cors')
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const app = express();

// Habilitar CORS

app.use(cors());
app.use(bodyParser.json());

app.post('/formulario', async (req, res) => {
  const { date, tipo, firstFlo, finishFlo, observaciones } = req.body;

  // Generar la plantilla HTML
  const html = `
    <html>
      <head>
        <style>
          /* Estilos CSS para la plantilla */
        </style>
      </head>
      <body>
        <h1>Formulario</h1>
        <p>Nombre: ${date}</p>
        <p>Email: ${tipo}</p>
        <p>Mensaje: ${firstFlo}</p>
        <p>Mensaje: ${finishFlo}</p>
        <p>Mensaje: ${observaciones}</p>
      </body>
    </html>
  `;

  // Renderizar la plantilla HTML en un navegador virtual
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);

  // Generar el PDF y enviarlo como respuesta
  const pdf = await page.pdf({ format: 'A4' });
  res.type('application/pdf');
  res.send(pdf);

  // Cerrar el navegador virtual
  await browser.close();
});

app.listen(port, () => console.log(`server listening on port:  ${port}`));
