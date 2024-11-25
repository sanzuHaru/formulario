import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAMX3-OffjQ7jv5frUlm5zUmcnUaYyDs8o",
    authDomain: "registro-invitados.firebaseapp.com",
    projectId: "registro-invitados",
    storageBucket: "registro-invitados.firebasestorage.app",
    messagingSenderId: "979245497357",
    appId: "1:979245497357:web:39e8d4994526c4cb64e944"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const invitadosCollection = collection(db, "invitados");

// Generar un código único de 8 caracteres
function generarCodigoUnico() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    for (let i = 0; i < 8; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
}

// Escuchar el envío del formulario
document.getElementById("registroForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevenir el envío por defecto del formulario

    // Obtener datos del formulario
    const nombre = document.getElementById("nombre").value;
    const apellidoPaterno = document.getElementById("apellido_paterno").value;
    const apellidoMaterno = document.getElementById("apellido_materno").value;
    const telefono = document.getElementById("telefono").value;
    const acompanantes = parseInt(document.getElementById("acompanantes").value);
    const mesaAsignada = parseInt(document.getElementById("mesa_asignada").value);
    const vip = document.getElementById("vip").checked;

    // Generar código único
    const codigo = generarCodigoUnico();

    // Guardar en Firestore
    try {
        await addDoc(invitadosCollection, {
            codigo,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            telefono,
            acompanantes,
            mesaAsignada,
            vip,
            rsvp: "Pendiente"
        });
        alert("Invitado registrado correctamente.");
        e.target.reset(); // Limpiar formulario
    } catch (error) {
        console.error("Error al registrar invitado:", error.message);
        alert("Hubo un error al registrar al invitado.");
    }
});

// Mostrar datos en la tabla
onSnapshot(invitadosCollection, (snapshot) => {
    const tbody = document.querySelector("#invitados-table tbody");
    tbody.innerHTML = ""; // Limpiar tabla

    snapshot.forEach((doc) => {
        const data = doc.data();
        const row = `
            <tr data-id="${doc.id}">
                <td>${data.codigo}</td>
                <td><span class="nombre">${data.nombre}</span><input type="text" class="edit nombre-edit" value="${data.nombre}" style="display:none" /></td>
                <td><span class="apellidoPaterno">${data.apellidoPaterno}</span><input type="text" class="edit apellidoPaterno-edit" value="${data.apellidoPaterno}" style="display:none" /></td>
                <td><span class="telefono">${data.telefono}</span><input type="tel" class="edit telefono-edit" value="${data.telefono}" style="display:none" /></td>
                <td><span class="acompanantes">${data.acompanantes}</span><input type="number" class="edit acompanantes-edit" value="${data.acompanantes}" style="display:none" /></td>
                <td><span class="vip">${data.vip ? "Sí" : "No"}</span><input type="checkbox" class="edit vip-edit" ${data.vip ? 'checked' : ''} style="display:none" /></td>
                <td>${data.rsvp}</td>
                <td>
                    <button class="btn-edit" title="Editar">Editar</button>
                    <button class="btn-save" title="Guardar" style="display:none">Guardar</button>
                    <button class="btn-delete" title="Eliminar">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Agregar funcionalidad para eliminar
    document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.closest('tr').dataset.id;
            try {
                await deleteDoc(doc(db, "invitados", id));
                alert("Invitado eliminado correctamente.");
            } catch (error) {
                console.error("Error al eliminar invitado:", error.message);
            }
        });
    });

    // Agregar funcionalidad para editar y guardar
    document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const row = e.target.closest('tr');
            // Mostrar inputs de edición
            row.querySelectorAll(".edit").forEach(input => input.style.display = "inline");
            row.querySelectorAll("span").forEach(span => span.style.display = "none");
            row.querySelector(".btn-edit").style.display = "none";
            row.querySelector(".btn-save").style.display = "inline";
        });
    });

    document.querySelectorAll(".btn-save").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const row = e.target.closest('tr');
            const id = row.dataset.id;

            const nombre = row.querySelector(".nombre-edit").value;
            const apellidoPaterno = row.querySelector(".apellidoPaterno-edit").value;
            const telefono = row.querySelector(".telefono-edit").value;
            const acompanantes = row.querySelector(".acompanantes-edit").value;
            const vip = row.querySelector(".vip-edit").checked;

            // Validar que los campos no estén vacíos
            if (!nombre || !apellidoPaterno || !telefono || !acompanantes) {
                alert("Por favor, complete todos los campos.");
                return; // Evitar que se guarde si algún campo está vacío
            }

            const invitadoDoc = doc(db, "invitados", id);

            try {
                await updateDoc(invitadoDoc, {
                    nombre,
                    apellidoPaterno,
                    telefono,
                    acompanantes,
                    vip
                });

                // Actualizar la vista con los nuevos datos
                row.querySelector(".nombre").textContent = nombre;
                row.querySelector(".apellidoPaterno").textContent = apellidoPaterno;
                row.querySelector(".telefono").textContent = telefono;
                row.querySelector(".acompanantes").textContent = acompanantes;
                row.querySelector(".vip").textContent = vip ? "Sí" : "No";

                // Ocultar inputs de edición y mostrar los spans
                row.querySelectorAll(".edit").forEach(input => input.style.display = "none");
                row.querySelectorAll("span").forEach(span => span.style.display = "inline");
                row.querySelector(".btn-edit").style.display = "inline";
                row.querySelector(".btn-save").style.display = "none";

                alert("Invitado actualizado correctamente.");
            } catch (error) {
                console.error("Error al actualizar invitado:", error.message);
                alert("Hubo un error al actualizar el invitado.");
            }
        });
    });
});
