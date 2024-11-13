let pacientes = [
    { id: 1, nombre: "Juan Pérez", telefono: "123456789" },
    { id: 2, nombre: "Ana Gómez", telefono: "987654321" }
];

let medicos = [
    { id: 1, nombre: "Dr. Luis Martínez", especialidad: "Cardiología", agenda: [] },
    { id: 2, nombre: "Dra. María López", especialidad: "Dermatología", agenda: [] }
];

// Función para mostrar el formulario de solicitud de cita
function mostrarFormularioCita() {
    ocultarFormularios();
    document.getElementById('formularioCita').style.display = 'block';

    // Rellenar las opciones de médico
    let medicoSelect = document.getElementById('medico');
    medicoSelect.innerHTML = '';
    medicos.forEach(medico => {
        let option = document.createElement('option');
        option.value = medico.id;
        option.textContent = medico.nombre;
        medicoSelect.appendChild(option);
    });

    // Rellenar las opciones de paciente
    let pacienteSelect = document.getElementById('paciente');
    pacienteSelect.innerHTML = '';
    pacientes.forEach(paciente => {
        let option = document.createElement('option');
        option.value = paciente.id;
        option.textContent = paciente.nombre;
        pacienteSelect.appendChild(option);
    });
}

// Función para confirmar la cita
function confirmarCita() {
    const medicoId = document.getElementById('medico').value;
    const pacienteId = document.getElementById('paciente').value;
    const fechaHora = document.getElementById('fechaHora').value;

    if (!medicoId || !pacienteId || !fechaHora) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const medico = medicos.find(m => m.id == medicoId);
    const paciente = pacientes.find(p => p.id == pacienteId);
    const fecha = new Date(fechaHora);

    // Verificar si ya existe una cita en esa fecha y hora
    const citaExistente = medico.agenda.some(cita => cita.fechaHora.getTime() === fecha.getTime());
    if (citaExistente) {
        alert('Ya existe una cita en esa fecha y hora.');
    } else {
        medico.agenda.push(new Cita(paciente, fecha));
        alert('Cita agendada exitosamente');
    }

    ocultarFormularios();
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

// Función para agregar un nuevo usuario (paciente o médico)
function agregarUsuario() {
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const id = document.getElementById('id').value;
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const especialidad = document.getElementById('especialidad').value;

    if (!id || !nombre || (tipoUsuario === 'paciente' && !telefono)) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    if (tipoUsuario === 'paciente') {
        pacientes.push({ id, nombre, telefono });
        alert('Paciente agregado exitosamente');
    } else if (tipoUsuario === 'medico') {
        medicos.push({ id, nombre, especialidad, agenda: [] });
        alert('Médico agregado exitosamente');
    }

    ocultarFormularios();
}

// Función para cancelar cualquier formulario
function cancelarFormulario() {
    ocultarFormularios();
}