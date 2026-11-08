const os = require('os');
const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

function formatearBytes(bytes) {
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

function formatearUptime(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return `${horas}h ${minutos}m`;
}

function colorearPorcentaje(porcentaje) {
  const texto = `${porcentaje}%`;
  if (porcentaje < 60) return pc.green(texto);
  if (porcentaje <= 85) return pc.yellow(texto);
  return pc.red(texto);
}

function calcularPorcentajeMemoria() {
  const total = os.totalmem();
  const libre = os.freemem();
  return Math.round(((total - libre) / total) * 100);
}

// Fecha local en formato "2026-11-01 10:32:15"
function fechaActual() {
  const d = new Date();
  const dos = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())} ` +
    `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`
  );
}

// Datos del informe como lista de secciones (se usa para texto plano y coloreado)
function obtenerDatos() {
  const cpus = os.cpus();
  const porcentaje = calcularPorcentajeMemoria();
  return {
    porcentaje,
    secciones: [
      { titulo: 'Equipo', filas: [['Hostname:', os.hostname()]] },
      {
        titulo: 'Sistema',
        filas: [
          ['SO:', os.type()],
          ['Versión:', os.release()],
          ['Arquitectura:', os.arch()],
        ],
      },
      { titulo: 'Usuario', filas: [['Usuario actual:', os.userInfo().username]] },
      {
        titulo: 'Procesador',
        filas: [
          ['Modelo:', cpus[0] ? cpus[0].model : 'desconocido'],
          ['Nº de CPUs:', String(cpus.length)],
        ],
      },
      {
        titulo: 'Memoria',
        filas: [
          ['Total:', formatearBytes(os.totalmem())],
          ['Libre:', formatearBytes(os.freemem())],
          ['Usada:', `${porcentaje}%`],
        ],
      },
      { titulo: 'Tiempo activo', filas: [['Uptime:', formatearUptime(os.uptime())]] },
    ],
  };
}

// Texto plano (sin códigos de color) para guardar en archivo
function construirTextoPlano(secciones) {
  const lineas = ['=== INFORME DEL SISTEMA ===', ''];
  for (const { titulo, filas } of secciones) {
    lineas.push(titulo);
    for (const [etiqueta, valor] of filas) {
      lineas.push(`  ${etiqueta.padEnd(16)} ${valor}`);
    }
    lineas.push('');
  }
  return lineas.join('\n');
}

// Versión coloreada solo para la consola
function mostrarPorConsola(secciones, porcentaje) {
  console.log();
  console.log(pc.bold(pc.cyan('=== INFORME DEL SISTEMA ===')));
  console.log();
  for (const { titulo, filas } of secciones) {
    console.log(pc.bold(pc.cyan(titulo)));
    for (const [etiqueta, valor] of filas) {
      const valorColoreado = etiqueta === 'Usada:' ? colorearPorcentaje(porcentaje) : pc.white(valor);
      console.log(`  ${pc.dim(etiqueta.padEnd(16))} ${valorColoreado}`);
    }
    console.log();
  }
}

function main() {
  const { porcentaje, secciones } = obtenerDatos();

  // 1. Mostrar por pantalla (con colores)
  mostrarPorConsola(secciones, porcentaje);

  try {
    // 2. informe.txt: se sobrescribe en cada ejecución (texto plano)
    fs.writeFileSync(path.join(__dirname, 'informe.txt'), construirTextoPlano(secciones));

    // 3. historial.log: se añade una línea por ejecución
    const linea = `${fechaActual()} | RAM usada: ${porcentaje}%\n`;
    fs.appendFileSync(path.join(__dirname, 'historial.log'), linea);

    console.log(pc.green('✔ Informe guardado en informe.txt.'));
  } catch (err) {
    console.error(pc.bgRed(pc.white(` ERROR al guardar: ${err.message} `)));
    process.exit(1);
  }
}

main();
