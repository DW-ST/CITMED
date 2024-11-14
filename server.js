// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');


// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para manejar JSON y CORS
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Conexión a MongoDB
const uri = 'mongodb+srv://labuenaesperanzasoporte:7uVLVDgRw7LRmw8E@cluster0.y72mk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => console.error('Error de conexión:', err));

// Definir los esquemas de Mongoose

const pacienteSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    telefono: String
});

const medicoSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    especialidad: String,
    agenda: [{
        paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
        fechaHora: Date
    }]
});

// Modelos de Mongoose
const Paciente = mongoose.model('Paciente', pacienteSchema);
const Medico = mongoose.model('Medico', medicoSchema);

app.get('/', (req, res) => {
    res.send('¡Bienvenido al sistema de citas médicas!');
});

// Rutas para obtener médicos y pacientes
app.get('/medicos', async (req, res) => {
    try {
        const medicos = await Medico.find();
        res.json(medicos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener médicos' });
    }
});

app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes' });
    }
});

// Ruta para agregar nuevo paciente
app.post('/pacientes', async (req, res) => {
    const { id, nombre, telefono } = req.body;
    try {
        const paciente = new Paciente({ id, nombre, telefono });
        await paciente.save();
        res.status(201).json(paciente);
    } catch (error) {
        console.error('Error al agregar paciente:', error);  // Esto imprimirá el error completo en la consola
        res.status(500).json({ message: 'Error al agregar paciente', error: error.message });
    }
});

// Ruta para agregar nuevo médico
app.post('/medicos', async (req, res) => {
    const { id, nombre, especialidad } = req.body;
    try {
        const medico = new Medico({ id, nombre, especialidad, agenda: [] });
        await medico.save();
        res.status(201).json(medico);
    } catch (error) {
        console.error('Error al agregar médico:', error);  // Esto imprimirá el error completo en la consola
        res.status(500).json({ message: 'Error al agregar médico', error: error.message });
    }
});

// Ruta POST para confirmar la cita
app.post('/confirmar-cita', async (req, res) => {
    const { medicoId, pacienteId, fechaHora } = req.body;

    try {
        // Aquí deberías buscar al médico y paciente en la base de datos
        const medico = await Medico.findOne({ id: medicoId });
        const paciente = await Paciente.findOne({ id: pacienteId });

        if (!medico || !paciente) {
            return res.status(404).json({ message: 'Médico o paciente no encontrados' });
        }

        // Parsear la fecha
        const fecha = new Date(fechaHora);

        // Verificar si ya existe una cita en esa fecha
        const citaExistente = medico.agenda.some(cita => cita.fechaHora.getTime() === fecha.getTime());
        if (citaExistente) {
            return res.status(400).json({ message: 'Ya existe una cita en esa fecha y hora.' });
        }

        // Crear la cita y agregarla al médico
        medico.agenda.push({ paciente: paciente._id, fechaHora: fecha });
        await medico.save();

        res.status(200).json({ message: 'Cita agendada exitosamente' });
    } catch (error) {
        console.error('Hubo un error al confirmar la cita:', error);
        res.status(500).json({ message: 'Hubo un error al confirmar la cita.', error: error.message });
    }
});
app.get('/agenda', async (req, res) => {
    try {
        // Obtener todos los médicos de la base de datos, con sus agendas
        const medicos = await Medico.find().populate('agenda.paciente'); // Asegurarse de que 'agenda.paciente' es el campo correcto

        if (medicos.length === 0) {
            console.error('No se encontraron médicos en la base de datos');
            return res.status(404).json({ message: 'No se encontraron médicos en la base de datos' });
        }

        // Preparamos la respuesta con la información de cada médico y sus citas
        const agendaMedicos = medicos.map(medico => {
            return {
                medico: medico.nombre,
                especialidad: medico.especialidad,
                citas: medico.agenda.map(cita => ({
                    paciente: cita.paciente ? cita.paciente.nombre : 'Paciente no encontrado', // Verificación en caso de que no exista el paciente
                    fechaHora: cita.fechaHora ? cita.fechaHora.toLocaleString() : 'Fecha no disponible' // Verificación para fechas nulas
                }))
            };
        });

        // Respondemos con la agenda en formato JSON
        res.json(agendaMedicos);

    } catch (error) {
        console.error('Hubo un error al obtener la agenda:', error.message);
        res.status(500).json({ message: 'Hubo un error al obtener la agenda.', error: error.message });
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
