const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;


// Habilitar CORS

app.use(cors());
app.use(bodyParser.json());

app.post('/generatecontrolpdf', async (req, res) => {

    const data = req.body;
    console.log(data)
    let contador = 1;

    let html = `
     <html>
     <head></head>
     <body>
     <table>
    `;
    data.forEach(item =>  {
      // Se itera sobre cada objeto del array y se concatena su contenido en el HTML
      html += `
      
        <tr class="ro9">
            <td style="text-align:left;width:2.683cm; " class="ce4">
                <p>${item.key = contador++}</p>
            </td>
            <td style="text-align:left;width:4.059cm; " class="ce4">${item.fecha} </td>
            <td colspan="2" style="text-align:left;width:0.914cm; " class="ce11">${item.tipo} </td>
            <td style="text-align:left;width:2.575cm; " class="ce4">${item.firstFlo} </td>
            <td style="text-align:left;width:2.822cm; " class="ce4"> ${item.finishFlo} </td>
            <td colspan="3" style="text-align:left;width:2.822cm; " class="ce4">${item.observaciones} </td>        
        </tr>
      `;
    });
    html += `
    <tr class="ro1">
    <td colspan="2" style="text-align:left;width:2.683cm; " class="ce6">
        <p>Nombre completo de quien diligencia:</p>
    </td>
    <td colspan="7" style="text-align:left;width:0.914cm; " class="ce13"> </td>
    </tr>
    <tr class="ro19">
    <td colspan="2" style="text-align:left;width:2.683cm; " class="ce6">
        <p>Cargo :</p>
    </td>
    <td colspan="7" style="text-align:left;width:0.914cm; " class="ce13">
        <p>AUXILIAR GESTIÓN DOCUMENTAL</p>
    </td>
    </tr>
    <tr class="ro20">
    <td colspan="2" style="text-align:left;width:2.683cm; " class="ce6">
        <p>Firma :</p>
    </td>
    <td colspan="7" style="text-align:left;width:0.914cm; " class="ce14"> </td>
    </tr>
</table>
</body>
</html>
  `
  

  
    // Renderizar la plantilla HTML en un navegador virtual
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
  
    // Generar el PDF y enviarlo como respuesta
    const pdf = await page.pdf({ format: 'Letter' });
    res.type('application/pdf');
    res.send(pdf);
  
    // Cerrar el navegador virtual
    await browser.close();
});

app.listen(port, () => console.log(`server listening on port:  ${port}`));
