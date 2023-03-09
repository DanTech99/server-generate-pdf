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

    const data = req.body;
    console.log(data)

    let html = `
      <html>
        <head>
          <style>
            /* Estilos CSS para la plantilla */
          </style>
        </head>
        <body>
          <h1>Formulario</h1>
    `;
    for (let i = 0; i < data.length; i++) {
      // Se itera sobre cada objeto del array y se concatena su contenido en el HTML
      html += `
        <p>Fecha: ${data[i].fecha}</p>
        <p>Tipo: ${data[i].tipo}</p>
        <p>folio que inicia: ${data[i].firstFlo}</p>
        <p>folio que termina: ${data[i].finishFlo}</p>
        <p>Observaciones: ${data[i].observaciones}</p>
      `;
    }
    html += `
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
