fetch('data.json')
  .then(response => response.json())
  .then(data => {

    // Fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    // Buscar la sesión de hoy
    const sesionHoy = data.find(item => item.fecha === hoy);

    if (sesionHoy) {
      document.getElementById('materia').textContent = sesionHoy.materia;
      document.getElementById('fecha').textContent = sesionHoy.fecha;
      document.getElementById('hora').textContent = sesionHoy.hora;
      document.getElementById('enlace').href = sesionHoy.enlace;
    } else {
      document.getElementById('fecha').textContent = 'No hay sesión hoy';
      document.getElementById('hora').textContent = '-';
      document.getElementById('enlace').style.display = 'none';
    }

  })
  .catch(error => {
    console.error('Error cargando data.json', error);
  });
