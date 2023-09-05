const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()

const { registroDeUsuario, inicioDeSesion, getUsuario } = require('./consultas')
const { verificarToken, verificarCredenciales, consultaIngresada } = require("./middlewares")

app.listen(3000, console.log("Servidor encendido en el puerto 3000"))
app.use(express.json())
app.use(cors())

app.post("/usuarios", consultaIngresada, async (req, res) => {
    try {
        const usuario = req.body;
        await registroDeUsuario(usuario);
        res.send("Usuario creado correctamente")
    } catch (error) {
        res.status(500).send(error);
        console.log("Error registrado en app.post('/usuarios')")
    }
});

app.post("/login", verificarCredenciales, consultaIngresada, async (req, res) => {
    try {
        const { email, password } = req.body;
        await inicioDeSesion(email, password);

        const token = jwt.sign({ email, password }, "ClaveSecreta");

        console.log("Se ha iniciado sesion correctamente - El token asignado es: " + token);
        res.send("Se ha iniciado sesion correctamente - El token asignado es: " + token)
    } catch (error) {
        res.status(500).send(error);
        console.log("Error en app.post('/login')")
    }
});

app.get("/usuarios", verificarToken, async (req, res) => {
    try {
        const Authorization = req.header("Authorization");
        const token = Authorization.split("Bearer ")[1];
        const { email } = jwt.verify(token, "ClaveSecreta");

        const data = await getUsuario(email);
        res.send(data);
    } catch (error) {
        res.status(error.code || 500).send(error);
    }
});