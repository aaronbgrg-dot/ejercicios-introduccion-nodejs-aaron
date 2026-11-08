
const os = require('os');
const pc = require('picocolors');

// Convierte bytes a GB con 2 decimales
function formatearBytes(bytes) {
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

// Convierte segundos a formato "Xh Ym"
function formatearUptime(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return `${horas}h ${minutos}m`;
}

// Verde < 60 %, amarillo 60-85 %, rojo > 85 %
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

function mostrarLinea(etiqueta, valor) {
  console.log(`  ${pc.dim(etiqueta.padEnd(16))} ${valor}`);
}

function mostrarInforme() {
  const cpus = os.cpus();
  const porcentaje = calcularPorcentajeMemoria();

  console.log();
  console.log(pc.bold(pc.cyan('=== INFORME DEL SISTEMA ===')));
  console.log();

  console.log(pc.bold(pc.cyan('Equipo')));
  mostrarLinea('Hostname:', pc.white(os.hostname()));
  console.log();

  console.log(pc.bold(pc.cyan('Sistema')));
  mostrarLinea('SO:', pc.white(os.type()));
  mostrarLinea('Versión:', pc.white(os.release()));
  mostrarLinea('Arquitectura:', pc.white(os.arch()));
  console.log();

  console.log(pc.bold(pc.cyan('Usuario')));
  mostrarLinea('Usuario actual:', pc.green(os.userInfo().username));
  console.log();

  console.log(pc.bold(pc.cyan('Procesador')));
  mostrarLinea('Modelo:', pc.white(cpus[0] ? cpus[0].model : 'desconocido'));
  mostrarLinea('Nº de CPUs:', pc.green(String(cpus.length)));
  console.log();

  console.log(pc.bold(pc.cyan('Memoria')));
  mostrarLinea('Total:', pc.white(formatearBytes(os.totalmem())));
  mostrarLinea('Libre:', pc.white(formatearBytes(os.freemem())));
  mostrarLinea('Usada:', colorearPorcentaje(porcentaje));
  console.log();

  console.log(pc.bold(pc.cyan('Tiempo activo')));
  mostrarLinea('Uptime:', pc.green(formatearUptime(os.uptime())));
  console.log();
}

mostrarInforme();
