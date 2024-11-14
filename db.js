// db.js

const mongoose = require('mongoose');

// URL de conexión de MongoDB Atlas
const uri = "mongodb+srv://labuenaesperanzasoporte:7uVLVDgRw7LRmw8E@cluster0.y72mk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((error) => console.error('Error de conexión a MongoDB Atlas:', error));

// Aquí puedes agregar los esquemas de tus modelos
// Esquema de Paciente
const pacienteSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    nombre: { type: String, required: true },
    telefono: { type: String, required: true }
});

// Esquema de Médico
const medicoSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    nombre: { type: String, required: true },
    especialidad: { type: String, required: true },
    agenda: [{
        paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
        fechaHora: { type: Date, required: true }
    }]
});

// Modelos de Mongoose
const Paciente = mongoose.model('Paciente', pacienteSchema);
const Medico = mongoose.model('Medico', medicoSchema);

module.exports = { Paciente, Medico };