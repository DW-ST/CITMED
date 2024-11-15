// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 3000;  // Usar el puerto proporcionado por Render

// Middleware para manejar JSON y CORS
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

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

// Ruta raíz (muestra un mensaje básico cuando se accede a la raíz)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cita.html'));  // Asegúrate de que 'cita.html' esté en la carpeta 'public'
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
        console.error('Error al agregar paciente:', error);
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
        console.error('Error al agregar médico:', error);
        res.status(500).json({ message: 'Error al agregar médico', error: error.message });
    }
});

// Ruta POST para confirmar la cita
app.post('/confirmar-cita', async (req, res) => {
    const { medicoId, pacienteId, fechaHora } = req.body;

    try {
        const medico = await Medico.findOne({ id: medicoId });
        const paciente = await Paciente.findOne({ id: pacienteId });

        if (!medico || !paciente) {
            return res.status(404).json({ message: 'Médico o paciente no encontrados' });
        }

        const fecha = new Date(fechaHora);
        const citaExistente = medico.agenda.some(cita => cita.fechaHora.getTime() === fecha.getTime());
        if (citaExistente) {
            return res.status(400).json({ message: 'Ya existe una cita en esa fecha y hora.' });
        }

        medico.agenda.push({ paciente: paciente._id, fechaHora: fecha });
        await medico.save();

        res.status(200).json({ message: 'Cita agendada exitosamente' });
    } catch (error) {
        console.error('Hubo un error al confirmar la cita:', error);
        res.status(500).json({ message: 'Hubo un error al confirmar la cita.', error: error.message });
    }
});

// Ruta para obtener la agenda de todos los médicos
app.get('/agenda', async (req, res) => {
    try {
        const medicos = await Medico.find().populate('agenda.paciente'); // Asegúrate de que 'agenda.paciente' sea correcto

        if (medicos.length === 0) {
            console.error('No se encontraron médicos en la base de datos');
            return res.status(404).json({ message: 'No se encontraron médicos en la base de datos' });
        }

        const agendaMedicos = medicos.map(medico => ({
            medico: medico.nombre,
            especialidad: medico.especialidad,
            citas: medico.agenda.map(cita => ({
                paciente: cita.paciente ? cita.paciente.nombre : 'Paciente no encontrado',
                fechaHora: cita.fechaHora ? cita.fechaHora.toLocaleString() : 'Fecha no disponible'
            }))
        }));

        res.json(agendaMedicos);

    } catch (error) {
        console.error('Hubo un error al obtener la agenda:', error.message);
        res.status(500).json({ message: 'Hubo un error al obtener la agenda.', error: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
