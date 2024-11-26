const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Inicializar la aplicación Express
const { connectDB, Paciente, Medico } = require('./db');  // Importar desde db.js

const app = express();
const port = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB();

// Middleware para manejar JSON y CORS
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
const uri = 'mongodb+srv://labuenaesperanzasoporte:7uVLVDgRw7LRmw8E@cluster0.y72mk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Definir los esquemas de Mongoose
const pacienteSchema = new mongoose.Schema({
    id: Number,
    nombre: String,
    telefono: String,
    direccion: String
});

const medicoSchema = new mongoose.Schema({
  id: Number,
  nombre: String,
  CodEsp: Number,
  especialidad: String,
  agenda: [{
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
    fechaHora: Date
  }]
});

// Ruta para obtener las fechas disponibles de un médico en un rango de fechas
app.get('/medico/:id/agenda', async (req, res) => {
    const medicoId = req.params.id;
    const { fechaInicio, fechaFin } = req.query;  // fechas de inicio y fin del rango
  
    try {
      // Convertir las fechas de inicio y fin a formato Date
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
  
      // Buscar el médico por su ID
      const medico = await Medico.findOne({ id: medicoId }).lean();  // .lean() para simplificar el objeto
  
      if (!medico) {
        return res.status(404).json({ message: 'Médico no encontrado' });
      }
  
      // Filtrar las citas de la agenda del médico que caen dentro del rango de fechas
      const citas = medico.agenda.filter(cita => {
        const citaFecha = new Date(cita.fechaHora);
        return citaFecha >= startDate && citaFecha <= endDate;
      });
  
      // Obtener las fechas ocupadas (no disponibles)
      const fechasOcupadas = citas.map(cita => cita.fechaHora);
  
      // Crear un arreglo de fechas disponibles dentro del rango
      let fechasDisponibles = [];
      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const fecha = new Date(d);
        if (!fechasOcupadas.some(fechaOcupada => new Date(fechaOcupada).toDateString() === fecha.toDateString())) {
          fechasDisponibles.push(fecha.toLocaleDateString());  // Solo fecha (sin hora)
        }
      }
  
      // Enviar las fechas disponibles al frontend
      res.json({ fechasDisponibles });
    } catch (error) {
      console.error('Error al obtener la agenda:', error);
      res.status(500).json({ message: 'Hubo un error al obtener la agenda.' });
    }
  });

// Ruta para obtener médicos por especialidad o por ID
app.get('/medicos', async (req, res) => {
    try {
        const especialidad = req.query.especialidad;
        const id = req.query.id;

        // Si se pasa un ID de médico, devolver ese médico
        if (id) {
            const medico = await Medico.findById(id).lean(); // Usamos .lean() para simplificar el objeto
            if (!medico) {
                return res.status(404).json({ message: 'Médico no encontrado' });
            }
            return res.json(medico);
        }

        // Si se pasa una especialidad, buscar médicos con esa especialidad
        if (especialidad) {
            const medicos = await Medico.aggregate([
                {
                    $match: { especialidad: new RegExp("^" + especialidad + "$", "i") }
                },
                {
                    $group: {
                        _id: "$id",  // Agrupamos por el campo 'id' que es único para cada médico
                        nombre: { $first: "$nombre" },
                        especialidad: { $first: "$especialidad" },
                        CodEspecialidad: { $first: "$CodEspecialidad" },             
                        agenda: { $push: "$agenda" }  // Mantener todas las agendas
                    }
                },
                {
                    $project: { 
                        _id: 0, 
                        id: "$_id", 
                        nombre: 1, 
                        especialidad: 1, 
                        CodEspecialidad: 1,                         
                        agenda: { $reduce: {
                            input: "$agenda",
                            initialValue: [],
                            in: { 
                                $cond: {
                                    if: { $in: ["$$this", "$$value"] },
                                    then: "$$value",
                                    else: { $concatArrays: ["$$value", ["$$this"]] }
                                }
                            }
                        }}
                    }
                }
            ]);

            if (medicos.length === 0) {
                return res.status(404).json({ message: 'No se encontraron médicos con esa especialidad.' });
            }
            return res.json(medicos);
        }

        // Si no se pasa ni ID ni especialidad, devolver todos los médicos sin duplicados
        const medicos = await Medico.aggregate([
            {
                $group: {
                    _id: "$id",  // Agrupamos por el campo 'id' que es único para cada médico
                    nombre: { $first: "$nombre" },
                    especialidad: { $first: "$especialidad" },
                    CodEspecialidad: { $first: "$CodEspecialidad" },                    
                    agenda: { $push: "$agenda" }  // Mantener todas las agendas
                }
            },
            {
                $project: { 
                    _id: 0, 
                    id: "$_id", 
                    nombre: 1, 
                    especialidad: 1, 
                    CodEspecialidad: 1,                    
                    agenda: { $reduce: {
                        input: "$agenda",
                        initialValue: [],
                        in: { 
                            $cond: {
                                if: { $in: ["$$this", "$$value"] },
                                then: "$$value",
                                else: { $concatArrays: ["$$value", ["$$this"]] }
                            }
                        }
                    }}
                }
            }
        ]);

        return res.json(medicos);

    } catch (error) {
        console.error('Error al obtener médicos:', error);
        res.status(500).json({ message: 'Hubo un error al obtener los médicos.' });
    }
});

// Ruta raíz (muestra un mensaje básico cuando se accede a la raíz)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cita.html'));  // Asegúrate de que 'cita.html' esté en la carpeta 'public'
});

// Rutas para obtener médicos y pacientes
app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener pacientes', error: error.message });
    }
});

// Ruta de validación de paciente
app.get('/pacientes/validar/:documentoPaciente', async (req, res) => {
    try {
        const { documentoPaciente } = req.params;
        console.log("Buscando paciente con id:", documentoPaciente);

        // Convertir el valor de 'documentoPaciente' a un número
        const paciente = await Paciente.findOne({ id: parseInt(documentoPaciente, 10) });

        console.log("Paciente encontrado:", paciente);

        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        res.json(paciente);
    } catch (error) {
        console.error('Error al validar paciente:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para agregar nuevo paciente
app.post('/pacientes', async (req, res) => {
    const { tipoID, id, nombre, telefono, direccion } = req.body;

    if (!id || !nombre || !telefono || !direccion || !tipoID) {
        return res.status(400).json({ message: 'Faltan datos para agregar el paciente.' });
    }

    try {
        // Verificar si ya existe un paciente con el mismo tipoID e id
        const pacienteExistente = await Paciente.findOne({ tipoID, id });

        if (pacienteExistente) {
            return res.status(400).json({ message: 'Ya existe un paciente con ese tipo de ID y número de ID.' });
        }

        // Crear y guardar el nuevo paciente
        const paciente = new Paciente({ tipoID, id, nombre, telefono, direccion });
        await paciente.save();
        res.status(201).json(paciente);
    } catch (error) {
        console.error('Error al agregar paciente:', error);
        res.status(500).json({ message: 'Error al agregar paciente', error: error.message });
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
        // Obtener todos los médicos con su agenda poblada
        const medicos = await Medico.find().populate('agenda.paciente'); // Esto poblará el campo 'paciente' dentro de 'agenda'

        if (medicos.length === 0) {
            console.error('No se encontraron médicos en la base de datos');
            return res.status(404).json({ message: 'No se encontraron médicos en la base de datos' });
        }

        // Mapear la información de cada médico y su agenda
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