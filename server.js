const express = require('express');
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const {generatePdfControl} = require('./modules/generatePdfFuntion')
const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS
app.use(cors());
app.use(bodyParser.json());


// habilitar imagenes
app.use(express.static('public'));

// ruta para archivos estaticos
app.use('/static', express.static(path.join(__dirname, 'public')))


// handlebars motor de plantillas para express
// Configurar Handlebars como motor de plantillas
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');


app.post('/generatecontrolpdf', async (req, res) => {
    const data = req.body;
    const fechaInit = data.fechaInit; // Asigna el valor de fechaInit de la petición a una variable
    console.log(data)
    res.render(__dirname + '/views/hojacontrol', {data}, async (err, html) => {
        if (err) {
            console.error(err)
            res.status(500).send('error al cargar la plantilla');
            return;
        }
    // Renderizar la plantilla HTML en un navegador virtual
    await generatePdfControl(html, res);
    });
});


app.listen(port, () => console.log(`server listening on port:  ${port}`));

