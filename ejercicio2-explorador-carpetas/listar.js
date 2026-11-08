
const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function mostrarError(mensaje) {
  console.error(pc.bgRed(pc.white(` ERROR: ${mensaje} `)));
  process.exit(1);
}

// Sin argumento se usa la carpeta actual
const ruta = process.argv[2] || '.';

if (!fs.existsSync(ruta)) {
  mostrarError(`La ruta "${ruta}" no existe`);
}

if (!fs.statSync(ruta).isDirectory()) {
  mostrarError(`"${ruta}" no es una carpeta`);
}

let entradas;
try {
  entradas = fs.readdirSync(ruta, { withFileTypes: true });
} catch (err) {
  mostrarError(`No se puede leer "${ruta}": ${err.message}`);
}

let totalCarpetas = 0;
let totalArchivos = 0;
let totalBytes = 0;

console.log();
console.log(pc.bold(pc.cyan(`Contenido de ${path.resolve(ruta)}`)));
console.log();

for (const entrada of entradas) {
  const oculto = entrada.name.startsWith('.');

  if (entrada.isDirectory()) {
    totalCarpetas++;
    const texto = `${entrada.name}/`;
    console.log(`  ${oculto ? pc.gray(texto) : pc.blue(texto)}`);
  } else {
    totalArchivos++;
    let tamano = 0;
    try {
      tamano = fs.statSync(path.join(ruta, entrada.name)).size;
    } catch {
      // enlaces rotos u otros casos: se cuenta con tamaño 0
    }
    totalBytes += tamano;
    const nombre = oculto ? pc.gray(entrada.name) : pc.green(entrada.name);
    console.log(`  ${nombre} ${pc.gray(formatearTamano(tamano))}`);
  }
}

console.log();
console.log(
  pc.bold(
    `${totalCarpetas} carpetas, ${totalArchivos} archivos, ${formatearTamano(totalBytes)} en total`
  )
);
console.log();
