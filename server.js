const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const exphbs  = require('express-handlebars');
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());
app.use(bodyParser.json());



// handlebars motor de plantillas para express
// Configurar Handlebars como motor de plantillas
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.post('/generatecontrolpdf', async (req, res) => {

    const data = req.body;
    console.log(data)
    let contador = 1;
    res.render(__dirname + '/views/hojacontrol', {data, contador}, async (err, html) => {
        if (err) {
            console.error(err)
            res.status(500).send('error al cargar la plantilla');
            return;
        }

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
});

app.listen(port, () => console.log(`server listening on port:  ${port}`));
