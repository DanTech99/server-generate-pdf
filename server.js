/**
 * ----------------------------------------------------------------------------------------------------------
 * Modulos requeridos
 * @constant express
 * @constant cors
 * @constant path
 * @constant bodyParser
 * @constant exphbs
 * @constant generatePdfControl
 * @constant mysql
 * @constant exceljs
 * @constant fs
 * -----------------------------------------------------------------------------------------------------------
 */
const express = require('express');
const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const {generatePdfControl} = require('./modules/generatePdfFuntion');


/**
 * configuracion de la aplicacion
 * @type {express}
 * @constant app
 */
const app = express();
app.use(express.json());
const port = process.env.PORT || 3001;

// Habilitar CORS
app.use(cors());


/**
 * middlewars para analizar JSON en solicitudes entrantes
 * @function
 * @param {function} bodyParser.json() - analiza el cuerpo de la solicitud como JSON
 */
app.use(bodyParser.json());


/**
 * ---------------------------------------------------------------------------------
 * middleware para servir archivos estaticos
 * @function
 * @param {string} 'public' - Directorio base para servir contenido estatico
 * -------------------------------------------------------------------------------
 */
app.use(express.static('public'));



/**
 * -----------------------------------------------------------------------------
 * Middleware para servir archivos estaticos desde un directorio especifico
 * @function
 * @param {string}'/static' - prefijo para servir contenido estatico desde un directorio especifico
 * @param {string} path.join(__dirname, 'public') - ruta del directorio que contiene los archivos estaticos
 * -----------------------------------------------------------------------------
 */
app.use('/static', express.static(path.join(__dirname, 'public')))


/**
 * configuracion de Handlebars como motor de plantillas para express
 * @constant hbs
 * @function
 */

const hbs = exphbs.create({
    defaultLayout: 'main_history',
    helpers: {
        eq: function(arg1, arg2) {
          return arg1 === arg2;
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Agregar encabezados de CORS a todas las respuestas
 app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 
    next();
  }); 


  // ruta principal
app.get('/', (req, res) => {
    // mostrar un json con la informacion de la api
    res.json({
        'message': 'API para generar formatos de hojas de control',
        'endpoints': {
            '/generatecontrolpdf': 'ruta para generar un archivo PDF a partir de una plantilla HTML',
            '/generatehistoryclinic': 'ruta para generar un archivo PDF a partir de una plantilla HTML sobre historia clinica',
            '/savehistoryclinic': 'ruta para recibir la data del cliente y almacenarla en una base de datos mysql'
        }

    });
    });

/**
 * ------------------------------------------------------------------------------
 * ruta para genetar un archivo PDF a partir de una plantilla HTML para la app de format generate radicados gesccol.
 * @function
 * @param {string}'/generatecontrolpdf' - ruta para generar el pdf
 * @param {function} res.render() - funcion para renderizar la plantilla HTML con los datos proporcionados
 * @param {string}__dirname + '/views/hojacontrol' - ruta de la plantilla HTML que se va a renderizar
 * @param {object} err - objeto que contiene informacion sobre errores que se han producido
 * @param {string} html - cadena que contiene el resultado del renderizado de la plantilla html
 * @param {function} generatePdfControl() - funcion que genera un archivo PDF a partir de una cadena HTML
 * @param {string} html - cadena que contiene el resultado del renderizado de la plantilla HTML
 * @param {function} res - objeto de respuesta que se envia al cliente
 * ----------------------------------------------------------------------------
 */
app.post('/generatecontrolpdf', async (req, res) => {
    const data = req.body;
    console.log(data)
    const fechaActual = new Date();
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    const formatter = new Intl.DateTimeFormat('es-CO', options);
    const fechaFormateada = formatter.format(fechaActual);

    res.render(__dirname + '/views/hojacontrol', {data, fechaFormateada}, async (err, html) => {
        if (err) {
            console.error(err)
            res.status(500).send('error al cargar la plantilla');
            return;
        }
    // Renderizar la plantilla HTML en un navegador virtual
    await generatePdfControl(html, res);
    });
});

/**
 * ---------------------------------------------------------------------------------
 * ruta para generar un archivo PDF a partir de una plantilla HTML para la app de RIE-HISTORY-CLINIC
 * @description ruta para recibir la data del cliente y generar un archivo PDF a partir de una plantilla HTML
 * @param {string}'/generatehistoryclinic' - ruta para generar el pdf
 */
    app.post('/generatehistoryclinic', async (req, res) => {
        const data = req.body;
        console.log(data)
        res.render(__dirname + '/views/historyclinic', {data}, async (err, html) => {
            if (err) {
                console.error(err)
                res.status(500).send('error al cargar la plantilla');
                return;
            }
        // Renderizar la plantilla HTML en un navegador virtual
        await generatePdfControl(html, res);
        });
    });





/**
 * ---------------------------------------------------------------------------------
 * @description ruta para recibir la data del cliente y almacenarla en una base de datos mysql
 * @param {string}'/savehistoryclinic' - ruta para almacenar la data de la historia clinica en una base de datos mysql
 */





app.listen(port, () => console.log(`server listening on port:  ${port}`));

