// La intro con la tarjeta del estudio y el título.
// Un viaje continuo de 22 segundos (CINE_DURACION_MS = 22000) a través de un pequeño decorado en 3D, construido solo
// para la película. No cambia el mundo, no usa vídeo ni sprites y, mientras se muestra, no crea ninguna imagen nueva.
// Secuencia: vuelo entre las islas, la puerta se carga, vuelo a través de la puerta (esta primera estación se llama
// «vuelo»), después la tarjeta “Calliope Hacker presenta” sobre la isla de llegada y por último el título del juego.
let cineTerminado = false
let cineMs = 0
let cineCapitulo = 0
const CINE_DURACION_MS = 22000
const CINE_CARGA_PUERTA_MS = 4800
const CINE_PASO_PUERTA_MS = 7200
const CINE_ATARDECER_MS = 9700
const CINE_TARJETA_MS = 11200
const CINE_TITULO_MS = 15200
const CINE_FUNDIDO_MS = 20500
// Al pulsar A se salta a la estación siguiente (vuelo, tarjeta, título, final), como pronto 500 ms después del comienzo
// de la película o del último salto. Así, machacar A nunca salta varias estaciones de golpe, y una A mantenida no
// cuenta como una pulsación nueva.
const CINE_PAUSA_SALTO_MS = 500
let cineSaltoDesdeMs = 0
let cineImagenCalliope: Image = null
let cineImagenHacker: Image = null
let cineImagenPresenta: Image = null
let cineImagenTitulo: Image = null
let cineAnilloX: number[] = []
let cineAnilloY: number[] = []
let cineCajaX: number[] = []
let cineCajaY: number[] = []
let cineCajaZ: number[] = []
let cineCajaAncho: number[] = []
let cineCajaAlto: number[] = []
let cineCajaFondo: number[] = []
let cineCajaClase: number[] = []
let cineOrdenCajas: number[] = []
let cineDistanciaCajas: number[] = []
let cineEsquinaX: number[] = []
let cineEsquinaY: number[] = []
let cineEsquinaProfundidad: number[] = []
let cineCaras = [0, 2, 3, 1, 4, 5, 7, 6, 0, 1, 5, 4, 2, 6, 7, 3, 0, 4, 6, 2, 1, 3, 7, 5]
let cineOrdenCaras = [0, 0, 0]
let cineDistanciaCaras = [0, 0, 0]
let cineCamaraX = 0
let cineCamaraY = 3
let cineCamaraZ = 0
let cineSenGiro = 0
let cineCosGiro = 1
let cineSenInclinacion = 0
let cineCosInclinacion = 1
let cineSenAlabeo = 0
let cineCosAlabeo = 1
let cineFocal = 92
let cinePantallaX = 0
let cinePantallaY = 0
let cineProfundidad = 0
let cineAtardecer = false

function cineAnadirCaja(x: number, y: number, z: number,
    ancho: number, alto: number, fondo: number, clase: number) {
    cineCajaX.push(x)
    cineCajaY.push(y)
    cineCajaZ.push(z)
    cineCajaAncho.push(ancho)
    cineCajaAlto.push(alto)
    cineCajaFondo.push(fondo)
    cineCajaClase.push(clase)
    cineOrdenCajas.push(0)
    cineDistanciaCajas.push(0)
}

function cineConstruirIsla(x: number, y: number, z: number, tamano: number, conArbol: boolean) {
    let grosor = tamano > 10 ? 1.65 : 1
    cineAnadirCaja(x, y - 0.65 * grosor, z, tamano, 1.3 * grosor, tamano * 0.85, 0)
    cineAnadirCaja(x + 0.3, y - 2 * grosor, z, tamano * 0.8, 1.6 * grosor, tamano * 0.65, 1)
    cineAnadirCaja(x - 0.2, y - 3.1 * grosor, z, tamano * 0.38, 0.9 * grosor, tamano * 0.35, 1)
    if (conArbol) {
        cineAnadirCaja(x - tamano * 0.14, y + 1, z + 0.2, 0.45, 2.2, 0.45, 2)
        cineAnadirCaja(x - tamano * 0.14, y + 2.25, z + 0.2, 2.2, 1.35, 1.8, 3)
        cineAnadirCaja(x - tamano * 0.14 + 0.3, y + 3.1, z + 0.2, 1.45, 0.65, 1.35, 3)
    } else cineAnadirCaja(x + 0.2, y + 0.45, z, 0.65, 0.9, 0.65, 5)
}

function cinePreparar() {
    cineTerminado = false
    cineMs = 0
    cineCapitulo = 0
    cineSaltoDesdeMs = 0
    if (cineImagenCalliope) return
    cineImagenCalliope = image.create(47, 8)
    cineImagenCalliope.print("CALLIOPE", 0, 0, 1, image.font8)
    cineImagenHacker = image.create(35, 8)
    cineImagenHacker.print("HACKER", 0, 0, 1, image.font8)
    dibujarPresenta()
    cineImagenTitulo = image.create(TITULO.length * 6, 8)
    cineImagenTitulo.print(TITULO, 0, 0, 1, image.font8)
    for (let i = 0; i <= 24; i++) {
        cineAnilloX.push(Math.cos(i * Math.PI / 12))
        cineAnilloY.push(Math.sin(i * Math.PI / 12))
    }
    for (let i = 0; i < 8; i++) {
        cineEsquinaX.push(0)
        cineEsquinaY.push(0)
        cineEsquinaProfundidad.push(0)
    }
    // El pasillo libre llega de verdad hasta la puerta: las islas se colocan por turnos a cada lado.
    for (let i = 0; i < 15; i++) {
        let lado = i % 2 == 0 ? -1 : 1
        let x = lado * (4.4 + (i * 7 % 4))
        let z = 10 + i * 8.5
        cineConstruirIsla(x, -0.4 + (i % 3) * 0.5, z, 3.2 + (i % 3) * 0.45, i % 3 != 1)
        if (i % 3 == 0) cineAnadirCaja(-x * 1.8, 2.2, z + 3, 1.2, 1.2, 1.2, 5)
    }
    // Una puerta gigante, fija en ese mismo mundo en 3D.
    cineAnadirCaja(0, -3, 53, 11, 1.1, 5, 1)
    cineAnadirCaja(-4.1, 1.1, 53, 1.1, 8.2, 1.3, 4)
    cineAnadirCaja(4.1, 1.1, 53, 1.1, 8.2, 1.3, 4)
    cineAnadirCaja(0, 5.45, 53, 9.4, 0.9, 1.5, 4)
    cineAnadirCaja(-4.1, -2.25, 53, 1.7, 1.1, 1.9, 6)
    cineAnadirCaja(4.1, -2.25, 53, 1.7, 1.1, 1.9, 6)
    cineAnadirCaja(-4.1, 5.4, 53, 1.6, 1.4, 1.8, 6)
    cineAnadirCaja(4.1, 5.4, 53, 1.6, 1.4, 1.8, 6)
    // Meta del viaje: una isla grande con terrazas, un árbol y cristales.
    cineConstruirIsla(0, 0, 134, 15, false)
    cineAnadirCaja(-2.2, 0.35, 134, 4.3, 0.7, 4, 0)
    cineAnadirCaja(-2.4, 1.8, 134.5, 0.8, 2.9, 0.8, 2)
    cineAnadirCaja(-2.7, 3.5, 134.5, 4.2, 1.9, 3.4, 3)
    cineAnadirCaja(-2.2, 4.7, 134.4, 2.8, 0.9, 2.6, 3)
    cineAnadirCaja(2.5, 0.7, 133.2, 1.2, 1.4, 1.2, 5)
    cineAnadirCaja(3.9, 0.3, 134, 0.7, 0.6, 0.7, 5)
}

// Capítulos del sonido: 0 vuelo entre las islas, 1 carga de la puerta, 2 paso por la puerta (desde
// CINE_PASO_PUERTA_MS), 3 tarjeta, 4 título, 5 fundido a negro.
function cineCapituloEnMomento(tiempoMs: number): number {
    return tiempoMs < CINE_CARGA_PUERTA_MS ? 0
        : tiempoMs < CINE_PASO_PUERTA_MS ? 1
        : tiempoMs < CINE_TARJETA_MS ? 2
        : tiempoMs < CINE_TITULO_MS ? 3
        : tiempoMs < CINE_FUNDIDO_MS ? 4
        : 5
}

function cineActualizar(duracionMs: number) {
    if (cineTerminado) return
    cineMs = Math.min(CINE_DURACION_MS, cineMs + Math.max(0, duracionMs))
    cineCapitulo = cineCapituloEnMomento(cineMs)
    cineTerminado = cineMs >= CINE_DURACION_MS
}

function cineSaltar() {
    cineMs = CINE_DURACION_MS
    cineCapitulo = 5
    cineTerminado = true
}

// Una pulsación nueva de A: saltar a la estación siguiente. El resultado es false si la pulsación llegó demasiado
// pronto o si la película ya ha terminado.
function pasarEstacionSiguiente(): boolean {
    if (cineTerminado || cineMs - cineSaltoDesdeMs < CINE_PAUSA_SALTO_MS) return false
    if (cineMs >= CINE_TITULO_MS) cineSaltar()
    else {
        cineMs = cineMs >= CINE_TARJETA_MS ? CINE_TITULO_MS : CINE_TARJETA_MS
        cineCapitulo = cineCapituloEnMomento(cineMs)
    }
    cineSaltoDesdeMs = cineMs
    return true
}

function cineSuavizar(valor: number): number {
    valor = Math.max(0, Math.min(1, valor))
    return valor * valor * (3 - 2 * valor)
}

function cineColocarCamara(x: number, y: number, z: number, giro: number, inclinacion: number, alabeo: number) {
    cineCamaraX = x
    cineCamaraY = y
    cineCamaraZ = z
    cineSenGiro = Math.sin(giro)
    cineCosGiro = Math.cos(giro)
    cineSenInclinacion = Math.sin(inclinacion)
    cineCosInclinacion = Math.cos(inclinacion)
    cineSenAlabeo = Math.sin(alabeo)
    cineCosAlabeo = Math.cos(alabeo)
}

function cineProyectar(x: number, y: number, z: number) {
    let dx = x - cineCamaraX
    let dy = y - cineCamaraY
    let dz = z - cineCamaraZ
    let giradoX = dx * cineCosGiro - dz * cineSenGiro
    let giradoZ = dz * cineCosGiro + dx * cineSenGiro
    let giradoY = dy * cineCosInclinacion - giradoZ * cineSenInclinacion
    cineProfundidad = giradoZ * cineCosInclinacion + dy * cineSenInclinacion
    let escala = cineFocal / Math.max(0.5, cineProfundidad)
    let planoX = giradoX * escala
    let planoY = -giradoY * escala
    cinePantallaX = 80 + planoX * cineCosAlabeo - planoY * cineSenAlabeo
    cinePantallaY = 57 + planoY * cineCosAlabeo + planoX * cineSenAlabeo
}

// MakeCode rellena él mismo los triángulos (fillTriangle), rápido y con enteros; lo que sobresale del borde de la
// imagen se corta solo. Aquí solo se redondean las coordenadas de las esquinas a números enteros. Las bandas negras del
// cine, arriba y abajo, se vuelven a dibujar encima al final con dibujarCine.
function cineRellenarTriangulo(lienzo: Image, aX: number, aY: number, bX: number, bY: number,
    cX: number, cY: number, tinta: number) {
    lienzo.fillTriangle(Math.round(aX), Math.round(aY), Math.round(bX), Math.round(bY),
        Math.round(cX), Math.round(cY), tinta)
}

function cineRellenarCara(lienzo: Image, cara: number, tinta: number, colorBorde: number) {
    let primeraEsquina = cara * 4
    let esquinaA = cineCaras[primeraEsquina]
    let esquinaB = cineCaras[primeraEsquina + 1]
    let esquinaC = cineCaras[primeraEsquina + 2]
    let esquinaD = cineCaras[primeraEsquina + 3]
    cineRellenarTriangulo(lienzo,
        cineEsquinaX[esquinaA], cineEsquinaY[esquinaA],
        cineEsquinaX[esquinaB], cineEsquinaY[esquinaB],
        cineEsquinaX[esquinaC], cineEsquinaY[esquinaC], tinta)
    cineRellenarTriangulo(lienzo,
        cineEsquinaX[esquinaA], cineEsquinaY[esquinaA],
        cineEsquinaX[esquinaC], cineEsquinaY[esquinaC],
        cineEsquinaX[esquinaD], cineEsquinaY[esquinaD], tinta)
    // Las aristas cercanas a la cámara pueden caer muy lejos fuera de la imagen; solo se trazan las líneas cuyos dos
    // extremos no están demasiado lejos fuera.
    if (cineEsquinaX[esquinaA] > -100 && cineEsquinaX[esquinaA] < 260 &&
        cineEsquinaY[esquinaA] > -100 && cineEsquinaY[esquinaA] < 220 &&
        cineEsquinaX[esquinaB] > -100 && cineEsquinaX[esquinaB] < 260 &&
        cineEsquinaY[esquinaB] > -100 && cineEsquinaY[esquinaB] < 220) {
        lienzo.drawLine(cineEsquinaX[esquinaA], cineEsquinaY[esquinaA],
            cineEsquinaX[esquinaB], cineEsquinaY[esquinaB], colorBorde)
    }
    if (cineEsquinaX[esquinaB] > -100 && cineEsquinaX[esquinaB] < 260 &&
        cineEsquinaY[esquinaB] > -100 && cineEsquinaY[esquinaB] < 220 &&
        cineEsquinaX[esquinaC] > -100 && cineEsquinaX[esquinaC] < 260 &&
        cineEsquinaY[esquinaC] > -100 && cineEsquinaY[esquinaC] < 220) {
        lienzo.drawLine(cineEsquinaX[esquinaB], cineEsquinaY[esquinaB],
            cineEsquinaX[esquinaC], cineEsquinaY[esquinaC], colorBorde)
    }
}

function cineDibujarCaja(lienzo: Image, caja: number) {
    let x = cineCajaX[caja]
    let y = cineCajaY[caja]
    let z = cineCajaZ[caja]
    let clase = cineCajaClase[caja]
    let mitadAncho = cineCajaAncho[caja] * 0.5
    let mitadAlto = cineCajaAlto[caja] * 0.5
    let mitadFondo = cineCajaFondo[caja] * 0.5
    let xMin = 10000
    let xMax = -10000
    let yMin = 10000
    let yMax = -10000
    for (let i = 0; i < 8; i++) {
        let estrechamiento = clase == 1 && (i & 2) == 0 ? 0.58 : 1
        cineProyectar(x + ((i & 1) == 0 ? -mitadAncho : mitadAncho) * estrechamiento,
            y + ((i & 2) == 0 ? -mitadAlto : mitadAlto),
            z + ((i & 4) == 0 ? -mitadFondo : mitadFondo) * estrechamiento)
        // Si una esquina está demasiado cerca delante de la cámara (profundidad menor que 1,25) o detrás de ella, la
        // caja no se dibuja en absoluto. Todas las piezas grandes del decorado están a un lado de la trayectoria: no se
        // nota, y no aparece ninguna cara deformada.
        if (cineProfundidad < 1.25) return
        cineEsquinaX[i] = cinePantallaX
        cineEsquinaY[i] = cinePantallaY
        cineEsquinaProfundidad[i] = cineProfundidad
        xMin = Math.min(xMin, cinePantallaX)
        xMax = Math.max(xMax, cinePantallaX)
        yMin = Math.min(yMin, cinePantallaY)
        yMax = Math.max(yMax, cinePantallaY)
    }
    if (xMax < 0 || xMin > 159 || yMax < 6 || yMin > 111) return
    // De cada caja solo se dibujan las tres caras que miran hacia la cámara.
    cineOrdenCaras[0] = cineCamaraZ < z ? 0 : 1
    cineOrdenCaras[1] = cineCamaraY < y ? 2 : 3
    cineOrdenCaras[2] = cineCamaraX < x ? 4 : 5
    for (let i = 0; i < 3; i++) {
        let primeraEsquina = cineOrdenCaras[i] * 4
        cineDistanciaCaras[i] = cineEsquinaProfundidad[cineCaras[primeraEsquina]] +
            cineEsquinaProfundidad[cineCaras[primeraEsquina + 1]] +
            cineEsquinaProfundidad[cineCaras[primeraEsquina + 2]] +
            cineEsquinaProfundidad[cineCaras[primeraEsquina + 3]]
    }
    for (let i = 0; i < 2; i++) {
        for (let j = i + 1; j < 3; j++) {
            if (cineDistanciaCaras[j] > cineDistanciaCaras[i]) {
                let intercambio = cineOrdenCaras[i]
                cineOrdenCaras[i] = cineOrdenCaras[j]
                cineOrdenCaras[j] = intercambio
                let distancia = cineDistanciaCaras[i]
                cineDistanciaCaras[i] = cineDistanciaCaras[j]
                cineDistanciaCaras[j] = distancia
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        let cara = cineOrdenCaras[i]
        let esArriba = cara == 3
        let esLado = cara >= 4
        let tinta = 12
        let colorBorde = 12
        if (clase == 0) {
            tinta = esArriba ? 7 : esLado ? 12 : 14
            colorBorde = esArriba ? 6 : 12
        } else if (clase == 1) {
            tinta = esArriba ? 11 : esLado ? 8 : 12
            colorBorde = esArriba ? 13 : 12
        } else if (clase == 2) {
            tinta = esArriba ? 13 : esLado ? 12 : 14
            colorBorde = 14
        } else if (clase == 3) {
            tinta = esArriba ? 7 : esLado ? 6 : 7
            colorBorde = esArriba ? 9 : 6
        } else if (clase == 4) {
            tinta = esArriba ? 11 : esLado ? 15 : 8
            colorBorde = 11
        } else if (clase == 5) {
            tinta = esArriba ? 1 : esLado ? 8 : 9
            colorBorde = 9
        } else {
            tinta = esArriba ? 5 : esLado ? 4 : 13
            colorBorde = 5
        }
        // La profundidad sigue siendo visible: las islas y los árboles a más de 48 unidades por delante de la cámara se
        // dibujan con los colores apagados de la bruma.
        if (z - cineCamaraZ > 48 && clase < 4) {
            tinta = esArriba ? (clase == 0 || clase == 3 ? 6 : 11) : 12
            colorBorde = tinta
        }
        cineRellenarCara(lienzo, cara, tinta, colorBorde)
    }
}

function cineDibujarEscenario(lienzo: Image) {
    let cantidad = 0
    for (let i = 0; i < cineCajaX.length; i++) {
        let avance = (cineCajaZ[i] - cineCamaraZ) * cineCosGiro +
            (cineCajaX[i] - cineCamaraX) * cineSenGiro
        let distancia = avance * cineCosInclinacion + (cineCajaY[i] - cineCamaraY) * cineSenInclinacion
        if (distancia < 1 || distancia > 84) continue
        // Las cajas se ordenan según su distancia, las más lejanas primero. Esto se hace en listas que ya existen: no
        // se crea ningún objeto nuevo.
        let j = cantidad - 1
        while (j >= 0 && cineDistanciaCajas[j] < distancia) {
            cineDistanciaCajas[j + 1] = cineDistanciaCajas[j]
            cineOrdenCajas[j + 1] = cineOrdenCajas[j]
            j--
        }
        cineDistanciaCajas[j + 1] = distancia
        cineOrdenCajas[j + 1] = i
        cantidad++
    }
    for (let i = 0; i < cantidad; i++) cineDibujarCaja(lienzo, cineOrdenCajas[i])
}

function cineRellenarElipse(lienzo: Image, x: number, y: number, radioX: number, radioY: number, tinta: number) {
    if (radioX <= 0 || radioY <= 0) return
    let anteriorX = x + radioX
    let anteriorY = y
    for (let i = 1; i <= 24; i++) {
        let puntoX = x + cineAnilloX[i] * radioX
        let puntoY = y + cineAnilloY[i] * radioY
        cineRellenarTriangulo(lienzo, x, y, anteriorX, anteriorY, puntoX, puntoY, tinta)
        anteriorX = puntoX
        anteriorY = puntoY
    }
}

function cineDibujarCielo(lienzo: Image, atardecer: boolean, fuerzaPaso: number) {
    lienzo.fill(15)
    let horizonte = Math.max(33, Math.min(85, 57 + cineSenInclinacion * 92))
    lienzo.fillRect(0, horizonte - 15, 160, 127 - horizonte, 8)
    lienzo.fillRect(0, horizonte + 9, 160, 111 - horizonte, 12)
    lienzo.fillRect(0, horizonte + 35, 160, 112 - (horizonte + 35), 15)
    if (atardecer) {
        lienzo.fillRect(0, horizonte - 6, 160, 29, 12)
        lienzo.fillRect(0, horizonte + 14, 160, 21, 11)
        // Un sol grande a contraluz, con bandas de luz en escalones.
        let solX = 127 - cineCamaraX * 2
        cineRellenarElipse(lienzo, solX, 52, 22, 22, 4)
        cineRellenarElipse(lienzo, solX, 50, 17, 17, 5)
        lienzo.fillRect(99 - cineCamaraX * 2, 59, 57, 2, 12)
        lienzo.fillRect(103 - cineCamaraX * 2, 64, 49, 2, 12)
        cineRellenarTriangulo(lienzo, solX - 6, 62, 5, 111, 27, 111, 8)
        cineRellenarTriangulo(lienzo, solX - 2, 62, 47, 111, 57, 111, 12)
        cineRellenarTriangulo(lienzo, solX + 6, 62, 137, 111, 159, 111, 8)
    } else {
        // Unas bandas estrechas de cielo siguen a la cámara cuando gira.
        for (let i = 0; i < 5; i++) {
            let x = 14 + i * 29 - cineSenGiro * 70
            lienzo.drawLine(x, 24 + i * 3, x + 29, 20 + i * 3, 8)
        }
    }
    for (let i = 0; i < 28; i++) {
        let distancia = 30 + ((i * 37 + 128 - ((cineMs * (0.006 + fuerzaPaso * 0.12)) % 128)) % 128)
        let x = 80 + ((i * 97 + 19) % 159 - 79) * 91 / distancia - cineSenGiro * 60
        let y = 45 + ((i * 61 + 7) % 89 - 49) * 75 / distancia
        if (x < 0 || x > 159 || y < 8 || y > (atardecer ? 30 : 100)) continue
        if (fuerzaPaso > 0) lienzo.drawLine(x, y,
            x - (x - 80) * fuerzaPaso * 0.3,
            y - (y - 55) * fuerzaPaso * 0.3, 8)
        lienzo.setPixel(x, y, i % 5 == 0 ? 5 : distancia < 62 ? 1 : 9)
    }
    // Unas nubes horizontales se mueven con el vuelo en 3D, en vez de quedarse como una imagen de fondo inmóvil.
    for (let i = 0; i < 4; i++) {
        let z = 18 + ((i * 25 + 150 - cineCamaraZ) % 100)
        let x = 80 + ((i % 2 == 0 ? -13 : 12) - cineCamaraX) * 92 / z
        let y = 49 + (3 + i % 2) * 92 / z
        let ancho = Math.min(55, 700 / z)
        lienzo.fillRect(x - ancho / 2, y, ancho, Math.max(1, 35 / z), atardecer ? 13 : 11)
    }
}

function cineDibujarPuerta(lienzo: Image, carga: number) {
    if (cineCamaraZ > 50) return
    cineProyectar(0, 1.15, 52.5)
    if (cineProfundidad < 2) return
    let centroX = cinePantallaX
    let centroY = cinePantallaY
    let escala = cineFocal / cineProfundidad
    let mitadAncho = 3.25 * escala
    let mitadAlto = 3.8 * escala
    cineRellenarElipse(lienzo, centroX, centroY, mitadAncho + 2, mitadAlto + 2, carga > 0.55 ? 9 : 8)
    cineRellenarElipse(lienzo, centroX, centroY, mitadAncho, mitadAlto, 15)
    let fase = cineMs * 0.0017
    let coseno = Math.cos(fase)
    let seno = Math.sin(fase)
    for (let anillo = 0; anillo < 3; anillo++) {
        let radio = ((cineMs * 0.00016 + anillo / 3) % 1)
        let anteriorX = centroX + coseno * mitadAncho * radio
        let anteriorY = centroY + seno * mitadAlto * radio
        for (let i = 1; i <= 24; i++) {
            let anilloX = cineAnilloX[i] * coseno - cineAnilloY[i] * seno
            let anilloY = cineAnilloY[i] * coseno + cineAnilloX[i] * seno
            let x = centroX + anilloX * mitadAncho * radio
            let y = centroY + anilloY * mitadAlto * radio
            lienzo.drawLine(anteriorX, anteriorY, x, y, anillo == 1 && carga > 0.5 ? 9 : 8)
            anteriorX = x
            anteriorY = y
        }
    }
    if (carga > 0.02) {
        let anchoLuz = Math.max(1, carga * 4)
        lienzo.fillRect(centroX - anchoLuz - 2, 6, anchoLuz * 2 + 5, centroY + mitadAlto - 6, 8)
        lienzo.fillRect(centroX - anchoLuz, 6, anchoLuz * 2 + 1, centroY + mitadAlto - 6, 9)
        lienzo.fillRect(centroX - anchoLuz * 0.3, 6,
            Math.max(1, anchoLuz * 0.6), centroY + mitadAlto - 6, 1)
        // Dos relámpagos siguen una trayectoria fija y no parpadean al azar.
        for (let lado = -1; lado <= 1; lado += 2) {
            let curva = Math.sin(cineMs * 0.006 + lado) * 3
            lienzo.drawLine(centroX, centroY - mitadAlto,
                centroX + lado * (mitadAncho * 0.45 + curva), centroY - mitadAlto * 0.42, 9)
            lienzo.drawLine(centroX + lado * (mitadAncho * 0.45 + curva), centroY - mitadAlto * 0.42,
                centroX + lado * mitadAncho * 0.18, centroY - mitadAlto * 0.12, 1)
        }
    }
    // Un cristal flotante con caras. El ancho y el lado iluminado giran a la vez.
    let anguloGiro = cineMs * 0.0012
    let ancho = (0.55 + Math.abs(Math.cos(anguloGiro)) * 0.22) * escala
    let alto = 1.55 * escala
    let medio = centroX + Math.sin(anguloGiro) * ancho * 0.5
    cineRellenarTriangulo(lienzo, centroX, centroY - alto, centroX - ancho, centroY,
        medio, centroY + alto, 8)
    cineRellenarTriangulo(lienzo, centroX, centroY - alto, medio, centroY + alto,
        centroX + ancho, centroY, 9)
    lienzo.drawLine(centroX, centroY - alto, medio, centroY + alto, 1)
    lienzo.drawLine(centroX, centroY - alto, centroX + ancho, centroY, 1)
    if (carga > 0.3) {
        let largoDestello = mitadAncho * carga * 1.3
        lienzo.drawLine(centroX - largoDestello, centroY, centroX + largoDestello, centroY, 9)
        lienzo.drawLine(centroX - largoDestello * 0.6, centroY, centroX + largoDestello * 0.6, centroY, 1)
    }
}

// Cada letra entra desde arriba o desde abajo (sentidoEntrada) y desde más afuera, y llega a su sitio siguiendo la
// misma curva prevista. Se dibuja en tres capas (contorno, sombra y color); las letras no tiemblan al azar.
function cineDibujarLetras(lienzo: Image, mascara: Image, y: number, escala: number, aparicionMs: number,
    columnaBrillo: number, esDorado: boolean, sentidoEntrada: number) {
    let inicioX = 80 - mascara.width * escala / 2
    let escalaVertical = mascara == cineImagenTitulo ? escala * 1.22 : escala
    let numLetras = Math.idiv(mascara.width + 5, 6)
    // La sombra crece con el tamaño; en los títulos pequeños, un desplazamiento fijo taparía los huecos de las letras.
    let sombra = Math.min(3, Math.round(escala))
    let contorno = Math.min(5, Math.round(escala * 1.75))
    for (let capa = 0; capa < 3; capa++) {
        for (let letra = 0; letra < numLetras; letra++) {
            let progreso = cineSuavizar((aparicionMs - letra * 85) / 650)
            if (progreso <= 0) continue
            let restante = 1 - progreso
            let desplazamientoX = (letra - (numLetras - 1) / 2) * restante * 16
            let desplazamientoY = restante * restante * 29 * sentidoEntrada
            for (let mascaraX = letra * 6; mascaraX < Math.min(mascara.width, letra * 6 + 6); mascaraX++) {
                for (let mascaraY = 0; mascaraY < mascara.height; mascaraY++) {
                    if (!mascara.getPixel(mascaraX, mascaraY)) continue
                    let x = Math.round(inicioX + mascaraX * escala + desplazamientoX)
                    let pantallaY = Math.round(y + mascaraY * escalaVertical + desplazamientoY)
                    let ancho = Math.max(1, Math.ceil(escala))
                    let alto = Math.max(1, Math.ceil(escalaVertical))
                    if (capa == 0) {
                        lienzo.fillRect(x - 1, pantallaY - 1, ancho + 2, alto + 2, 15)
                        lienzo.fillRect(x + 2, pantallaY + contorno, ancho + 1, alto + 1, 15)
                    }
                    else if (capa == 1) lienzo.fillRect(x + 1, pantallaY + sombra,
                        ancho, alto + 1, esDorado ? 4 : 8)
                    else {
                        let tinta = mascaraY < Math.idiv(mascara.height, 2) ? 1 : esDorado ? 5 : 9
                        if (Math.abs(mascaraX - columnaBrillo) < 2) tinta = 1
                        lienzo.fillRect(x, pantallaY, ancho, alto, tinta)
                    }
                }
            }
        }
    }
}

function cineDibujarLineasVelocidad(lienzo: Image, fuerza: number) {
    for (let i = 0; i < 12; i++) {
        let numeroAnillo = i * 2
        let progreso = ((cineMs * 0.0015 + i * 0.31) % 1)
        let radio = 20 + progreso * 92
        let x = 80 + cineAnilloX[numeroAnillo] * radio
        let y = 55 + cineAnilloY[numeroAnillo] * radio * 0.7
        let cola = radio - (5 + fuerza * 22)
        lienzo.drawLine(x, y,
            80 + cineAnilloX[numeroAnillo] * cola, 55 + cineAnilloY[numeroAnillo] * cola * 0.7,
            i % 3 == 0 ? 9 : 8)
    }
}

// Un texto en una caja oscura, centrado en horizontal.
function cineDibujarRotulo(lienzo: Image, texto: string, y: number, tinta: number) {
    let x = 80 - texto.length * 3
    lienzo.fillRect(x - 3, y - 2, texto.length * 6 + 6, 10, 15)
    lienzo.print(texto, x, y, tinta, image.font8)
}

function dibujarCine(lienzo: Image) {
    let tiempoMs = cineMs
    cineFocal = 92
    cineAtardecer = tiempoMs >= CINE_ATARDECER_MS
    if (tiempoMs < CINE_CARGA_PUERTA_MS) {
        let progreso = tiempoMs / CINE_CARGA_PUERTA_MS
        let curva = cineSuavizar(progreso)
        cineColocarCamara(
            Math.sin(progreso * Math.PI * 2) * 1.1,
            3.1 + Math.sin(progreso * Math.PI) * 0.8,
            -4 + curva * 38,
            Math.sin(progreso * Math.PI * 2) * 0.075,
            -0.04,
            Math.sin(progreso * Math.PI * 2) * 0.055)
    } else if (tiempoMs < CINE_PASO_PUERTA_MS) {
        let progreso = cineSuavizar((tiempoMs - CINE_CARGA_PUERTA_MS) / 2400)
        cineColocarCamara(0, 3.1 - progreso * 0.7, 34 + progreso * 3.2, 0, -0.04, 0)
    } else if (tiempoMs < CINE_TARJETA_MS) {
        let progreso = (tiempoMs - CINE_PASO_PUERTA_MS) / 4000
        // Acelerar a través de la puerta y después frenar antes de la isla de llegada.
        let progresoSuave = cineSuavizar(progreso)
        cineFocal = 92 - Math.sin(progreso * Math.PI) * 16
        cineColocarCamara(
            Math.sin(progreso * Math.PI * 2) * 0.8,
            2.4 + progresoSuave * 4,
            37.2 + progresoSuave * 72.8,
            Math.sin(progreso * Math.PI * 2) * 0.04,
            -0.04 - progresoSuave * 0.12,
            Math.sin(progreso * Math.PI * 2) * 0.09)
    } else {
        // Llegada: un trayecto tranquilo sobre la isla de llegada, bajo la tarjeta y el título.
        let progreso = Math.min(1,
            (tiempoMs - CINE_TARJETA_MS) / (CINE_FUNDIDO_MS - CINE_TARJETA_MS))
        cineColocarCamara(progreso * 1.1, 6.4 - progreso * 0.6, 110 + progreso * 6.2,
            progreso * 0.025, -0.16, 0)
    }
    let fuerzaPaso = tiempoMs >= CINE_PASO_PUERTA_MS && tiempoMs < CINE_TARJETA_MS
        ? Math.sin((tiempoMs - CINE_PASO_PUERTA_MS) / 4000 * Math.PI)
        : 0
    cineDibujarCielo(lienzo, cineAtardecer, fuerzaPaso)
    cineDibujarEscenario(lienzo)
    if (!cineAtardecer) {
        let carga = tiempoMs < CINE_CARGA_PUERTA_MS ? 0
            : tiempoMs < CINE_PASO_PUERTA_MS ? cineSuavizar((tiempoMs - CINE_CARGA_PUERTA_MS) / 1800)
            : 1
        cineDibujarPuerta(lienzo, carga)
    }
    if (tiempoMs < 1600) {
        // Desde el negro, la pantalla grande se abre (las bandas negras se apartan) y deja ver el vuelo de la cámara.
        let cortina = Math.round((1 - cineSuavizar(tiempoMs / 1600)) * 53)
        lienzo.fillRect(0, 6, 160, cortina, 15)
        lienzo.fillRect(0, 112 - cortina, 160, cortina, 15)
    }
    if (tiempoMs >= CINE_CARGA_PUERTA_MS && tiempoMs < CINE_PASO_PUERTA_MS) {
        let energia = cineSuavizar((tiempoMs - CINE_CARGA_PUERTA_MS) / 2400)
        // La energía atrae destellos visibles hacia la puerta antes de que se abra.
        for (let i = 0; i < 8; i++) {
            let numeroAnillo = i * 3
            let radio = 18 + ((i * 13 + 97 - ((tiempoMs - CINE_CARGA_PUERTA_MS) / 17) % 97) % 97)
            let x = 80 + cineAnilloX[numeroAnillo] * radio
            let y = 60 + cineAnilloY[numeroAnillo] * radio * 0.68
            lienzo.fillRect(x, y, 2 + energia * 2, 2 + energia * 2, i % 3 == 0 ? 5 : 9)
        }
    }
    if (fuerzaPaso > 0.1) cineDibujarLineasVelocidad(lienzo, fuerzaPaso)
    if (tiempoMs >= CINE_TARJETA_MS && tiempoMs < CINE_TITULO_MS) {
        let transcurridoMs = tiempoMs - CINE_TARJETA_MS
        // La tarjeta del estudio: CALLIOPE y HACKER en letras gigantes, y debajo “presenta”.
        cineDibujarLetras(lienzo, cineImagenCalliope, 19, 2.85,
            transcurridoMs + 180, (transcurridoMs - 1400) / 50, true, -1)
        cineDibujarLetras(lienzo, cineImagenHacker, 55, 3.45,
            transcurridoMs - 180, (transcurridoMs - 1700) / 48, false, 1)
        if (transcurridoMs > 1200) {
            let parteVisible = cineSuavizar((transcurridoMs - 1200) / 550)
            let y = 98 + Math.round((1 - parteVisible) * 6)
            lienzo.fillRect(Math.idiv(160 - cineImagenPresenta.width, 2) - 3, y - 2,
                cineImagenPresenta.width + 6, cineImagenPresenta.height + 3, 15)
            for (let x = 0; x < Math.floor(cineImagenPresenta.width * parteVisible); x++) {
                for (let pantallaY = 0; pantallaY < cineImagenPresenta.height; pantallaY++) {
                    if (cineImagenPresenta.getPixel(x, pantallaY)) {
                        lienzo.setPixel(Math.idiv(160 - cineImagenPresenta.width, 2) + x, y + pantallaY, 1)
                    }
                }
            }
        }
        let mitadLargo = Math.min(56, Math.max(0, (transcurridoMs - 1700) / 12))
        lienzo.drawLine(80 - mitadLargo, 106, 80 + mitadLargo, 106, 4)
    }
    if (tiempoMs >= CINE_TITULO_MS) {
        let transcurridoMs = tiempoMs - CINE_TITULO_MS
        let calma = 1 - cineSuavizar(transcurridoMs / 1000)
        // Una entrada tranquila y grande para el título: el vuelo de la cámara continúa por debajo.
        cineDibujarLetras(lienzo, cineImagenTitulo, 15 - calma * 7,
            cineEscalaTitulo(148) + calma * 0.12, transcurridoMs + 120, (transcurridoMs - 1800) / 33, true, -1)
        if (transcurridoMs > 1600) cineDibujarRotulo(lienzo, "CREA TU PROPIO MUNDO", 51, 13)
        // Hojas y chispas en primer plano se mueven con el movimiento de la cámara.
        for (let i = 0; i < 8; i++) {
            let x = (i * 43 + transcurridoMs / 95) % 176 - 8
            let y = 65 + (i * 19 % 42) + Math.sin(transcurridoMs * 0.0018 + i) * 3
            lienzo.fillRect(x, y, i % 3 == 0 ? 2 : 1, 1, i % 3 == 0 ? 5 : 7)
        }
        if (tiempoMs >= CINE_FUNDIDO_MS) {
            let fundido = cineSuavizar((tiempoMs - CINE_FUNDIDO_MS) / 1500)
            let cortina = Math.round(fundido * 32)
            lienzo.fillRect(0, 6, 160, cortina, 15)
            lienzo.fillRect(0, 112 - cortina, 160, cortina, 15)
            cineDibujarRotulo(lienzo, "EMPIEZA TU AVENTURA", Math.round(87 - fundido * 16), 9)
        }
    }
    lienzo.fillRect(0, 0, 160, 6, 15)
    lienzo.fillRect(0, 110, 160, 10, 15)
    lienzo.drawLine(0, 110, Math.idiv(Math.min(tiempoMs, CINE_DURACION_MS) * 159, CINE_DURACION_MS), 110, 4)
    if (tiempoMs - cineSaltoDesdeMs >= CINE_PAUSA_SALTO_MS) {
        let pista = "A: Saltar"
        lienzo.print(pista, 80 - pista.length * 3, 112, 11, image.font8)
    }
}

// Ampliación del título del juego: como mucho 2,36 veces, y nunca más ancho que el valor de ancho, en píxeles.
function cineEscalaTitulo(ancho: number): number {
    return Math.min(2.36, ancho / cineImagenTitulo.width)
}

function dibujarPresenta() {
    let texto = "presenta"
    cineImagenPresenta = image.create(texto.length * 6, 8)
    cineImagenPresenta.print(texto, 0, 0, 1, image.font8)
}
