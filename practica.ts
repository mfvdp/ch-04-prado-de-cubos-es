// La práctica en siete pasos en un terreno aparte. Al final, la partida de verdad (mundo, bolsa y posición)
// vuelve como estaba.
let practicaActiva = false
let practicaPaso = 0
let practicaMs = 0
let practicaProgreso = 0
let copiaPartida: Buffer = null
let practicaInicioZ = 0
let practicaAlFinal = false
let estabaSinGuardar = false
let practicaTitulos = [
    "EMPIEZA TU AVENTURA",
    "01  MOVERSE",
    "02  MIRAR",
    "03  ARRIBA Y ABAJO",
    "04  RECOGER MADERA",
    "05  TU PRIMER BLOQUE",
    "06  CAMBIAR MATERIAL",
    "07  LA MESA DE TRABAJO",
    "LISTO PARA TU MUNDO"
]
let practicaLinea1 = [
    "Conoce el mundo.",
    "Mantén ARRIBA: camina",
    "Mantén IZQ. o DERECHA",
    "Mantén B + ARR./ABAJO",
    "Apunta a la madera.",
    "Pulsa B brevemente.",
    "Mantén B + DERECHA.",
    "Abre MENU.",
    "Explora. Recoge. Crea."
]
let practicaLinea2 = [
    "Siete tareas pequeñas.",
    "Ve al bloque de prueba.",
    "Así puedes girar.",
    "Mueve la mirada.",
    "Mantén A para extraer.",
    "Ponlo ante la piedra.",
    "Elige un material.",
    "Fabrica un pico.",
    "A: ¡a la aventura!"
]

function iniciarPractica() {
    // Aunque se repita la práctica, se conservan el mundo, la bolsa y la posición del juego de verdad.
    estabaSinGuardar = sinGuardar
    copiaPartida = codificarProgreso()
    generarMundo()
    for (let x = 9; x <= 15; x++) {
        for (let z = 3; z <= 10; z++) {
            escribirBloque(x, 3, z, Bloque.Hierba)
            for (let y = 4; y < MUNDO_ALTO; y++) escribirBloque(x, y, z, Bloque.Aire)
        }
    }
    escribirBloque(12, 4, 7, Bloque.Madera)
    escribirBloque(12, 5, 7, Bloque.Madera)
    escribirBloque(12, 4, 8, Bloque.Piedra)
    escribirBloque(12, 5, 8, Bloque.Piedra)
    practicaActiva = true
    practicaPaso = 0
    practicaMs = 0
    practicaProgreso = 0
    practicaInicioZ = jugadorZ
    practicaAlFinal = false
    tituloAbierto = false
    menuAbierto = false
    botonesBloqueados = true
    bUsado = true
    extraccionMs = 0
    avisoHastaMs = 0
    actualizarObjetivo()
    pedirImagenNueva()
}
function terminarPractica(conseguida: boolean) {
    if (!practicaActiva) return
    if (copiaPartida) decodificarProgreso(copiaPartida)
    sinGuardar = estabaSinGuardar
    copiaPartida = null
    practicaActiva = false
    practicaAlFinal = false
    menuAbierto = false
    tituloAbierto = false
    botonesBloqueados = true
    bUsado = true
    extraccionMs = 0
    if (conseguida) {
        practicaHecha = true
        sinGuardar = true
        guardarPartida()
        avisar("¡Empieza tu aventura!")
    } else avisar("Práctica terminada")
    actualizarObjetivo()
    pedirImagenNueva()
}
function pasarPasoSiguiente() {
    practicaPaso++
    practicaMs = 0
    practicaProgreso = 0
    extraccionMs = 0
    botonesBloqueados = true
    bUsado = true
    tocarSonido(2)
    if (practicaPaso == 3 || practicaPaso == 4 || practicaPaso == 5) {
        giro = 0
        inclinacion = -0.16
    }
    if (practicaPaso == 4) {
        jugadorX = 12 * UNIDAD + 128
        jugadorZ = 5 * UNIDAD + 128
        jugadorY = 4 * UNIDAD
        velocidadCaida = 0
    }
    if (practicaPaso == 8) {
        practicaAlFinal = true
        menuAbierto = false
    }
    actualizarObjetivo()
    pedirImagenNueva()
}
function comprobarAccionPractica(accion: number) {
    if (!practicaActiva) return
    if ((practicaPaso == 4 && accion == 0) || (practicaPaso == 5 && accion == 1) ||
        (practicaPaso == 6 && accion == 2) || (practicaPaso == 7 && accion == 3)) pasarPasoSiguiente()
}
function actualizarPractica(duracionMs: number, sentidoGiro: number, sentidoMirada: number) {
    if (!practicaActiva) return
    practicaMs += duracionMs
    if (practicaPaso == 0 && practicaMs >= 2600) pasarPasoSiguiente()
    else if (practicaPaso == 1) {
        practicaProgreso = Math.min(1, Math.max(0, (jugadorZ - practicaInicioZ) / 160))
        if (practicaProgreso >= 1) pasarPasoSiguiente()
    } else if (practicaPaso == 2) {
        practicaProgreso += Math.abs(sentidoGiro) * duracionMs / 260
        if (practicaProgreso >= 1) pasarPasoSiguiente()
    } else if (practicaPaso == 3) {
        practicaProgreso += Math.abs(sentidoMirada) * duracionMs / 260
        if (practicaProgreso >= 1) pasarPasoSiguiente()
    }
}
function dibujarPractica(lienzo: Image) {
    if (practicaPaso == 0 || practicaPaso == 8) {
        lienzo.fillRect(4, 30, 152, 61, 15)
        lienzo.drawRect(4, 30, 152, 61, 6)
        let titulo = practicaTitulos[practicaPaso]
        lienzo.print(titulo.substr(0, Math.min(titulo.length, Math.idiv(practicaMs, 35))),
            9, 38, 7, image.font8)
        lienzo.print(practicaLinea1[practicaPaso], 11, 53, 1, image.font8)
        lienzo.print(practicaLinea2[practicaPaso], 11, 64, 13, image.font8)
        if (practicaPaso == 0) {
            lienzo.fillRect(11, 81, Math.min(138, Math.idiv(practicaMs * 138, 2600)), 2, 9)
        } else {
            let brillo = Math.idiv(practicaMs, 250) % 2 == 0 ? 5 : 13
            let textoAdelante = "A: ¡VAMOS!"
            lienzo.print(textoAdelante, 80 - textoAdelante.length * 3, 79, brillo, image.font8)
        }
    } else if (!menuAbierto) {
        lienzo.fillRect(0, 80, 160, 32, 15)
        lienzo.drawLine(0, 80, 159, 80, 6)
        lienzo.print(practicaTitulos[practicaPaso], 4, 84, 5, image.font8)
        lienzo.print(practicaLinea1[practicaPaso], 4, 94, 1, image.font8)
        lienzo.print(practicaLinea2[practicaPaso], 4, 103, 13, image.font8)
        for (let i = 0; i < 7; i++) {
            lienzo.fillRect(114 + i * 6, 73, 4, 3,
                i < practicaPaso - 1 ? 7 : i == practicaPaso - 1 ? 5 : 12)
        }
    }
    lienzo.fillRect(0, 0, 160, 8, 15)
    lienzo.print("PRÁCTICA " + Math.min(7, practicaPaso) + "/7", 2, 1, 9, image.font8)
    lienzo.print(practicaPaso == 7 ? "MENU" : "MENU: SALIR",
        practicaPaso == 7 ? 134 : 88, 1, 13, image.font8)
}
