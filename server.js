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
require('dotenv').config();
const { Client } = require('pg')

const client = new Client({
  user: 'postgres',
  host: 'db.wamxoygslhrofzdwditu.supabase.co',
  database: 'postgres',
  password: 'QriwEjS5wU5Yfwgy',
  port: 6543,
  ssl: { rejectUnauthorized: false }
})

client.connect()

// mensaje de conexion exitosa
client.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log(err.stack)
  } else {
    console.log('conectado a la base de datos')
  }
})


  

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
 */

const hbs = exphbs.create({
    layoutsDir: __dirname + '/views/layouts', // directorio de layouts
    defaultLayout: 'main',
    extname: '.handlebars',
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
            'api/generatecontrolpdf': 'ruta para generar un archivo PDF a partir de una plantilla HTML',
            'api/generatehistoryclinic': 'ruta para generar un archivo PDF a partir de una plantilla HTML sobre historia clinica',
            'api/savehistoryclinic': 'ruta para recibir la data del cliente y almacenarla en una base de datos mysql'
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
app.post('/api/generatecontrolpdf', async (req, res) => {
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
    app.post('/api/generatehistoryclinic', async (req, res) => {
        const data = req.body;
        console.log(data)
        // cambiart el layout a main antes de renderizar
    hbs.handlebars.registerPartial('main', 'main_history.handlebars');
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
 * @description rutas para el manejo de la base de datos
 * @param {string}'/savehistoryclinic' - ruta para guardar los registros en la base de datos
 * @param {string} '/getData' - ruta para obtener los registros de la base de datos
 */

app.post('/api/savehistoryclinic', (req, res) => {
    const {data} = req.body;

    console.log(data)

    const query = `
        INSERT INTO pacientes (
            odontologo,
            paciente,
            contacto,
            cedula,
            acudiente,
            ocupacion,
            direccion,
            ciudad,
            edad,
            nucleofamiliar,
            nacimiento,
            fechatratamiento,
            estadogeneral,
            parto,
            enfermedadescronicas,
            alteracionescongenitas,
            traumatismos,
            intervencionesquirurgicas,
            tratamientoprevio,
            hastaqueedad,
            observaciones,
            patronfacial,
            perfil,
            asimetria,
            alturafacial,
            anchofacial,
            perfilmaxilar,
            perfilmandibular,
            surcolabiomenton,
            labiosenreposo,
            perfillabial,
            respiracion,
            actividadcomisural,
            actividadlingual,
            labiosuperior,
            labioinferior,
            masetero,
            mentoniano,
            habitosdesuccion,
            plantratamiento,
            tecnicaaparato,
            tiempoestimadotratamiento,
            pronostico
        ) VALUES (
            '${data.odontologo} ',
            '${data.paciente}',
            '${data.contacto}',
            '${data.cedula}',
            '${data.acudiente}',
            '${data.ocupacion}',
            '${data.direccion}',
            '${data.ciudad}',
            ${data.edad},
            '${data.nucleofamiliar}',
            '${data.nacimiento}',
            '${data.fechatratamiento}',
            '${data.estadogeneral}',
            '${data.parto}',
            '${data.enfermedadescronicas}',
            '${data.alteracionescongenitas}',
            '${data.traumatismos}',
            '${data.intervencionesquirurgicas}',
            '${data.tratamientoprevio}',
            '${data.hastaqueedad}',
            '${data.observaciones}',
            '${data.patronfacial}',
            '${data.perfil}',
            '${data.asimetria}',
            '${data.alturafacial}',
            '${data.anchofacial}',
            '${data.perfilmaxilar}',
            '${data.perfilmandibular}',
            '${data.surcolabiomenton}',
            '${data.labiosenreposo}',
            '${data.perfillabial}',
            '${data.respiracion}',
            '${data.actividadcomisural}',
            '${data.actividadlingual}',
            '${data.labiosuperior}',
            '${data.labioinferior}',
            '${data.masetero}',
            '${data.mentoniano}',
            '${data.habitosdesuccion}',
            '${data.plantratamiento}',
            '${data.tecnicaaparato}',
            '${data.tiempoestimadotratamiento}',
            '${data.pronostico}'
        )
    `;

    client.query(query, (error, results) => {
        if (error) {
            console.error("Error al insertar datos:", error);
            res.status(500).json({ error: "Error al insertar datos" });
        } else {
            res.status(200).json({ message: "Datos insertados con éxito" });
        }
    });
})



app.get('/api/getData', (req, res) => {
    // Consulta SQL para seleccionar todos los registros de la tabla pacientes
    const query = 'SELECT * FROM pacientes';
    
    client.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener datos de la base de datos: ', err);
        res.status(500).json({ error: 'Error al obtener datos de la base de datos' });
        return;
      }
      
      console.log('Datos obtenidos de la base de datos');
      res.status(200).json(results);
    });
  });




app.listen(port, () => console.log(`server listening on port:  ${port}`));

