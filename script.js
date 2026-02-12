// Configuración global
const CONFIG = {
  formatoFecha: { 
    dia: '2-digit', 
    mes: '2-digit', 
    año: 'numeric' 
  },
  mostrarProximasSesiones: true, // Cambiar a false para ocultar
  cantidadProximas: 3 // Número de próximas sesiones a mostrar
};

// Estado de la aplicación
let data = null;
let sesionHoy = null;

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Formatea una fecha de string a formato legible
 */
function formatearFecha(fechaStr) {
  const partes = fechaStr.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
  }
  return fechaStr;
}

/**
 * Compara si dos fechas son el mismo día
 */
function esMismaFecha(fechaStr1, fechaStr2) {
  // Normalizar formato: ambas a DD/MM/YYYY
  const normalizar = (f) => {
    if (f.includes('/')) {
      const [d, m, a] = f.split('/');
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${a}`;
    }
    return f;
  };
  
  return normalizar(fechaStr1) === normalizar(fechaStr2);
}

/**
 * Obtiene la fecha actual en formato DD/MM/YYYY
 */
function obtenerFechaActual() {
  const hoy = new Date();
  const dia = hoy.getDate().toString().padStart(2, '0');
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const año = hoy.getFullYear();
  return `${dia}/${mes}/${año}`;
}

/**
 * Carga los datos desde el archivo JSON
 */
async function cargarDatos() {
  try {
    const respuesta = await fetch('data.json');
    if (!respuesta.ok) {
      throw new Error(`Error al cargar datos: ${respuesta.status}`);
    }
    data = await respuesta.json();
    console.log('✅ Datos cargados correctamente');
    return data;
  } catch (error) {
    console.error('❌ Error cargando data.json:', error);
    
    // Datos de respaldo en caso de error
    data = {
      sesiones: [],
      enlaces_fijos: []
    };
    
    // Mostrar error en la UI
    document.getElementById('materiaNombre').innerText = 'Error cargando datos';
    document.getElementById('profesorTexto').innerText = 'Verifique conexión';
    
    return null;
  }
}

/**
 * Actualiza la UI con la sesión del día
 */
function actualizarSesionHoy() {
  if (!data || !data.sesiones || data.sesiones.length === 0) {
    console.warn('No hay datos de sesiones disponibles');
    return;
  }

  const fechaActual = obtenerFechaActual();
  console.log(`📅 Buscando sesión para fecha: ${fechaActual}`);
  
  // Buscar sesión para la fecha actual
  sesionHoy = data.sesiones.find(sesion => esMismaFecha(sesion.fecha, fechaActual));
  
  if (sesionHoy) {
    console.log('✅ Sesión encontrada:', sesionHoy.materia);
    
    // Actualizar elementos del DOM
    document.getElementById('materiaNombre').innerText = sesionHoy.materia;
    document.getElementById('profesorTexto').innerText = sesionHoy.profesor;
    document.getElementById('fechaDisplay').innerHTML = `📅 ${sesionHoy.fecha}`;
    document.getElementById('horaValor').innerText = sesionHoy.horario;
    
    const enlaceBtn = document.getElementById('enlaceSesion');
    enlaceBtn.href = sesionHoy.enlace;
    enlaceBtn.innerHTML = '👉 Entrar a la sesión de hoy';
  } else {
    console.log('⚠️ No hay sesión programada para hoy');
    
    // Mostrar mensaje de "sin sesión"
    document.getElementById('materiaNombre').innerText = 'No hay sesión hoy';
    document.getElementById('profesorTexto').innerText = '---';
    document.getElementById('horaValor').innerText = '---';
    
    const enlaceBtn = document.getElementById('enlaceSesion');
    enlaceBtn.href = '#';
    enlaceBtn.innerHTML = '🔴 Sin sesión programada';
    enlaceBtn.style.background = '#64748b';
    enlaceBtn.style.boxShadow = '0 6px 0 #334155';
  }
}

/**
 * Muestra las próximas sesiones (opcional)
 */
function mostrarProximasSesiones() {
  if (!CONFIG.mostrarProximasSesiones || !data || !data.sesiones) return;
  
  const fechaActual = obtenerFechaActual();
  const [diaActual, mesActual, añoActual] = fechaActual.split('/').map(Number);
  
  // Filtrar sesiones futuras y ordenar
  const sesionesFuturas = data.sesiones
    .filter(sesion => {
      const [dia, mes, año] = sesion.fecha.split('/').map(Number);
      const fechaSesion = new Date(año, mes - 1, dia);
      const fechaHoy = new Date(añoActual, mesActual - 1, diaActual);
      return fechaSesion > fechaHoy;
    })
    .sort((a, b) => {
      const [diaA, mesA, añoA] = a.fecha.split('/').map(Number);
      const [diaB, mesB, añoB] = b.fecha.split('/').map(Number);
      return new Date(añoA, mesA - 1, diaA) - new Date(añoB, mesB - 1, diaB);
    })
    .slice(0, CONFIG.cantidadProximas);
  
  if (sesionesFuturas.length > 0) {
    const container = document.getElementById('proximas-sesiones');
    const lista = document.getElementById('lista-proximas-sesiones');
    
    container.style.display = 'block';
    lista.innerHTML = '';
    lista.className = 'proximas-lista';
    
    sesionesFuturas.forEach(sesion => {
      const item = document.createElement('div');
      item.className = 'proxima-item';
      item.innerHTML = `
        <div class="proxima-info">
          <span class="proxima-fecha">📅 ${sesion.fecha}</span>
          <span class="proxima-materia">${sesion.materia}</span>
          <span class="proxima-profesor">👨‍🏫 ${sesion.profesor}</span>
          <span class="proxima-horario">⏰ ${sesion.horario}</span>
        </div>
        <a href="${sesion.enlace}" target="_blank" class="btn-pequeno" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 30px; text-decoration: none; font-size: 0.85rem;">Enlace</a>
      `;
      lista.appendChild(item);
    });
  }
}

/**
 * Inicializa la aplicación
 */
async function init() {
  console.log('🚀 Inicializando aplicación...');
  
  // 1. Cargar datos
  await cargarDatos();
  
  // 2. Actualizar sesión del día
  actualizarSesionHoy();
  
  // 3. Mostrar próximas sesiones
  mostrarProximasSesiones();
  
  // 4. Actualizar automáticamente cada hora (por si cambia el día)
  setInterval(() => {
    console.log('🔄 Actualizando sesión del día...');
    actualizarSesionHoy();
    mostrarProximasSesiones();
  }, 3600000); // 1 hora
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
