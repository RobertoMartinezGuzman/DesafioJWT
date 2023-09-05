const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    host: 'localhost',
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
    allowExitOnIdle: true
})

const registroDeUsuario = async (u) => {
    let { email, password, rol, lenguage } = u;

    const claveEncriptada = bcrypt.hashSync(password);

    console.log("Se ha creado el usuario: " + email);
    console.log("Clave no encriptada: " + password);
    console.log("Clave encriptada: " + claveEncriptada);

    const consulta = "INSERT INTO usuarios VALUES (DEFAULT, $1, $2, $3, $4)";
    const values = [email, claveEncriptada, rol, lenguage]

    try {
        await pool.query(consulta, values)
    } catch (error) {
        console.log(error);
    }
}

const inicioDeSesion = async (e, p) => {

    const consulta = "SELECT * FROM usuarios WHERE email = $1"
    const values = [e];

    try {

        const { rows: [u], rowCount } = await pool.query(consulta, values);

        if (rowCount == 1) {
            const ClaveEncriptada = u.password;
            const ClaveCorrecta = bcrypt.compareSync(password, ClaveEncriptada);

            if (ClaveCorrecta) {
                console.log("Usuario Correcto");
                return { error: false, msg: "Credenciales correctas" };
            } else {
                console.log("Credenciales incorrectas");
                return { error: true, msg: "Credenciales incorrectas: Su usuario o clave es incorrecta, favor intente nuevamente" };
            }
        } else {
            return { error: true, msg: "Credenciales incorrectas: Su usuario o clave es incorrecta, favor intente nuevamente" };
        }

    } catch (error) {
        console.log(error);
        return { error: true, msg: "Se ha registrado un error, intente nuevamente" };
    }

}

const getUsuario = async (e) => {

    const consulta = "SELECT email, rol, lenguage FROM usuarios WHERE email = $1";
    const values = [e];

    try {
        const { rows } = await pool.query(consulta, values);
        return rows[0];
    } catch (error) {
        console.log(error);
        throw error;
    }

};

const verificarCorreo = async (e) => {
    const consulta = "SELECT COUNT(*) FROM usuarios WHERE email = $1";
    const values = [e];

    try {
        const { rows: [{ count }] } = await pool.query(consulta, values);
        return count > 0;
    } catch (error) {
        console.log(error);
        throw new Error("Error en email, favor verificar");
    }
};

const validarCredenciales = async (email, password) => {
    const consulta = "SELECT password FROM usuarios WHERE email = $1";
    const values = [email];

    try {
        const { rows } = await pool.query(consulta, values);
        if (rows.length === 0) {
            return false; 
        }

        const ClaveGuardada = rows[0].password;
        return bcrypt.compareSync(password, ClaveGuardada);
    } catch (error) {
        console.log(error);
        throw new Error("Se ha producido un error al validar las credenciales");
    }
};

module.exports = { registroDeUsuario, inicioDeSesion, getUsuario, verificarCorreo, validarCredenciales };