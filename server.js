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
const mysql = require('mysql')
const ExcelJS = require('exceljs');
const fs = require('fs');
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

const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

// Agregar encabezados de CORS a todas las respuestas
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://format-generator.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

/**
 * ------------------------------------------------------------------------------
 * ruta para genetar un archivo PDF a partir de una plantilla HTML.
 * @function
 * @param {string}'/generatecontrolpdf' - ruta para generar el pdf
 * @param {function} async (req. res) - funcion que maneja la solicitud  POST para generar el PDF
 * @param {Object} req.body - cuerpo de la solicitud POST, que debe contener los datos necesarios para generar la plantilla
 * @param {object} data - objeto qu contiene los datos necesarios para generar la plantilla
 * @param {function} res.render() - funcion para renderizar la plantilla HTML con los datos proporcionados
 * @param {string}__dirname + '/views/hojacontrol' - ruta de la plantilla HTML que se va a renderizar
 * @param {function} async (err, html) - funcion que maneja el resultado del renderizado de la plantilla HTML
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
 * -----------------------------------------------------------------------------------------------------------------------------
 * ruta para procesar las solicitudes del formulario y generar una hoja de excel con los datos que llegaran del cliente
 * -----------------------------------------------------------------------------------------------------------------------------
 */

// Conectarse a la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
  });
  
  connection.connect((error) => {
      if (error) {
          console.error('error conectando a la base de datos', error)
          return;
      }
      console.log('coneccion establecida con Mysql')
  })
  
  // Definir la ruta para procesar las solicitudes del formulario
  app.post('/form-generate-excel', async (req, res) => {
    try {
      // Almacenar los datos del formulario en la base de datos
      const { name, email } = req.body;
      const formData = { name, email };
      const query = 'INSERT INTO form_data SET ?';
      connection.query(query, formData, (error, result) => {
        if (error) {
          console.error('Could not process form submission', error);
          res.status(500).send('Internal server error');
          return;
        }
  
        console.log('Form data saved');
  
        // Consultar los datos almacenados en la base de datos
        const query = 'SELECT * FROM form_data';
        connection.query(query, (error, results) => {
          if (error) {
            console.error('Could not retrieve form data', error);
            res.status(500).send('Internal server error');
            return;
          }
  
          console.log('Form data retrieved');
  
          // Crear una hoja de trabajo
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Form Data');
          worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 }
          ];
          results.forEach((result, index) => {
            worksheet.addRow({ id: index + 1, name: result.name, email: result.email });
          });
  
          // Escribir el libro de Excel en un archivo
          workbook.xlsx.writeBuffer()
            .then(buffer => {
              console.log('Excel file saved');
  
              // Enviar el archivo como respuesta binaria
              res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=form_data.xlsx',
                'Content-Length': buffer.length
              });
              res.end(buffer);
            })
            .catch(error => {
              console.error('Could not save Excel file', error);
              res.status(500).send('Internal server error');
            });
        });
      });
    } catch (error) {
      console.error('Could not process form submission', error);
      res.status(500).send('Internal server error');
    }
});



app.listen(port, () => console.log(`server listening on port:  ${port}`));

