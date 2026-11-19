// El mundo y sus reglas: los bloques, los movimientos del jugador, extraer, poner, fabricar y guardar la partida.
// Todas las posiciones están en 256avos de bloque (un bloque mide UNIDAD = 256 de ancho): así se calcula sin números
// con coma. El eje Y apunta hacia arriba.
const MUNDO_ANCHO = 24
const MUNDO_ALTO = 12
const UNIDAD = 256
const JUGADOR_MEDIO_ANCHO = 62
const JUGADOR_ALTO = 410
const ALTURA_OJOS = 350
const NUM_BLOQUES = MUNDO_ANCHO * MUNDO_ANCHO * MUNDO_ALTO
const TAMANO_PROGRESO = 64 + NUM_BLOQUES / 2 + 2
// Velocidad inicial de un salto, en 1/256 de bloque por segundo. El jugador sube unos 1,27 bloques: justo lo necesario
// para saltar sobre un bloque y poner un bloque debajo durante el salto.
const SALTO_VELOCIDAD = 1140
// Si el espacio alrededor del jugador tiene menos casillas que este número, cuenta como hoyo.
const HOYO_LIMITE = 20
enum Bloque { Aire, Hierba, Tierra, Piedra, Madera, Hojas, Tablas, Cristal, RocaBase }
let mundo = control.createBuffer(NUM_BLOQUES)
let bolsa = [0, 0, 24, 16, 8, 0, 12, 0, 0]
let materiales = [Bloque.Tierra, Bloque.Piedra, Bloque.Madera, Bloque.Hojas, Bloque.Tablas, Bloque.Cristal]
let nombresBloque = ["Aire", "Hierba", "Tierra", "Piedra", "Madera", "Hojas", "Tablas", "Cristal", "Roca base"]
let ranuraActual = 0
let cristalesHallados = 0
let jugadorX = 3200
let jugadorY = 1024
let jugadorZ = 1152
let giro = 0
let inclinacion = -0.16
let velocidadCaida = 0
let enSuelo = true
// Si el jugador está en el aire por un salto, y a qué altura (en bloques) estaban sus pies al saltar.
let saltando = false
let alturaSalto = 0
// Lo que sobró del último movimiento vertical porque era menos de 1/256 de bloque (en 2000avos). Así no se pierde nada
// al calcular con números enteros.
let restoCaida = 0
// Notas para buscar un hoyo: las casillas ya visitadas y una cola de las casillas que faltan. Se crean una sola vez, no
// en cada imagen.
let hoyoVisto = control.createBuffer(MUNDO_ANCHO * MUNDO_ANCHO)
let hoyoX = control.createBuffer(HOYO_LIMITE)
let hoyoZ = control.createBuffer(HOYO_LIMITE)
let hoyoPies = control.createBuffer(HOYO_LIMITE)
let sinGuardar = false
let anchoRayo = 4
let tienePico = false
let practicaHecha = false

function estaEnMundo(x: number, y: number, z: number): boolean {
    return x >= 0 && x < MUNDO_ANCHO && y >= 0 && y < MUNDO_ALTO && z >= 0 && z < MUNDO_ANCHO
}
function bloqueEn(x: number, y: number, z: number): number {
    if (!estaEnMundo(x, y, z)) return Bloque.Aire
    return mundo[x + MUNDO_ANCHO * (z + MUNDO_ANCHO * y)]
}
function escribirBloque(x: number, y: number, z: number, tipoBloque: number) {
    if (estaEnMundo(x, y, z) && y > 0) {
        mundo[x + MUNDO_ANCHO * (z + MUNDO_ANCHO * y)] = tipoBloque
        sinGuardar = true
    }
}
function hayChoque(x: number, y: number, z: number): boolean {
    if (x - JUGADOR_MEDIO_ANCHO < 0 || z - JUGADOR_MEDIO_ANCHO < 0 ||
        x + JUGADOR_MEDIO_ANCHO >= MUNDO_ANCHO * UNIDAD || z + JUGADOR_MEDIO_ANCHO >= MUNDO_ANCHO * UNIDAD ||
        y < UNIDAD) return true
    for (let bloqueY = y >> 8; bloqueY <= (y + JUGADOR_ALTO - 1) >> 8; bloqueY++) {
        for (let bloqueZ = (z - JUGADOR_MEDIO_ANCHO) >> 8; bloqueZ <= (z + JUGADOR_MEDIO_ANCHO - 1) >> 8; bloqueZ++) {
            for (let bloqueX = (x - JUGADOR_MEDIO_ANCHO) >> 8;
                bloqueX <= (x + JUGADOR_MEDIO_ANCHO - 1) >> 8; bloqueX++) {
                if (bloqueEn(bloqueX, bloqueY, bloqueZ) != Bloque.Aire) return true
            }
        }
    }
    return false
}
function solapaJugador(x: number, y: number, z: number): boolean {
    return x * UNIDAD < jugadorX + JUGADOR_MEDIO_ANCHO && (x + 1) * UNIDAD > jugadorX - JUGADOR_MEDIO_ANCHO &&
        z * UNIDAD < jugadorZ + JUGADOR_MEDIO_ANCHO && (z + 1) * UNIDAD > jugadorZ - JUGADOR_MEDIO_ANCHO &&
        y * UNIDAD < jugadorY + JUGADOR_ALTO && (y + 1) * UNIDAD > jugadorY
}
function plantarArbol(x: number, z: number, suelo: number) {
    for (let y = suelo + 3; y <= suelo + 4; y++) {
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) escribirBloque(x + dx, y, z + dz, Bloque.Hojas)
        }
    }
    for (let y = suelo + 1; y <= suelo + 3; y++) escribirBloque(x, y, z, Bloque.Madera)
}
function generarMundo() {
    mundo.fill(0)
    let faseX = randint(0, 628) / 100
    let faseZ = randint(0, 628) / 100
    for (let z = 0; z < MUNDO_ANCHO; z++) {
        for (let x = 0; x < MUNDO_ANCHO; x++) {
            let alturaColumna = 3 +
                Math.floor((Math.sin(x * 0.43 + faseX) + Math.cos(z * 0.38 + faseZ) + 2) * 0.65)
            // La franja que lleva hasta el primer árbol queda plana (altura 3) en cada mundo nuevo, para que el
            // comienzo sea fácil.
            if (x >= 9 && x <= 15 && z <= 9) alturaColumna = 3
            for (let y = 0; y <= alturaColumna; y++) {
                let tipoBloque = y == 0 ? Bloque.RocaBase
                    : y == alturaColumna ? Bloque.Hierba
                    : y == alturaColumna - 1 ? Bloque.Tierra
                    : Bloque.Piedra
                if (y > 0 && y < alturaColumna - 1 && randint(0, 29) == 0) tipoBloque = Bloque.Cristal
                mundo[x + MUNDO_ANCHO * (z + MUNDO_ANCHO * y)] = tipoBloque
            }
            if (x % 5 == 2 && z % 6 == 3 && z > 7) plantarArbol(x, z, alturaColumna)
        }
    }
    // Cristales fijos justo encima de la roca base (altura 1) y una pequeña cámara bajo el suelo: siempre hay
    // algo que encontrar.
    for (let i = 0; i < 7; i++) escribirBloque(3 + i * 2, 1, 18, Bloque.Cristal)
    for (let x = 4; x <= 7; x++) {
        for (let z = 15; z <= 18; z++) {
            escribirBloque(x, 2, z, Bloque.Aire)
            escribirBloque(x, 3, z, Bloque.Aire)
        }
    }
    plantarArbol(12, 9, 3)
    // Ya hay algunos bloques de piedra y de tablas, para probar enseguida a construir.
    escribirBloque(15, 4, 7, Bloque.Piedra)
    escribirBloque(15, 5, 7, Bloque.Piedra)
    escribirBloque(16, 4, 7, Bloque.Tablas)
    bolsa = [0, 0, 24, 16, 8, 0, 12, 0, 0]
    ranuraActual = 0
    cristalesHallados = 0
    tienePico = false
    giro = 0
    inclinacion = -0.16
    volverAlInicio()
    sinGuardar = true
}
function volverAlInicio() {
    jugadorX = 12 * UNIDAD + 128
    jugadorZ = 4 * UNIDAD + 128
    jugadorY = 4 * UNIDAD
    escribirBloque(12, 3, 4, Bloque.Hierba)
    escribirBloque(12, 4, 4, Bloque.Aire)
    escribirBloque(12, 5, 4, Bloque.Aire)
    velocidadCaida = 0
    enSuelo = true
    saltando = false
}
function moverEnEje(dx: number, dz: number) {
    if (!hayChoque(jugadorX + dx, jugadorY, jugadorZ + dz)) {
        jugadorX += dx
        jugadorZ += dz
    } else if (enSuelo && !hayChoque(jugadorX, jugadorY + UNIDAD, jugadorZ) &&
        !hayChoque(jugadorX + dx, jugadorY + UNIDAD, jugadorZ + dz)) {
        jugadorY += UNIDAD
        jugadorX += dx
        jugadorZ += dz
        // En cada cálculo, el jugador solo sube un escalón, incluso en diagonal; después cuenta como «en el aire».
        enSuelo = false
        velocidadCaida = 0
    }
}
function moverJugador(avance: number, duracionMs: number) {
    duracionMs = Math.max(0, Math.min(80, duracionMs))
    if (duracionMs == 0) return
    // Quien sube volando no está de pie en el suelo. Así el jugador no sube además un escalón al saltar.
    enSuelo = velocidadCaida <= 0 && hayChoque(jugadorX, jugadorY - 2, jugadorZ)
    let distancia = Math.idiv(avance * duracionMs * 7, 10)
    moverEnEje(Math.round(Math.sin(giro) * distancia), 0)
    moverEnEje(0, Math.round(Math.cos(giro) * distancia))
    // Camino según el reloj: la velocidad media antes y después del paso de tiempo, por la duración. Así un salto sube
    // igual de alto tanto si una imagen dura 16 como 80 milisegundos.
    let velocidadAntes = velocidadCaida
    velocidadCaida = Math.max(-1100, velocidadCaida - duracionMs * 2)
    let recorrido = (velocidadAntes + velocidadCaida) * duracionMs + restoCaida
    let movimiento = Math.idiv(recorrido, 2000)
    restoCaida = recorrido - movimiento * 2000
    let trozos = Math.max(1, Math.ceil(Math.abs(movimiento) / 24))
    for (let i = 0; i < trozos; i++) {
        let dy = Math.idiv(movimiento * (i + 1), trozos) - Math.idiv(movimiento * i, trozos)
        if (!hayChoque(jugadorX, jugadorY + dy, jugadorZ)) jugadorY += dy
        else {
            // El jugador se desliza paso a paso hasta tocar el suelo o el techo, en vez de quedarse
            // flotando justo antes.
            let sentido = dy < 0 ? -1 : 1
            for (let pasoUnitario = 0; pasoUnitario < Math.abs(dy); pasoUnitario++) {
                if (hayChoque(jugadorX, jugadorY + sentido, jugadorZ)) break
                jugadorY += sentido
            }
            velocidadCaida = 0
            restoCaida = 0
            break
        }
    }
    enSuelo = hayChoque(jugadorX, jugadorY - 1, jugadorZ)
    if (enSuelo && velocidadCaida <= 0) saltando = false
}
// Solo se salta desde el suelo, no en el aire.
function saltar(): boolean {
    if (!hayChoque(jugadorX, jugadorY - 1, jugadorZ)) return false
    velocidadCaida = SALTO_VELOCIDAD
    restoCaida = 0
    enSuelo = false
    saltando = true
    alturaSalto = jugadorY >> 8
    return true
}
// Durante un salto, poner un bloque bajo los pies (construir hacia arriba). Si el material elegido se ha acabado, el
// jugador toma el siguiente material del que aún le queda.
function construirDebajo(): boolean {
    if (!saltando || jugadorY < (alturaSalto + 1) * UNIDAD) return false
    if (bolsa[materiales[ranuraActual]] == 0) {
        for (let i = 1; i < materiales.length; i++) {
            let siguiente = (ranuraActual + i) % materiales.length
            if (bolsa[materiales[siguiente]] > 0) {
                ranuraActual = siguiente
                break
            }
        }
    }
    return ponerBloque(jugadorX >> 8, alturaSalto, jugadorZ >> 8)
}
// ¿Le queda al jugador algún material?
function quedaMaterial(): boolean {
    for (let i = 0; i < materiales.length; i++) {
        if (bolsa[materiales[i]] > 0) return true
    }
    return false
}
// ¿Adónde llega el jugador desde su casilla a la casilla vecina, solo andando y saltando? La respuesta es la nueva
// altura de sus pies, o -1 si no se puede.
function alturaAlcanzada(x: number, z: number, pies: number, vecinoX: number, vecinoZ: number): number {
    if (vecinoX < 0 || vecinoZ < 0 || vecinoX >= MUNDO_ANCHO || vecinoZ >= MUNDO_ANCHO) return -1
    if (bloqueEn(vecinoX, pies, vecinoZ) == Bloque.Aire && bloqueEn(vecinoX, pies + 1, vecinoZ) == Bloque.Aire) {
        let y = pies
        while (y > 1 && bloqueEn(vecinoX, y - 1, vecinoZ) == Bloque.Aire) y--
        return y
    }
    if (bloqueEn(vecinoX, pies + 1, vecinoZ) == Bloque.Aire && bloqueEn(vecinoX, pies + 2, vecinoZ) == Bloque.Aire &&
        bloqueEn(x, pies + 2, z) == Bloque.Aire) return pies + 1
    return -1
}
// Cuenta las casillas a las que llega el jugador andando y saltando, pero solo hasta el límite de un hoyo. Menos
// casillas significa: está en un hoyo y solo sale construyendo hacia arriba o cavando.
function contarEspacio(): number {
    hoyoVisto.fill(0)
    hoyoX[0] = jugadorX >> 8
    hoyoZ[0] = jugadorZ >> 8
    hoyoPies[0] = jugadorY >> 8
    hoyoVisto[hoyoX[0] + MUNDO_ANCHO * hoyoZ[0]] = 1
    let cantidad = 1
    let siguiente = 0
    while (siguiente < cantidad) {
        let x = hoyoX[siguiente]
        let z = hoyoZ[siguiente]
        let pies = hoyoPies[siguiente]
        siguiente++
        for (let lado = 0; lado < 4; lado++) {
            let vecinoX = x + (lado == 0 ? 1 : lado == 1 ? -1 : 0)
            let vecinoZ = z + (lado == 2 ? 1 : lado == 3 ? -1 : 0)
            let alcanzada = alturaAlcanzada(x, z, pies, vecinoX, vecinoZ)
            if (alcanzada < 0 || hoyoVisto[vecinoX + MUNDO_ANCHO * vecinoZ] == 1) continue
            if (cantidad >= HOYO_LIMITE) return HOYO_LIMITE
            hoyoVisto[vecinoX + MUNDO_ANCHO * vecinoZ] = 1
            hoyoX[cantidad] = vecinoX
            hoyoZ[cantidad] = vecinoZ
            hoyoPies[cantidad] = alcanzada
            cantidad++
        }
    }
    return cantidad
}
function extraerBloque(x: number, y: number, z: number): boolean {
    let tipoBloque = bloqueEn(x, y, z)
    if (tipoBloque == Bloque.Aire || tipoBloque == Bloque.RocaBase || !estaEnMundo(x, y, z)) return false
    let obtenido = tipoBloque == Bloque.Hierba ? Bloque.Tierra : tipoBloque
    if (bolsa[obtenido] >= 999) return false
    bolsa[obtenido]++
    // Los cristales se cuentan según la mayor reserva que se haya tenido: poner un cristal y volver a cogerlo no lo
    // cuenta dos veces.
    if (tipoBloque == Bloque.Cristal) cristalesHallados = Math.max(cristalesHallados, bolsa[tipoBloque])
    escribirBloque(x, y, z, Bloque.Aire)
    return true
}
function ponerBloque(x: number, y: number, z: number): boolean {
    let tipoBloque = materiales[ranuraActual]
    if (!estaEnMundo(x, y, z) || y == 0 || bloqueEn(x, y, z) != Bloque.Aire || bolsa[tipoBloque] == 0 ||
        solapaJugador(x, y, z)) return false
    escribirBloque(x, y, z, tipoBloque)
    bolsa[tipoBloque]--
    return true
}
function fabricarTablas(): boolean {
    if (bolsa[Bloque.Madera] < 1 || bolsa[Bloque.Tablas] > 995) return false
    bolsa[Bloque.Madera]--
    bolsa[Bloque.Tablas] += 4
    sinGuardar = true
    return true
}
function fabricarPico(): boolean {
    if (tienePico || bolsa[Bloque.Madera] < 2 || bolsa[Bloque.Piedra] < 3) return false
    bolsa[Bloque.Madera] -= 2
    bolsa[Bloque.Piedra] -= 3
    tienePico = true
    sinGuardar = true
    return true
}
function sumaControl(datos: Buffer): number {
    let suma = 0
    for (let i = 0; i < datos.length - 2; i++) suma = (suma * 31 + datos[i]) & 65535
    return suma
}
function codificarProgreso(): Buffer {
    let datos = control.createBuffer(TAMANO_PROGRESO)
    datos[0] = 67
    datos[1] = 51
    datos[2] = 1
    datos[3] = ranuraActual
    datos[4] = anchoRayo
    datos[5] = tienePico ? 1 : 0
    datos.setNumber(NumberFormat.UInt16LE, 6, jugadorX)
    datos.setNumber(NumberFormat.UInt16LE, 8, jugadorY)
    datos.setNumber(NumberFormat.UInt16LE, 10, jugadorZ)
    datos.setNumber(NumberFormat.UInt16LE, 12, Math.floor(giro * 10000))
    datos.setNumber(NumberFormat.UInt16LE, 14, Math.floor((inclinacion + 1.2) * 10000))
    datos.setNumber(NumberFormat.UInt16LE, 16, Math.min(65535, cristalesHallados))
    for (let i = 0; i < bolsa.length; i++) datos.setNumber(NumberFormat.UInt16LE, 18 + i * 2, bolsa[i])
    datos[40] = practicaHecha ? 1 : 0
    for (let i = 0; i < NUM_BLOQUES; i += 2) datos[64 + i / 2] = mundo[i] | (mundo[i + 1] << 4)
    datos.setNumber(NumberFormat.UInt16LE, TAMANO_PROGRESO - 2, sumaControl(datos))
    return datos
}
function decodificarProgreso(datos: Buffer): boolean {
    if (!datos || datos.length != TAMANO_PROGRESO || datos[0] != 67 || datos[1] != 51 || datos[2] != 1 ||
        datos[3] >= materiales.length || (datos[4] != 2 && datos[4] != 4 && datos[4] != 8) ||
        datos[5] > 1 || datos[40] > 1 ||
        datos.getNumber(NumberFormat.UInt16LE, TAMANO_PROGRESO - 2) != sumaControl(datos)) return false
    let x = datos.getNumber(NumberFormat.UInt16LE, 6)
    let y = datos.getNumber(NumberFormat.UInt16LE, 8)
    let z = datos.getNumber(NumberFormat.UInt16LE, 10)
    if (x < JUGADOR_MEDIO_ANCHO || z < JUGADOR_MEDIO_ANCHO ||
        x >= MUNDO_ANCHO * UNIDAD - JUGADOR_MEDIO_ANCHO || z >= MUNDO_ANCHO * UNIDAD - JUGADOR_MEDIO_ANCHO ||
        y < UNIDAD || y > MUNDO_ALTO * UNIDAD ||
        datos.getNumber(NumberFormat.UInt16LE, 12) >= 62832 ||
        datos.getNumber(NumberFormat.UInt16LE, 14) > 24000) return false
    for (let i = 0; i < bolsa.length; i++) {
        if (datos.getNumber(NumberFormat.UInt16LE, 18 + i * 2) > 999) return false
    }
    for (let i = 64; i < TAMANO_PROGRESO - 2; i++) {
        if ((datos[i] & 15) > Bloque.RocaBase || (datos[i] >> 4) > Bloque.RocaBase) return false
        if (i < 64 + MUNDO_ANCHO * MUNDO_ANCHO / 2 && datos[i] != 136) return false
    }
    for (let i = 0; i < NUM_BLOQUES; i += 2) {
        mundo[i] = datos[64 + i / 2] & 15
        mundo[i + 1] = datos[64 + i / 2] >> 4
    }
    jugadorX = x
    jugadorY = y
    jugadorZ = z
    giro = datos.getNumber(NumberFormat.UInt16LE, 12) / 10000
    inclinacion = datos.getNumber(NumberFormat.UInt16LE, 14) / 10000 - 1.2
    ranuraActual = datos[3]
    anchoRayo = datos[4]
    tienePico = datos[5] == 1
    practicaHecha = datos[40] == 1
    cristalesHallados = datos.getNumber(NumberFormat.UInt16LE, 16)
    for (let i = 0; i < bolsa.length; i++) {
        bolsa[i] = datos.getNumber(NumberFormat.UInt16LE, 18 + i * 2)
    }
    velocidadCaida = 0
    saltando = false
    sinGuardar = false
    if (hayChoque(jugadorX, jugadorY, jugadorZ)) volverAlInicio()
    else enSuelo = hayChoque(jugadorX, jugadorY - 1, jugadorZ)
    return true
}
