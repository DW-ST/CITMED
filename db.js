// db.js

const mongoose = require('mongoose');

// URL de conexión de MongoDB Atlas (asegúrate de cambiar las credenciales por las de tu entorno)
const uri = process.env.MONGODB_URI || "mongodb+srv://labuenaesperanzasoporte:7uVLVDgRw7LRmw8E@cluster0.y72mk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error de conexión a MongoDB Atlas:', error);
    process.exit(1);  // Salir del proceso si no se puede conectar a la base de datos
  }
};

// Esquema de Paciente
const pacienteSchema = new mongoose.Schema({
    tipoID: { type: String, required: true },  // Asegúrate de tener 'tipoID'
    id: { type: Number, required: true },  // 'id' es el número de identificación
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true }
});
// Esquema de Médico
const medicoSchema = new mongoose.Schema({
  id: {type: Number, required: true },  
  nombre: {type: String, required: true},
  CodEspecialidad: {type: Number, required: true },
  especialidad: { type: String, required: true },
  agenda: [{
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
    fechaHora: { type: Date, required: true }
  }]
});

// Crear un índice único compuesto en los campos 'tipoID' y 'id'
pacienteSchema.index({ tipoID: 1, id: 1 }, { unique: true });

// Modelos de Mongoose
const Paciente = mongoose.model('Paciente', pacienteSchema);
const Medico = mongoose.model('Medico', medicoSchema);

// Exportar la función de conexión y los modelos
module.exports = { connectDB, Paciente, Medico };