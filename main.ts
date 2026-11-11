// Arranque, controles, mesa de trabajo y pantalla.
// El nombre del juego solo aparece aquí en el código; la película y la imagen del título lo toman de aquí.
// El nombre del proyecto está en pxt.json; es también la zona de memoria donde se guardan las partidas.
const TITULO = "PRADO DE CUBOS"
// Con esta clave se guarda la partida en settings.
const CLAVE_PROGRESO = "prado-de-cubos-v1"
// Después de un cambio de pantalla, una pulsación solo cuenta pasado este tiempo (contra el machacar de teclas).
const PANTALLA_QUIETA_MS = 500
// Imagen en la pared de la mesa de trabajo: esquina superior izquierda de la imagen, con un píxel de marco alrededor.
const PARED_X = 129
const PARED_Y = 11
let tituloAbierto = true
let tituloDesdeMs = 0
let menuQuietoHastaMs = 0
let volumenSinGuardar = false
let menuAbierto = false
let filaMenu = 0
const NUM_FILAS_MENU = 12
let mundoNuevoPreguntado = false
let bUsado = false
let botonesBloqueados = true
let cineRepetido = false
let extraccionMs = 0
let extraccionX = -1
let extraccionY = -1
let extraccionZ = -1
let ultimaActualizacionMs = 0
let ultimoGuardadoMs = -11000
let ultimaRevisionGuardadoMs = 0
let aviso = ""
let avisoHastaMs = 0
let habiaProgreso = false
let ultimoGolpeMs = -1000
let ultimoPasoMs = -1000
let faseAndar = 0
let inicioAstillasMs = -1000
let colorAstillas = 14
let iconoArriba = [9, 7, 4, 13, 4, 7, 13, 1, 11]
let iconoFrente = [9, 6, 14, 11, 14, 6, 4, 9, 12]
let iconoLado = [9, 14, 12, 12, 12, 6, 14, 8, 15]
let versionEscena = 0
let versionDibujada = -1
let jugadorDibujadoX = -1
let jugadorDibujadoY = -1
let jugadorDibujadoZ = -1
let giroDibujado = -1
let inclinacionDibujada = -2
let anchoRayoDibujado = 0
let imagenMundo = image.create(160, 120)
let logoTitulo: Image = null

function pedirImagenNueva() {
    versionEscena++
}
function avisar(texto: string) {
    aviso = texto
    avisoHastaMs = game.runtime() + 2500
}
function guardarPartida(): boolean {
    // El lugar de la práctica nunca debe sobrescribir la partida de verdad.
    if (practicaActiva) return false
    if (game.runtime() - ultimoGuardadoMs < 11000) {
        avisar("Guardar: espera")
        return false
    }
    settings.writeBuffer(CLAVE_PROGRESO, codificarProgreso())
    ultimoGuardadoMs = game.runtime()
    sinGuardar = false
    avisar("Partida guardada")
    return true
}
function iniciarJuego() {
    tituloAbierto = false
    menuAbierto = false
    botonesBloqueados = true
    bUsado = true
    extraccionMs = 0
    actualizarObjetivo()
    pedirImagenNueva()
    avisar(tienePico ? "¡Pico listo! ¡Adelante!" : "MENU: fabrica tu pico")
}
function despuesDelCine() {
    music.stopAllSounds()
    if (cineRepetido) {
        cineRepetido = false
        iniciarJuego()
    } else if (!practicaHecha) iniciarPractica()
    else {
        tituloAbierto = true
        tituloDesdeMs = game.runtime()
        botonesBloqueados = true
        pedirImagenNueva()
    }
}
function tituloListo(): boolean {
    return game.runtime() - tituloDesdeMs >= PANTALLA_QUIETA_MS
}
function cambiarRanura(sentido: number) {
    ranuraActual = (ranuraActual + sentido + materiales.length) % materiales.length
    sinGuardar = true
    avisar(nombresBloque[materiales[ranuraActual]])
    comprobarAccionPractica(2)
}
function alternarMenu() {
    menuAbierto = !menuAbierto
    filaMenu = 0
    mundoNuevoPreguntado = false
    bUsado = true
    botonesBloqueados = true
    extraccionMs = 0
}
function ejecutarFilaMenu() {
    if (practicaActiva) {
        if (practicaPaso == 7 && fabricarPico()) {
            comprobarAccionPractica(3)
        }
        return
    }
    if (filaMenu == 0) cambiarRanura(1)
    else if (filaMenu == 1) {
        let fabricado = fabricarPico()
        avisar(fabricado ? "¡Pico fabricado!"
            : tienePico ? "Ya tienes un pico"
            : "Faltan 2 mad.+3 piedra")
        if (fabricado) tocarSonido(2)
    } else if (filaMenu == 2) {
        let fabricado = fabricarTablas()
        avisar(fabricado ? "4 tablas fabricadas" : "Falta 1 madera / lleno")
        if (fabricado) tocarSonido(2)
    } else if (filaMenu == 3) guardarPartida()
    else if (filaMenu == 4) {
        anchoRayo = enDispositivo ? (anchoRayo == 8 ? 4 : 8) : (anchoRayo == 4 ? 8 : anchoRayo == 8 ? 2 : 4)
        sinGuardar = true
        avisar(anchoRayo == 8 ? "Gráficos: rápidos"
            : anchoRayo == 2 ? "Fino: mayor cálculo"
            : "Gráficos: normales")
        pedirImagenNueva()
    } else if (filaMenu == 5) {
        inclinacion = -0.16
        actualizarObjetivo()
        sinGuardar = true
        avisar("Mirar al frente")
    } else if (filaMenu == 6) {
        volverAlInicio()
        iniciarJuego()
        avisar("De vuelta al inicio")
    } else if (filaMenu == 7) iniciarPractica()
    else if (filaMenu == 8) {
        menuAbierto = false
        tituloAbierto = true
        cineRepetido = true
        botonesBloqueados = true
        ultimoCapituloCine = -1
        music.stopAllSounds()
        cinePreparar()
    } else if (filaMenu == 9) {
        sonidoActivo = !sonidoActivo
        if (!sonidoActivo) music.stopAllSounds()
    } else if (filaMenu == 11) {
        // El volumen solo se guarda al cerrar el menú (actualizarJuego mira volumenSinGuardar), no en cada pulsación.
        music.setVolume(music.volume() >= 255 ? 0 : Math.min(255, music.volume() + 64))
        volumenSinGuardar = true
    } else if (!mundoNuevoPreguntado) {
        mundoNuevoPreguntado = true
        avisar("¿Nuevo mundo? B: sí")
    } else {
        generarMundo()
        let guardado = guardarPartida()
        iniciarJuego()
        avisar(guardado ? "Nuevo mundo guardado" : "Nuevo mundo: guarda")
    }
}
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    // MENU salta la película, la imagen del título y la práctica, y pasa directamente al juego. En el paso 7 de la
    // práctica (la mesa de trabajo), MENU abre la mesa de trabajo en su lugar. Una segunda pulsación demasiado rápida,
    // justo después, no debe abrir la mesa de trabajo enseguida.
    let ahora = game.runtime()
    if (ahora < menuQuietoHastaMs) return
    if (!cineTerminado) {
        cineSaltar()
        music.stopAllSounds()
        cineRepetido = false
        iniciarJuego()
        menuQuietoHastaMs = ahora + PANTALLA_QUIETA_MS
    } else if (practicaActiva) {
        if (practicaPaso == 7 && !menuAbierto) {
            menuAbierto = true
            filaMenu = 1
            botonesBloqueados = true
            bUsado = true
        } else {
            terminarPractica(false)
            menuQuietoHastaMs = ahora + PANTALLA_QUIETA_MS
        }
    } else if (tituloAbierto) {
        if (tituloListo()) {
            iniciarJuego()
            menuQuietoHastaMs = ahora + PANTALLA_QUIETA_MS
        }
    } else alternarMenu()
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!cineTerminado) {
        // Una pulsación salta una estación: vuelo -> tarjeta -> título -> práctica o imagen del título; tras “Ver
        // introducción” en la mesa de trabajo, se pasa después directamente al juego.
        if (pasarEstacionSiguiente()) {
            music.stopAllSounds()
            if (cineTerminado) despuesDelCine()
        }
    } else if (practicaActiva && practicaAlFinal) terminarPractica(true)
    else if (tituloAbierto) {
        if (tituloListo()) iniciarJuego()
    } else if (menuAbierto) {
        menuAbierto = false
        mundoNuevoPreguntado = false
        botonesBloqueados = true
    }
})
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    bUsado = !cineTerminado || tituloAbierto || menuAbierto || botonesBloqueados
    if (!cineTerminado) return
    if (tituloAbierto) {
        if (tituloListo()) iniciarPractica()
    }
    else if (menuAbierto) ejecutarFilaMenu()
})
controller.B.onEvent(ControllerButtonEvent.Released, function () {
    if (cineTerminado && !tituloAbierto && !menuAbierto && !bUsado && !botonesBloqueados &&
        (!practicaActiva || practicaPaso == 5)) {
        actualizarObjetivo()
        if (!hayObjetivo) avisar("Objetivo fuera de rango")
        else if (ponerBloque(lugarX, lugarY, lugarZ)) {
            tocarSonido(1)
            ultimoGolpeMs = game.runtime()
            pedirImagenNueva()
            comprobarAccionPractica(1)
        } else avisar("Sin sitio / material")
        actualizarObjetivo()
    }
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (menuAbierto && !practicaActiva) {
        filaMenu = (filaMenu + NUM_FILAS_MENU - 1) % NUM_FILAS_MENU
        mundoNuevoPreguntado = false
    }
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (menuAbierto && !practicaActiva) {
        filaMenu = (filaMenu + 1) % NUM_FILAS_MENU
        mundoNuevoPreguntado = false
    }
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (cineTerminado && !tituloAbierto && !menuAbierto && !botonesBloqueados && controller.B.isPressed() &&
        (!practicaActiva || practicaPaso == 6)) {
        bUsado = true
        cambiarRanura(-1)
    } else if (menuAbierto && filaMenu == 0 && !practicaActiva) cambiarRanura(-1)
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (cineTerminado && !tituloAbierto && !menuAbierto && !botonesBloqueados && controller.B.isPressed() &&
        (!practicaActiva || practicaPaso == 6)) {
        bUsado = true
        cambiarRanura(1)
    } else if (menuAbierto && filaMenu == 0 && !practicaActiva) cambiarRanura(1)
})
function actualizarJuego() {
    let ahora = game.runtime()
    let transcurridoMs = Math.max(1, ahora - ultimaActualizacionMs)
    let duracionMs = Math.min(80, transcurridoMs)
    ultimaActualizacionMs = ahora
    if (!controller.A.isPressed() && !controller.B.isPressed()) botonesBloqueados = false
    if (volumenSinGuardar && !menuAbierto) {
        settings.writeNumber("#volume", music.volume())
        volumenSinGuardar = false
    }
    if (!cineTerminado) {
        cineActualizar(Math.min(250, transcurridoMs))
        tocarSonidoCine(cineCapitulo)
        if (cineTerminado) despuesDelCine()
        return
    }
    if (tituloAbierto || menuAbierto) return
    if (practicaActiva && (practicaPaso == 0 || practicaPaso == 8)) {
        actualizarPractica(duracionMs, 0, 0)
        return
    }
    let avance = (controller.up.isPressed() ? 1 : 0) - (controller.down.isPressed() ? 1 : 0)
    let sentidoGiro = (controller.right.isPressed() ? 1 : 0) - (controller.left.isPressed() ? 1 : 0)
    let sentidoMirada = 0
    if (practicaActiva && practicaPaso != 1 && practicaPaso != 3) avance = 0
    if (practicaActiva && practicaPaso != 2 && practicaPaso != 6) sentidoGiro = 0
    if (controller.B.isPressed()) {
        if (controller.up.isPressed() || controller.down.isPressed() || controller.left.isPressed() ||
            controller.right.isPressed() || controller.A.isPressed()) bUsado = true
        if (avance != 0 && (!practicaActiva || practicaPaso == 3)) {
            sentidoMirada = avance
            inclinacion = Math.max(-1.2, Math.min(1.2, inclinacion + avance * duracionMs * 0.0017))
            sinGuardar = true
        }
        avance = 0
        sentidoGiro = 0
    } else {
        if (practicaActiva && practicaPaso == 3) avance = 0
        giro = (giro + sentidoGiro * duracionMs * 0.0019 + 2 * Math.PI) % (2 * Math.PI)
    }
    let antesX = jugadorX
    let antesY = jugadorY
    let antesZ = jugadorZ
    moverJugador(avance, duracionMs)
    if (jugadorX != antesX || jugadorZ != antesZ) {
        ultimoPasoMs = ahora
        faseAndar += duracionMs * 0.014
    }
    if (jugadorX != antesX || jugadorY != antesY || jugadorZ != antesZ || sentidoGiro != 0) sinGuardar = true
    actualizarObjetivo()
    if (!botonesBloqueados && controller.A.isPressed() && !controller.B.isPressed() && hayObjetivo &&
        (!practicaActiva || practicaPaso == 4)) {
        if (extraccionX != objetivoX || extraccionY != objetivoY || extraccionZ != objetivoZ) extraccionMs = 0
        extraccionX = objetivoX
        extraccionY = objetivoY
        extraccionZ = objetivoZ
        extraccionMs += duracionMs
        let duracionExtraccionMs = bloqueObjetivo == Bloque.Piedra || bloqueObjetivo == Bloque.Cristal
            ? (tienePico ? 220 : 600) : 300
        if (extraccionMs >= duracionExtraccionMs) {
            let bloqueExtraido = bloqueObjetivo
            if (extraerBloque(objetivoX, objetivoY, objetivoZ)) {
                ultimoGolpeMs = ahora
                inicioAstillasMs = ahora
                colorAstillas = iconoFrente[bloqueExtraido]
                pedirImagenNueva()
                tocarSonido(bloqueExtraido == Bloque.Cristal ? 3 : 0)
                if (cristalesHallados == 5 && bloqueExtraido == Bloque.Cristal) avisar("¡5 cristales! ¡Ganaste!")
                comprobarAccionPractica(0)
            } else avisar(bloqueExtraido == Bloque.RocaBase ? "La roca base no se pica"
                : "Inventario lleno")
            extraccionMs = 0
            actualizarObjetivo()
        }
    } else extraccionMs = 0
    actualizarPractica(duracionMs, sentidoGiro, sentidoMirada)
    if (!practicaActiva && ahora - ultimaRevisionGuardadoMs >= 60000) {
        ultimaRevisionGuardadoMs = ahora
        if (sinGuardar) guardarPartida()
    }
}
function dibujarMundoMemorizado(lienzo: Image) {
    if (versionDibujada != versionEscena ||
        jugadorDibujadoX != jugadorX || jugadorDibujadoY != jugadorY || jugadorDibujadoZ != jugadorZ ||
        giroDibujado != giro || inclinacionDibujada != inclinacion || anchoRayoDibujado != anchoRayo) {
        dibujarMundo(imagenMundo)
        versionDibujada = versionEscena
        jugadorDibujadoX = jugadorX
        jugadorDibujadoY = jugadorY
        jugadorDibujadoZ = jugadorZ
        giroDibujado = giro
        inclinacionDibujada = inclinacion
        anchoRayoDibujado = anchoRayo
    }
    lienzo.drawImage(imagenMundo, 0, 0)
}
function dibujarHerramienta(lienzo: Image) {
    let transcurridoMs = game.runtime() - ultimoGolpeMs
    let golpe = transcurridoMs < 220 ? Math.sin(transcurridoMs * Math.PI / 220) : 0
    if (extraccionMs > 0) golpe = (1 + Math.sin(extraccionMs * 0.027)) / 2
    let andando = game.runtime() - ultimoPasoMs < 120
    let x = Math.round(141 - golpe * 13 + (andando ? Math.sin(faseAndar) * 2 : 0))
    let y = Math.round(97 - golpe * 9 + (andando ? Math.abs(Math.cos(faseAndar)) * 2 : 0))
    // Superficies anchas de varios colores dan volumen al antebrazo y a la herramienta, incluso en
    // una pantalla diminuta.
    for (let fila = 0; fila < 21; fila++) {
        let izquierda = x - 2 + Math.idiv(fila, 3)
        lienzo.fillRect(izquierda, y + fila - 5, 15, 1, fila < 11 ? 14 : 15)
        lienzo.fillRect(izquierda + 1, y + fila - 5, 10, 1, fila < 10 ? 3 : 8)
        if (fila < 9) lienzo.fillRect(izquierda + 1, y + fila - 5, 3, 1, 13)
        else if (fila > 11) lienzo.fillRect(izquierda + 2, y + fila - 5, 3, 1, 12)
    }
    lienzo.drawLine(x, y - 5, x + 8, y - 5, 1)
    lienzo.drawLine(x + 8, y - 2, x + 8, y + 3, 14)
    if (tienePico) {
        for (let i = 0; i < 5; i++) {
            lienzo.drawLine(x - 5 + i, y + 5, x + 5 + i, y - 22,
                i == 0 || i == 4 ? 15 : i == 1 ? 4 : 14)
        }
        for (let fila = 0; fila < 5; fila++) {
            lienzo.drawLine(x - 7, y - 24 + fila, x + 11, y - 20 + fila,
                fila == 0 ? 1 : fila < 3 ? 13 : 11)
        }
        lienzo.drawLine(x - 7, y - 24, x - 12, y - 17, 11)
        lienzo.drawLine(x - 6, y - 23, x - 11, y - 17, 13)
        lienzo.drawLine(x + 11, y - 20, x + 15, y - 12, 11)
        lienzo.drawLine(x + 12, y - 20, x + 16, y - 11, 12)
    }
}
function dibujarAstillas(lienzo: Image) {
    let transcurridoMs = game.runtime() - inicioAstillasMs
    if (transcurridoMs < 0 || transcurridoMs > 480) return
    // Diez astillas en trayectorias calculadas: ningún objeto por cada trocito en la memoria (el montón).
    for (let i = 0; i < 10; i++) {
        let tiempoAstilla = Math.max(0, transcurridoMs - i * 7) / 65
        let x = Math.round(80 + ((i * 7 % 11) - 5) * tiempoAstilla)
        let y = Math.round(60 - (3 + i % 4) * tiempoAstilla + tiempoAstilla * tiempoAstilla * 0.65)
        let tamano = transcurridoMs < 180 ? 3 : 2
        lienzo.fillRect(x, y, tamano, tamano, i % 3 == 0 ? 13 : colorAstillas)
        if (tamano == 3) lienzo.setPixel(x, y, 1)
    }
}
function dibujarIconoBloque(lienzo: Image, x: number, y: number, tipoBloque: number) {
    lienzo.drawLine(x + 4, y, x + 8, y + 2, iconoArriba[tipoBloque])
    lienzo.drawLine(x + 2, y + 1, x + 7, y + 3, iconoArriba[tipoBloque])
    lienzo.drawLine(x, y + 2, x + 4, y + 4, iconoArriba[tipoBloque])
    for (let i = 0; i < 5; i++) {
        lienzo.drawLine(x, y + 3 + i, x + 4, y + 5 + i, iconoFrente[tipoBloque])
        lienzo.drawLine(x + 5, y + 5 + i, x + 9, y + 3 + i, iconoLado[tipoBloque])
    }
    if (tipoBloque == Bloque.Madera) lienzo.drawLine(x + 2, y + 5, x + 2, y + 8, 12)
    if (tipoBloque == Bloque.Tablas) lienzo.drawLine(x, y + 6, x + 4, y + 8, 14)
    if (tipoBloque == Bloque.Cristal) lienzo.setPixel(x + 2, y + 5, 1)
}
function dibujarPanel(lienzo: Image) {
    lienzo.fillRect(0, 0, 160, 10, 15)
    lienzo.print(tienePico ? "PICO" : "MANO", 2, 1, tienePico ? 5 : 1, image.font8)
    lienzo.print("*" + cristalesHallados + "/5", 58, 1, 9, image.font8)
    lienzo.print("MENU", 134, 1, 1, image.font8)
    if (practicaActiva || tituloAbierto) {
        lienzo.fillRect(0, 112, 160, 10, 15)
        lienzo.print(nombresBloque[materiales[ranuraActual]] + " " + bolsa[materiales[ranuraActual]],
            2, 111, 5, image.font8)
        if (hayObjetivo) {
            lienzo.print(nombresBloque[bloqueObjetivo],
                160 - nombresBloque[bloqueObjetivo].length * 6, 111, 1, image.font8)
        }
    } else {
        // Se ven de un vistazo los seis materiales, con su cantidad.
        for (let i = 0; i < 6; i++) {
            let x = 20 + i * 20
            lienzo.fillRect(x, 100, 20, 20, 15)
            lienzo.drawRect(x, 100, 20, 20, i == ranuraActual ? 5 : 12)
            if (i == ranuraActual) lienzo.drawLine(x + 2, 101, x + 17, 101, 13)
            dibujarIconoBloque(lienzo, x + 5, 102, materiales[i])
            let cantidad = "" + bolsa[materiales[i]]
            lienzo.print(cantidad, x + 19 - cantidad.length * 6, 113, i == ranuraActual ? 5 : 13, image.font5)
        }
        let etiqueta = nombresBloque[materiales[ranuraActual]]
        lienzo.fillRect(78 - etiqueta.length * 3, 91, etiqueta.length * 6 + 4, 8, 15)
        lienzo.print(etiqueta, 80 - etiqueta.length * 3, 92, 1, image.font8)
    }
    lienzo.drawLine(75, 60, 85, 60, 15)
    lienzo.drawLine(80, 55, 80, 65, 15)
    let colorCruz = hayObjetivo ? 5 : 1
    lienzo.drawLine(76, 60, 78, 60, colorCruz)
    lienzo.drawLine(82, 60, 84, 60, colorCruz)
    lienzo.drawLine(80, 56, 80, 58, colorCruz)
    lienzo.drawLine(80, 62, 80, 64, colorCruz)
    if (extraccionMs > 0) {
        let duracionExtraccionMs = bloqueObjetivo == Bloque.Piedra || bloqueObjetivo == Bloque.Cristal
            ? (tienePico ? 220 : 600) : 300
        lienzo.fillRect(73, 68, Math.min(15, Math.idiv(extraccionMs * 15, duracionExtraccionMs)), 2, 5)
    }
    if (avisoHastaMs > game.runtime() && !menuAbierto && !practicaActiva) {
        lienzo.fillRect(0, 82, 160, 10, 15)
        lienzo.print(aviso, 2, 83, 5, image.font8)
    }
}
function dibujarMenu(lienzo: Image) {
    lienzo.fillRect(5, 9, 150, 101, 15)
    lienzo.drawRect(5, 9, 150, 101, 6)
    // Imagen en la pared: el Calliope Hacker en su escritorio, en un marco de madera.
    lienzo.drawRect(PARED_X - 1, PARED_Y - 1, hacker.IMAGEN_PARED.width + 2, hacker.IMAGEN_PARED.height + 2, 14)
    lienzo.drawImage(hacker.IMAGEN_PARED, PARED_X, PARED_Y)
    if (practicaActiva) {
        lienzo.print("TU PRIMER PICO", 15, 17, 7)
        lienzo.print("2 madera + 3 piedra", 20, 38, 1, image.font8)
        lienzo.print("Madera: " + bolsa[Bloque.Madera], 20, 51, 13, image.font8)
        lienzo.print("Piedra: " + bolsa[Bloque.Piedra], 20, 61, 13, image.font8)
        lienzo.fillRect(14, 77, 131, 13, 8)
        lienzo.print("B: FABRICAR PICO", 23, 81, 5, image.font8)
        lienzo.print("A: Atrás", 50, 98, 1, image.font8)
        return
    }
    lienzo.print("MESA Y PAUSA", 11, 14, 7)
    lienzo.print("Mad. " + bolsa[Bloque.Madera] +
        " Piedra " + bolsa[Bloque.Piedra], 11, 26, 13, image.font8)
    let filas = [
        "Bloque: " + nombresBloque[materiales[ranuraActual]],
        tienePico ? "Pico: listo" : "Pico: 2 mad.+3 piedra",
        "4 tablas: 1 madera",
        "Guardar partida",
        anchoRayo == 4 ? "Gráficos: normales"
            : anchoRayo == 8 ? "Gráficos: rápidos"
            : "Gráficos: finos (PC)",
        "Mirar al frente",
        "Volver al inicio",
        "Repetir práctica",
        "Ver introducción",
        sonidoActivo ? "Sonido: sí" : "Sonido: no",
        mundoNuevoPreguntado ? "¿Nuevo mundo? B = Sí" : "Nuevo mundo",
        "Volumen " + music.volume()
    ]
    let primera = Math.max(0, Math.min(NUM_FILAS_MENU - 6, filaMenu - 2))
    for (let i = 0; i < 6; i++) {
        let indice = primera + i
        // La fila elegida se muestra con la barra; sin “>”, cada fila cabe delante de la barra de desplazamiento.
        if (indice == filaMenu) lienzo.fillRect(9, 36 + i * 9, 142, 9, 8)
        lienzo.print(filas[indice], 11, 38 + i * 9, 1, image.font8)
    }
    lienzo.print(avisoHastaMs > game.runtime() ? aviso : "B: OK A/MENU: Atrás",
        10, 98, 5, image.font8)
    lienzo.fillRect(152, 36, 2, 54, 12)
    lienzo.fillRect(152, 36 + Math.idiv(filaMenu * 46, NUM_FILAS_MENU - 1), 2, 8, 9)
}
function imprimirCentrado(lienzo: Image, texto: string, y: number, tinta: number) {
    lienzo.print(texto, 80 - texto.length * 3, y, tinta, image.font8)
}
function dibujarTitulo(lienzo: Image) {
    lienzo.fillRect(7, 12, 146, 98, 15)
    lienzo.drawRect(7, 12, 146, 98, 6)
    // El título del juego tiene el mismo aspecto que en la película; se dibuja una sola vez en una imagen, y su tamaño
    // depende de la longitud del nombre.
    if (!logoTitulo) {
        logoTitulo = image.create(160, 30)
        cineDibujarLetras(logoTitulo, cineImagenTitulo, 2, cineEscalaTitulo(136), 100000, -10, true, -1)
    }
    lienzo.drawTransparentImage(logoTitulo, 0, 13)
    // El Calliope Hacker en su escritorio, delante de una pared del color hacker.COLOR_PARED.
    lienzo.fillRect(48, 39, hacker.IMAGEN_TITULO.width, hacker.IMAGEN_TITULO.height, hacker.COLOR_PARED)
    lienzo.drawTransparentImage(hacker.IMAGEN_TITULO, 48, 39)
    imprimirCentrado(lienzo,
        habiaProgreso ? "A: seguir aventura" : "A: tu aventura", 84, 5)
    imprimirCentrado(lienzo, "B: practicar", 96, 1)
}

habiaProgreso = decodificarProgreso(settings.readBuffer(CLAVE_PROGRESO))
if (!habiaProgreso) {
    anchoRayo = enDispositivo ? 8 : 2
    generarMundo()
}
// En el dispositivo, el juego siempre arranca en modo ahorro (gráficos rápidos), incluso con partidas más antiguas o
// importadas. “Normal” se puede elegir en el menú para la sesión en curso.
if (enDispositivo) anchoRayo = 8
actualizarObjetivo()
cinePreparar()
music.setVolume(settings.exists("#volume") ? settings.readNumber("#volume") : 90)
ultimaActualizacionMs = game.runtime()
ultimaRevisionGuardadoMs = ultimaActualizacionMs
game.onUpdate(actualizarJuego)
scene.createRenderable(0, function (lienzo: Image) {
    if (!cineTerminado) {
        dibujarCine(lienzo)
        return
    }
    dibujarMundoMemorizado(lienzo)
    if (!tituloAbierto && !menuAbierto) dibujarAstillas(lienzo)
    if (!tituloAbierto) dibujarHerramienta(lienzo)
    dibujarPanel(lienzo)
    if (tituloAbierto) dibujarTitulo(lienzo)
    if (menuAbierto) dibujarMenu(lienzo)
    if (practicaActiva) dibujarPractica(lienzo)
})
