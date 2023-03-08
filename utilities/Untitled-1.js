

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

 
app.post('/formulario', function (req, res) {

    //recibimos los datos del formulario de reactjs y los guardamos en una variable

    const datosFormulario = req.body;

    //enviamos una respuesta al cliente con los datos recibidos

    res.send(`Los datos recibidos son: ${datosFormulario}`);  
})

 
app.listen(3000, () => { console.log('Servidor iniciado en el puerto 3000') });