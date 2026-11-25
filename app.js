// ===== Espacios =====
// 'bloquea' indica qué otros espacios quedan ocupados al reservar este.
const ESPACIOS = [
  { id: 'tatami1', nombre: 'Tatami 1', bloquea: [] },
  { id: 'tatami2', nombre: 'Tatami 2', bloquea: [] },
  { id: 'gimnasio', nombre: 'Gimnasio', bloquea: [] },
  { id: 'pistaExterior', nombre: 'Pista exterior', bloquea: [] },
  { id: 'soportales', nombre: 'Soportales (ping-pong)', bloquea: [] },
  { id: 'pabellon', nombre: 'Pabellón completo', bloquea: ['pabellonA', 'pabellonB'] },
  { id: 'pabellonA', nombre: 'Pabellón mitad A', bloquea: ['pabellon'] },
  { id: 'pabellonB', nombre: 'Pabellón mitad B', bloquea: ['pabellon'] },
  { id: 'padel1', nombre: 'Pádel 1', bloquea: [] },
  { id: 'padel2', nombre: 'Pádel 2', bloquea: [] },
  { id: 'futbol', nombre: 'Campo de fútbol', bloquea: [] }
];

// ===== Franjas: de 9:00 a 17:00 =====
function generarFranjas(minutos) {
  const franjas = [];
  let t = 9 * 60;
  const fin = 17 * 60;
  while (t + minutos <= fin) {
    franjas.push({ inicio: t, fin: t + minutos });
    t += minutos;
  }
  return franjas;
}
function hhmm(m) {
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

// ===== Estado =====
let reservas = {};
let db = null;
let usuario = localStorage.getItem('usuarioEF') || '';
let seleccion = null;

const $ = id => document.getElementById(id);

function pedirNombre() {
  const n = prompt('¿Cómo te llamas? (se mostrará a tus compañeros)', usuario);
  if (n && n.trim()) {
    usuario = n.trim();
    localStorage.setItem('usuarioEF', usuario);
  }
  $('usuario').textContent = '👤 ' + (usuario || 'Identifícate');
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function clave(fecha, espacio, inicio) {
  return fecha + '_' + espacio + '_' + inicio;
}

// Devuelve la reserva que afecta a un espacio en una franja (directa o por bloqueo)
function buscarReserva(fecha, espacioId, inicio, fin) {
  const resultados = Object.values(reservas).filter(r => r.fecha === fecha && r.inicio < fin && r.fin > inicio);
  for (const r of resultados) {
    if (r.espacio === espacioId) return { reserva: r, directa: true };
    const def = ESPACIOS.find(e => e.id === r.espacio);
    if (def && def.bloquea.includes(espacioId)) return { reserva: r, directa: false };
  }
  return null;
}

function pintar() {
  const fecha = $('fecha').value;
  const minutos = $('etapa').value === 'primaria' ? 60 : 55;
  const franjas = generarFranjas(minutos);
  const cont = $('espacios');
  cont.innerHTML = '';

  ESPACIOS.forEach(esp => {
    const div = document.createElement('div');
    div.className = 'espacio';
    div.innerHTML = '<h3>' + esp.nombre + '</h3>';
    franjas.forEach(f => {
      const fila = document.createElement('div');
      const hora = hhmm(f.inicio) + ' - ' + hhmm(f.fin);
      const info = buscarReserva(fecha, esp.id, f.inicio, f.fin);
      if (!info) {
        fila.className = 'franja libre';
        fila.innerHTML = '<span class="hora">' + hora + '</span><span>Libre</span>';
        fila.onclick = () => abrirModal(esp, f, hora);
      } else {
        const r = info.reserva;
        const mia = r.profesor === usuario;
        fila.className = 'franja ' + (info.directa ? (mia ? 'mia' : 'ocupada') : 'bloqueada');
        const texto = info.directa
          ? r.profesor + ' · ' + r.grupo
          : 'Bloqueado (' + ESPACIOS.find(e => e.id === r.espacio).nombre + ': ' + r.profesor + ')';
        fila.innerHTML = '<span class="hora">' + hora + '</span><span>' + texto + '</span>';
        if (info.directa && mia) {
          const b = document.createElement('button');
          b.textContent = 'Anular';
          b.onclick = ev => { ev.stopPropagation(); anular(r); };
          fila.appendChild(b);
        }
      }
      div.appendChild(fila);
    });
    cont.appendChild(div);
  });
}

function abrirModal(esp, f, hora) {
  if (!usuario) { pedirNombre(); if (!usuario) return; }
  seleccion = { esp, f };
  $('modal-titulo').textContent = esp.nombre;
  $('modal-detalle').textContent = $('fecha').value + ' · ' + hora;
  $('grupo').value = '';
  $('modal').classList.remove('oculto');
}

function cerrarModal() {
  $('modal').classList.add('oculto');
  seleccion = null;
}

function reservar() {
  const grupo = $('grupo').value.trim();
  if (!grupo) { alert('Escribe el grupo o clase'); return; }
  const fecha = $('fecha').value;
  const { esp, f } = seleccion;
  // Comprobación final por si alguien reservó justo antes
  if (buscarReserva(fecha, esp.id, f.inicio, f.fin)) {
    alert('Esa franja acaba de ser reservada por otra persona.');
    cerrarModal();
    return;
  }
  const id = clave(fecha, esp.id, f.inicio);
  db.ref('reservas/' + id).set({
    fecha, espacio: esp.id, inicio: f.inicio, fin: f.fin,
    profesor: usuario, grupo, creada: Date.now()
  });
  cerrarModal();
}

function anular(r) {
  if (!confirm('¿Anular tu reserva de ' + ESPACIOS.find(e => e.id === r.espacio).nombre + '?')) return;
  db.ref('reservas/' + clave(r.fecha, r.espacio, r.inicio)).remove();
}

function iniciar() {
  const hoy = new Date();
  $('fecha').value = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
  $('fecha').onchange = pintar;
  $('etapa').onchange = pintar;
  $('usuario').onclick = () => { pedirNombre(); pintar(); };
  $('btn-cancelar').onclick = cerrarModal;
  $('btn-reservar').onclick = reservar;
  $('usuario').textContent = '👤 ' + (usuario || 'Identifícate');

  if (firebaseConfig.apiKey.startsWith('PEGA_AQUI')) {
    $('estado').textContent = '⚠️ Falta configurar Firebase (archivo config.js). Mira el README.';
    pintar();
    return;
  }

  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  let primeraCarga = true;

  db.ref('reservas').on('value', snap => {
    reservas = snap.val() || {};
    primeraCarga = false;
    pintar();
  });

  // Aviso cuando un compañero hace una reserva nueva
  db.ref('reservas').orderByChild('creada').startAt(Date.now()).on('child_added', snap => {
    const r = snap.val();
    if (r.profesor !== usuario) {
      const nombre = ESPACIOS.find(e => e.id === r.espacio).nombre;
      toast(r.profesor + ' ha reservado ' + nombre + ' el ' + r.fecha + ' de ' + hhmm(r.inicio) + ' a ' + hhmm(r.fin));
    }
  });
}

iniciar();
