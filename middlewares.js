const jwt = require('jsonwebtoken')
const { verificarCorreo, validarCredenciales } = require('./consultas')


const verificarToken = (req, res, next) => {
    const token = req.header("Autorizacion").split("Bearer ")[1]
    if (!token) throw { code: 401, message: "Incluir Token Autorizacion" }

    const tokenCorrecto = jwt.verify(token, "ClaveSecreta")
    if (!tokenCorrecto) throw { code: 401, message: "Token incorrecto" }
    const { email } = jwt.decode(token)
    console.log("La solicitud fue enviada por el siguiente correo: " + email)
    next()
}

const verificarCredenciales = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const correo = await verificarCorreo(email);
        if (!correo) {
            return res.status(400).send("El correo no existe");
        }

        const credencialesCorrectas = await validarCredenciales(email, password);
        if (!credencialesCorrectas) {
            return res.status(401).send("Las credenciales son incorrectas");
        }

        next();
    } catch (error) {
        res.status(500).send(error.message);
        console.log("Se registra error en credencialesCorrectas");
    }
};

const consultaIngresada = async (req, res, next) => {
    const params = req.method === "GET" ? req.query : req.body;
    const ruta = req.ruta
    console.log(`Hoy ${new Date()} Recibida consulta ${ruta} con los parametros:`, params)
    next()
}

module.exports = { verificarToken, verificarCredenciales, consultaIngresada }