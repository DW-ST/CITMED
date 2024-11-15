<<<<<<< HEAD
// Obtener datos de médicos y pacientes desde el servidor
async function mostrarFormularioCita() {
    ocultarFormularios();
    document.getElementById('formularioCita').style.display = 'block';

    try {
        // Obtener los médicos y pacientes desde la base de datos (servidor)
        const medicosResponse = await fetch('http://localhost:3000/medicos');
        const pacientesResponse = await fetch('http://localhost:3000/pacientes');
        
        const medicosDb = await medicosResponse.json();
        const pacientesDb = await pacientesResponse.json();

        // Rellenar las opciones de médico
        let medicoSelect = document.getElementById('medico');
        medicoSelect.innerHTML = '';
        medicosDb.forEach(medico => {
            let option = document.createElement('option');
            option.value = medico.id;
            option.textContent = medico.nombre;
            medicoSelect.appendChild(option);
        });

        // Rellenar las opciones de paciente
        let pacienteSelect = document.getElementById('paciente');
        pacienteSelect.innerHTML = '';
        pacientesDb.forEach(paciente => {
            let option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = paciente.nombre;
            pacienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar médicos o pacientes:', error);
        alert('Hubo un error al cargar los datos.');
    }
}

// Confirmar la cita
async function confirmarCita() {
    const medicoId = document.getElementById('medico').value;
    const pacienteId = document.getElementById('paciente').value;
    const fechaHora = document.getElementById('fechaHora').value;

    if (!medicoId || !pacienteId || !fechaHora) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/confirmar-cita', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                medicoId,
                pacienteId,
                fechaHora
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Error: ' + errorData.message);  // Mostramos el mensaje del error del servidor
            return;
        }

        const data = await response.json();
        alert(data.message);  // Confirmación de cita exitosa
        ocultarFormularios();
    } catch (error) {
        console.error('Error al confirmar cita:', error);
        alert('Hubo un error al confirmar la cita: ' + error.message);
    }
}

// Clase Cita
class Cita {
    constructor(paciente, fechaHora) {
        this.paciente = paciente;
        this.fechaHora = fechaHora;
    }
}

// Función para mostrar la agenda
function mostrarAgenda() {
    ocultarFormularios();
    document.getElementById('agenda').style.display = 'block';

    const agendaLista = document.getElementById('agendaLista');
    agendaLista.innerHTML = '';

    medicos.forEach(medico => {
        const li = document.createElement('li');
        li.textContent = `Médico: ${medico.nombre} (${medico.especialidad})`;

        const citas = medico.agenda.map(cita => {
            return `${cita.paciente.nombre} - ${cita.fechaHora.toLocaleString()}`;
        }).join(', ');

        li.innerHTML += `<br><strong>Citas: </strong>${citas || 'No hay citas.'}`;
        agendaLista.appendChild(li);
    });
}

// Función para ocultar todos los formularios
function ocultarFormularios() {
    document.getElementById('formularioCita').style.display = 'none';
    document.getElementById('agenda').style.display = 'none';
    document.getElementById('nuevoUsuario').style.display = 'none';
}

// Función para mostrar el formulario de nuevo usuario
function mostrarFormularioNuevoUsuario() {
    ocultarFormularios();
    document.getElementById('nuevoUsuario').style.display = 'block';
}

const { Paciente, Medico } = require('./db');

// Función para agregar un nuevo usuario (paciente o médico)
async function agregarUsuario() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const id = document.getElementById('id').value;
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const especialidad = document.getElementById('especialidad').value;

    if (!id || !nombre || (tipoUsuario === 'paciente' && !telefono)) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        if (tipoUsuario === 'paciente') {
            // Crear un nuevo paciente y guardar en la base de datos
            const nuevoPaciente = { id, nombre, telefono };
            const response = await fetch('http://localhost:3000/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoPaciente)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar paciente');
            }

            alert('Paciente agregado exitosamente');
        } else if (tipoUsuario === 'medico') {
            // Crear un nuevo médico y guardar en la base de datos
            const nuevoMedico = { id, nombre, especialidad };
            const response = await fetch('http://localhost:3000/medicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoMedico)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar médico');
            }

            alert('Médico agregado exitosamente');
        }

        ocultarFormularios();
    } catch (error) {
        console.error('Error al agregar usuario:', error);  // Aquí logueamos el error completo en el frontend
        alert('Hubo un error al agregar el usuario: ' + error.message);
    }
}

// Función para cancelar cualquier formulario
function cancelarFormulario() {
    ocultarFormularios();
=======
// Obtener datos de médicos y pacientes desde el servidor
async function mostrarFormularioCita() {
    ocultarFormularios();
    document.getElementById('formularioCita').style.display = 'block';

    try {
        // Obtener los médicos y pacientes desde la base de datos (servidor)
        const medicosResponse = await fetch('http://localhost:3000/medicos');
        const pacientesResponse = await fetch('http://localhost:3000/pacientes');
        
        const medicosDb = await medicosResponse.json();
        const pacientesDb = await pacientesResponse.json();

        // Rellenar las opciones de médico
        let medicoSelect = document.getElementById('medico');
        medicoSelect.innerHTML = '';
        medicosDb.forEach(medico => {
            let option = document.createElement('option');
            option.value = medico.id;
            option.textContent = medico.nombre;
            medicoSelect.appendChild(option);
        });

        // Rellenar las opciones de paciente
        let pacienteSelect = document.getElementById('paciente');
        pacienteSelect.innerHTML = '';
        pacientesDb.forEach(paciente => {
            let option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = paciente.nombre;
            pacienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar médicos o pacientes:', error);
        alert('Hubo un error al cargar los datos.');
    }
}

// Confirmar la cita
async function confirmarCita() {
    const medicoId = document.getElementById('medico').value;
    const pacienteId = document.getElementById('paciente').value;
    const fechaHora = document.getElementById('fechaHora').value;

    if (!medicoId || !pacienteId || !fechaHora) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/confirmar-cita', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                medicoId,
                pacienteId,
                fechaHora
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Error: ' + errorData.message);  // Mostramos el mensaje del error del servidor
            return;
        }

        const data = await response.json();
        alert(data.message);  // Confirmación de cita exitosa
        ocultarFormularios();
    } catch (error) {
        console.error('Error al confirmar cita:', error);
        alert('Hubo un error al confirmar la cita: ' + error.message);
    }
}

// Clase Cita
class Cita {
    constructor(paciente, fechaHora) {
        this.paciente = paciente;
        this.fechaHora = fechaHora;
    }
}

// Función para mostrar la agenda
function mostrarAgenda() {
    ocultarFormularios();
    document.getElementById('agenda').style.display = 'block';

    const agendaLista = document.getElementById('agendaLista');
    agendaLista.innerHTML = '';

    medicos.forEach(medico => {
        const li = document.createElement('li');
        li.textContent = `Médico: ${medico.nombre} (${medico.especialidad})`;

        const citas = medico.agenda.map(cita => {
            return `${cita.paciente.nombre} - ${cita.fechaHora.toLocaleString()}`;
        }).join(', ');

        li.innerHTML += `<br><strong>Citas: </strong>${citas || 'No hay citas.'}`;
        agendaLista.appendChild(li);
    });
}

// Función para ocultar todos los formularios
function ocultarFormularios() {
    document.getElementById('formularioCita').style.display = 'none';
    document.getElementById('agenda').style.display = 'none';
    document.getElementById('nuevoUsuario').style.display = 'none';
}

// Función para mostrar el formulario de nuevo usuario
function mostrarFormularioNuevoUsuario() {
    ocultarFormularios();
    document.getElementById('nuevoUsuario').style.display = 'block';
}

const { Paciente, Medico } = require('./db');

// Función para agregar un nuevo usuario (paciente o médico)
async function agregarUsuario() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const id = document.getElementById('id').value;
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const especialidad = document.getElementById('especialidad').value;

    if (!id || !nombre || (tipoUsuario === 'paciente' && !telefono)) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    try {
        if (tipoUsuario === 'paciente') {
            // Crear un nuevo paciente y guardar en la base de datos
            const nuevoPaciente = { id, nombre, telefono };
            const response = await fetch('http://localhost:3000/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoPaciente)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar paciente');
            }

            alert('Paciente agregado exitosamente');
        } else if (tipoUsuario === 'medico') {
            // Crear un nuevo médico y guardar en la base de datos
            const nuevoMedico = { id, nombre, especialidad };
            const response = await fetch('http://localhost:3000/medicos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoMedico)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al agregar médico');
            }

            alert('Médico agregado exitosamente');
        }

        ocultarFormularios();
    } catch (error) {
        console.error('Error al agregar usuario:', error);  // Aquí logueamos el error completo en el frontend
        alert('Hubo un error al agregar el usuario: ' + error.message);
    }
}

// Función para cancelar cualquier formulario
function cancelarFormulario() {
    ocultarFormularios();
>>>>>>> 2ebbcfb (primer commit)
}