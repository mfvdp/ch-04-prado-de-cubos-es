// Los rayos de visión y la imagen del mundo en 3D de verdad.
// Para cada columna y cada fila de la imagen, un rayo atraviesa el mundo de un borde de bloque al siguiente (este
// método se llama DDA), solo con números enteros. No hay sprites, y un rayo no crea ningún objeto nuevo en la memoria.
let impactoX = 0
let impactoY = 0
let impactoZ = 0
let caraImpactoX = 0
let caraImpactoY = 0
let caraImpactoZ = 0
let bloqueImpacto = 0
let distanciaImpacto = 0
let miradaX = 0
let miradaY = 0
let miradaZ = 1024
let derechaX = 1024
let derechaZ = 0
let arribaX = 0
let arribaY = 1024
let arribaZ = 0
let hayObjetivo = false
let objetivoX = 0
let objetivoY = 0
let objetivoZ = 0
let lugarX = 0
let lugarY = 0
let lugarZ = 0
let bloqueObjetivo = 0
let coloresBase = [9, 14, 14, 11, 14, 7, 13, 9, 12]
let coloresOscuros = [9, 12, 12, 12, 12, 6, 14, 6, 15]
let coloresBruma = [9, 1, 4, 13, 13, 13, 11, 7, 11, 9, 11, 11, 11, 13, 11, 11]
// Siete máscaras de dibujo (de 16 por 16 píxeles cada una) van una junto a otra en UNA imagen de 4 bits por píxel: 896
// bytes en vez de muchas listas grandes. Cada máscara usa 0 para el tono base, 1 para un hueco y 2 para la luz. Se
// dibujan una sola vez, en la primera imagen del mundo (dibujarMundo).
let texturasBloque = image.create(112, 16)
let texturasListas = false
let giroVector = -10000
let inclinacionVector = -10000
let giroRayo = -10000
let inclinacionRayo = -10000
let anchoRayoPreparado = 0
let columnaX: number[] = []
let columnaZ: number[] = []
let filaX: number[] = []
let filaY: number[] = []
let filaZ: number[] = []

function calcularVectoresMirada() {
    // actualizarObjetivo y el dibujo usan los mismos vectores de mirada. A partir del giro (a izquierda o derecha) y de
    // la inclinación (hacia arriba o abajo) salen tres direcciones de longitud 1024: hacia dónde se mira, hacia la
    // derecha y hacia arriba. Mientras el giro y la inclinación no cambien, no se vuelven a calcular senos ni cosenos,
    // ni siquiera al andar en línea recta.
    if (giro == giroVector && inclinacion == inclinacionVector) return
    giroVector = giro
    inclinacionVector = inclinacion
    let senGiro = Math.sin(giro)
    let cosGiro = Math.cos(giro)
    let senInclinacion = Math.sin(inclinacion)
    let cosInclinacion = Math.cos(inclinacion)
    miradaX = Math.round(senGiro * cosInclinacion * 1024)
    miradaY = Math.round(senInclinacion * 1024)
    miradaZ = Math.round(cosGiro * cosInclinacion * 1024)
    derechaX = Math.round(cosGiro * 1024)
    derechaZ = Math.round(-senGiro * 1024)
    arribaX = Math.round(-senGiro * senInclinacion * 1024)
    arribaY = Math.round(cosInclinacion * 1024)
    arribaZ = Math.round(-cosGiro * senInclinacion * 1024)
}
// Unidades: la dirección está en 1024avos, el recorrido en 1024 por bloque y el punto de partida en 256 por bloque.
function seguirRayo(inicioX: number, inicioY: number, inicioZ: number,
    direccionX: number, direccionY: number, direccionZ: number, limite: number): boolean {
    bloqueImpacto = 0
    if (direccionX == 0 && direccionY == 0 && direccionZ == 0) return false
    let x = inicioX >> 8
    let y = inicioY >> 8
    let z = inicioZ >> 8
    let signoX = direccionX < 0 ? -1 : 1
    let signoY = direccionY < 0 ? -1 : 1
    let signoZ = direccionZ < 0 ? -1 : 1
    let indiceMundo = x + MUNDO_ANCHO * (z + MUNDO_ANCHO * y)
    let saltoIndiceY = MUNDO_ANCHO * MUNDO_ANCHO * signoY
    let saltoIndiceZ = MUNDO_ANCHO * signoZ
    let recorridoPorBloqueX = direccionX == 0 ? 1073741823 : Math.idiv(1048576, Math.abs(direccionX))
    let recorridoPorBloqueY = direccionY == 0 ? 1073741823 : Math.idiv(1048576, Math.abs(direccionY))
    let recorridoPorBloqueZ = direccionZ == 0 ? 1073741823 : Math.idiv(1048576, Math.abs(direccionZ))
    // Coma fija: si una dirección no es cero, el recorrido por bloque vale como máximo 1048576 (2 elevado a 20).
    // Multiplicado por 256, da como máximo 2 elevado a 28: todavía cabe en un entero. Basta con desplazar 8 bits a la
    // derecha (>> 8), en vez de hacer tres divisiones más.
    let siguienteX = direccionX == 0 ? 1073741823
        : ((direccionX < 0 ? inicioX & 255 : 256 - (inicioX & 255)) * recorridoPorBloqueX) >> 8
    let siguienteY = direccionY == 0 ? 1073741823
        : ((direccionY < 0 ? inicioY & 255 : 256 - (inicioY & 255)) * recorridoPorBloqueY) >> 8
    let siguienteZ = direccionZ == 0 ? 1073741823
        : ((direccionZ < 0 ? inicioZ & 255 : 256 - (inicioZ & 255)) * recorridoPorBloqueZ) >> 8
    let recorrido = 0
    let eje = 0
    for (let paso = 0; paso < 48; paso++) {
        if (siguienteX <= siguienteY && siguienteX <= siguienteZ) {
            recorrido = siguienteX
            siguienteX += recorridoPorBloqueX
            x += signoX
            indiceMundo += signoX
            eje = 0
        } else if (siguienteY <= siguienteZ) {
            recorrido = siguienteY
            siguienteY += recorridoPorBloqueY
            y += signoY
            indiceMundo += saltoIndiceY
            eje = 1
        } else {
            recorrido = siguienteZ
            siguienteZ += recorridoPorBloqueZ
            z += signoZ
            indiceMundo += saltoIndiceZ
            eje = 2
        }
        if (recorrido > limite || x < 0 || x >= MUNDO_ANCHO || z < 0 || z >= MUNDO_ANCHO || y < 0) return false
        // Un rayo por encima del mundo puede entrar en él si baja; si sube, ya se queda fuera para siempre.
        if (y >= MUNDO_ALTO) {
            if (direccionY >= 0) return false
            continue
        }
        let tipoBloque = mundo[indiceMundo]
        if (tipoBloque != 0) {
            impactoX = x
            impactoY = y
            impactoZ = z
            bloqueImpacto = tipoBloque
            distanciaImpacto = recorrido
            caraImpactoX = eje == 0 ? -signoX : 0
            caraImpactoY = eje == 1 ? -signoY : 0
            caraImpactoZ = eje == 2 ? -signoZ : 0
            return true
        }
    }
    return false
}
function actualizarObjetivo() {
    calcularVectoresMirada()
    hayObjetivo = seguirRayo(jugadorX, jugadorY + ALTURA_OJOS, jugadorZ, miradaX, miradaY, miradaZ, 4 * 1024)
    if (hayObjetivo) {
        objetivoX = impactoX
        objetivoY = impactoY
        objetivoZ = impactoZ
        bloqueObjetivo = bloqueImpacto
        lugarX = impactoX + caraImpactoX
        lugarY = impactoY + caraImpactoY
        lugarZ = impactoZ + caraImpactoZ
    } else bloqueObjetivo = 0
}
function crearTexturasBloque() {
    if (texturasListas) return
    texturasListas = true
    // Hierba: dos briznas diminutas. Sin manchas de color al azar en cada cara.
    texturasBloque.drawLine(3, 4, 4, 3, 1)
    texturasBloque.setPixel(4, 5, 1)
    texturasBloque.drawLine(11, 11, 12, 12, 1)
    // Tierra: algunas piedrecitas hundidas, sin un dibujo regular de cuadros.
    texturasBloque.drawLine(19, 5, 20, 5, 1)
    texturasBloque.setPixel(20, 4, 2)
    texturasBloque.drawLine(26, 11, 28, 11, 1)
    texturasBloque.setPixel(27, 10, 2)
    texturasBloque.setPixel(22, 14, 1)
    // Piedra: juntas cortas y dos bordes suaves de luz.
    texturasBloque.drawLine(35, 5, 39, 5, 1)
    texturasBloque.drawLine(38, 6, 40, 6, 1)
    texturasBloque.drawLine(42, 11, 45, 11, 1)
    texturasBloque.drawLine(35, 4, 38, 4, 2)
    texturasBloque.drawLine(43, 10, 45, 10, 2)
    // Corteza: vetas interrumpidas y desplazadas, sin rayas largas continuas.
    texturasBloque.fillRect(52, 3, 2, 3, 1)
    texturasBloque.drawLine(53, 6, 53, 8, 1)
    texturasBloque.fillRect(59, 10, 2, 3, 1)
    texturasBloque.drawLine(60, 2, 60, 4, 2)
    texturasBloque.drawLine(56, 11, 56, 13, 2)
    // Madera de testa (el corte del tronco, arriba y abajo): dos anillos cerrados alrededor de un pequeño corazón.
    texturasBloque.drawRect(66, 2, 12, 12, 1)
    texturasBloque.drawRect(69, 5, 6, 6, 1)
    texturasBloque.fillRect(71, 7, 2, 2, 2)
    // Tablas: juntas desplazadas de extremo a extremo y un poco de veta de madera.
    texturasBloque.drawLine(80, 7, 95, 7, 1)
    texturasBloque.drawLine(80, 15, 95, 15, 1)
    texturasBloque.drawLine(84, 0, 84, 6, 1)
    texturasBloque.drawLine(92, 8, 92, 14, 1)
    texturasBloque.drawLine(88, 3, 92, 3, 2)
    texturasBloque.drawLine(82, 11, 85, 11, 2)
    // Hojas: dos pequeños grupos de hojas sobre superficies verdes, grandes y tranquilas.
    texturasBloque.drawLine(99, 4, 102, 4, 2)
    texturasBloque.drawLine(100, 5, 101, 5, 2)
    texturasBloque.drawLine(106, 11, 109, 11, 1)
    texturasBloque.setPixel(107, 10, 1)
}

function colorDelImpacto(direccionX: number, direccionY: number, direccionZ: number): number {
    let puntoX = jugadorX + ((direccionX * distanciaImpacto) >> 12)
    let puntoY = jugadorY + ALTURA_OJOS + ((direccionY * distanciaImpacto) >> 12)
    let puntoZ = jugadorZ + ((direccionZ * distanciaImpacto) >> 12)
    let caraU = (caraImpactoX != 0 ? puntoZ : puntoX) & 255
    // Los dibujos verticales van de arriba abajo; las caras opuestas se invierten como en un espejo para que nada
    // parezca estar al revés.
    let caraV = caraImpactoY != 0 ? puntoZ & 255 : 255 - (puntoY & 255)
    if (caraImpactoY == 0 && (caraImpactoX > 0 || caraImpactoZ > 0)) caraU = 255 - caraU
    let tipoBloque = bloqueImpacto
    let ladoOscuro = caraImpactoY < 0 || caraImpactoX != 0 || caraImpactoZ > 0
    let numeroMascara = tipoBloque == Bloque.Hierba ? (caraImpactoY > 0 ? 0 : 1)
        : tipoBloque == Bloque.Tierra ? 1
        : tipoBloque == Bloque.Piedra || tipoBloque == Bloque.RocaBase ? 2
        : tipoBloque == Bloque.Madera ? (caraImpactoY != 0 ? 4 : 3)
        : tipoBloque == Bloque.Tablas ? 5
        : 6
    // Los detalles pequeños desaparecen a lo lejos, en vez de centellear con píxeles de todos los colores.
    let limiteDetalle = numeroMascara < 2 ? 3 * 1024 : 6 * 1024
    let texturaU = caraU >> 4
    let texturaV = caraV >> 4
    if (numeroMascara < 3 || numeroMascara == 6) {
        // La misma máscara pequeña se desplaza de otra forma en cada bloque (según su lugar en el mundo), para que no
        // se vea ninguna cuadrícula de manchas.
        texturaU = (texturaU + impactoX * 5 + impactoZ * 3) & 15
        texturaV = (texturaV + impactoX * 7 + impactoZ * 11 + impactoY * 3) & 15
    }
    let tono = distanciaImpacto < limiteDetalle ? texturasBloque.getPixel(numeroMascara * 16 + texturaU, texturaV) : 0
    if (distanciaImpacto > 4 * 1024 && tono == 2 && tipoBloque == Bloque.Piedra) tono = 0
    let tinta = coloresBase[tipoBloque]
    if (tipoBloque == Bloque.Hierba && caraImpactoY > 0) {
        tinta = tono == 1 ? 6 : 7
    } else if (tipoBloque == Bloque.Hierba || tipoBloque == Bloque.Tierra) {
        tinta = ladoOscuro ? 12 : 14
        if (tono == 1 && !ladoOscuro) tinta = 12
        // La hierba sigue el borde superior del bloque; la tierra de debajo se queda marrón.
        if (tipoBloque == Bloque.Hierba && caraImpactoY == 0 &&
            caraV < 35 + ((caraU >> 6) & 1) * 8) tinta = ladoOscuro ? 6 : 7
    } else if (tipoBloque == Bloque.Piedra) {
        tinta = caraImpactoY > 0 ? 13 : ladoOscuro ? 12 : 11
        if (tono == 1 && !ladoOscuro) tinta = caraImpactoY > 0 ? 11 : 12
        else if (tono == 2 && !ladoOscuro && caraImpactoY <= 0) tinta = 13
    } else if (tipoBloque == Bloque.Madera) {
        tinta = ladoOscuro ? 12 : 14
        if (caraImpactoY > 0) tinta = tono == 1 ? 14 : tono == 2 ? 13 : 4
        else if (!ladoOscuro && tono == 1) tinta = 12
        else if (!ladoOscuro && tono == 2) tinta = 4
    } else if (tipoBloque == Bloque.Tablas) {
        tinta = ladoOscuro ? 14 : 13
        if (tono == 1) tinta = ladoOscuro ? 12 : 14
        else if (tono == 2 && !ladoOscuro) tinta = 4
    } else if (tipoBloque == Bloque.Hojas) {
        tinta = caraImpactoY > 0 || !ladoOscuro ? 7 : 6
        if (tono == 1) tinta = 6
        else if (tono == 2 && !ladoOscuro) tinta = 7
    } else if (tipoBloque == Bloque.Cristal) {
        // Superficies grandes (facetas) de una sola pieza en vez de un centelleo al azar.
        tinta = ladoOscuro ? 8 : 9
        if (!ladoOscuro && caraU < 112 && caraV < 144 && caraU + caraV < 176) tinta = 1
        else if (caraU > 160 && caraV > 96) tinta = 8
    } else if (tipoBloque == Bloque.RocaBase) {
        tinta = tono == 1 || caraImpactoY < 0 ? 15 : 12
    }
    // Una sombra de contacto solo aparece junto a bloques que son de verdad más altos. Por eso una superficie plana de
    // hierba no tiene cuadrícula oscura. No hay rayos de luz ni de sombra adicionales.
    if (caraImpactoY > 0 && distanciaImpacto < 5 * 1024) {
        let vecinoMasAlto = false
        if (caraU < 20)
            vecinoMasAlto = bloqueEn(impactoX - 1, impactoY + 1, impactoZ) != Bloque.Aire
        else if (caraU > 235)
            vecinoMasAlto = bloqueEn(impactoX + 1, impactoY + 1, impactoZ) != Bloque.Aire
        if (!vecinoMasAlto && caraV < 20)
            vecinoMasAlto = bloqueEn(impactoX, impactoY + 1, impactoZ - 1) != Bloque.Aire
        else if (!vecinoMasAlto && caraV > 235)
            vecinoMasAlto = bloqueEn(impactoX, impactoY + 1, impactoZ + 1) != Bloque.Aire
        if (vecinoMasAlto) tinta = tipoBloque == Bloque.Hierba || tipoBloque == Bloque.Hojas ? 6
            : tipoBloque == Bloque.Piedra ? 11
            : coloresOscuros[tipoBloque]
    }
    // A lo lejos, la piedra pierde contraste. Las hojas siguen verdes; la madera casi no cambia: solo su color naranja
    // pasa a beis claro. Los árboles enteros no deben parecer pilares de piedra gris.
    if (distanciaImpacto > 6 * 1024) {
        if (tipoBloque == Bloque.Piedra || tipoBloque == Bloque.RocaBase) tinta = coloresBruma[tinta]
        else if (tipoBloque == Bloque.Madera && tinta == 4) tinta = 13
    }
    // El contorno del objetivo se dibuja encima de los dibujos y de las sombras; no hay un borde permanente alrededor
    // de todos los bloques.
    if (hayObjetivo && impactoX == objetivoX && impactoY == objetivoY && impactoZ == objetivoZ &&
        (caraU < 16 || caraU > 239 || caraV < 16 || caraV > 239)) tinta = 5
    return tinta
}

function prepararRayos() {
    if (giroRayo == giro && inclinacionRayo == inclinacion && anchoRayoPreparado == anchoRayo) return
    giroRayo = giro
    inclinacionRayo = inclinacion
    anchoRayoPreparado = anchoRayo
    // Como máximo 316 números con un ancho de rayo de 2 (80 columnas por 2, más 52 filas por 3); no se crea ninguna
    // lista nueva por imagen ni por rayo.
    for (let columna = 0, x = 0; x < 160; columna++, x += anchoRayo) {
        let desplazamientoColumna = Math.idiv((x + anchoRayo / 2 - 80) * 1024, 110)
        columnaX[columna] = (derechaX * desplazamientoColumna) >> 10
        columnaZ[columna] = (derechaZ * desplazamientoColumna) >> 10
    }
    for (let fila = 0, y = 8; y < 112; fila++, y += anchoRayo) {
        let desplazamientoFila = Math.idiv((60 - y - anchoRayo / 2) * 1024, 110)
        filaX[fila] = miradaX + ((arribaX * desplazamientoFila) >> 10)
        filaY[fila] = miradaY + ((arribaY * desplazamientoFila) >> 10)
        filaZ[fila] = miradaZ + ((arribaZ * desplazamientoFila) >> 10)
    }
}

// El sol y las nubes están fijos en el mundo: su posición sigue la perspectiva, y en las nubes también su tamaño. El
// sol siempre tiene el mismo tamaño.
function dibujarObjetoCielo(lienzo: Image, x: number, y: number, z: number, esSol: boolean) {
    let profundidad = (x * miradaX + y * miradaY + z * miradaZ) >> 10
    if (profundidad < 160) return
    let pantallaX = 80 + Math.idiv(((x * derechaX + z * derechaZ) >> 10) * 110, profundidad)
    let pantallaY = 60 - Math.idiv(((x * arribaX + y * arribaY + z * arribaZ) >> 10) * 110, profundidad)
    if (pantallaX < -40 || pantallaX > 200 || pantallaY < -20 || pantallaY > 135) return
    if (esSol) {
        lienzo.fillRect(pantallaX - 7, pantallaY - 5, 14, 10, 1)
        lienzo.fillRect(pantallaX - 5, pantallaY - 7, 10, 14, 1)
        lienzo.fillRect(pantallaX - 5, pantallaY - 5, 10, 10, 5)
        lienzo.fillRect(pantallaX - 3, pantallaY - 4, 5, 2, 1)
    } else {
        let mitadAncho = Math.max(6, Math.min(30, Math.idiv(20000, profundidad)))
        let alturaEscalon = Math.max(2, mitadAncho >> 2)
        lienzo.fillRect(pantallaX - mitadAncho, pantallaY, mitadAncho * 2, alturaEscalon, 13)
        lienzo.fillRect(pantallaX - mitadAncho + 2, pantallaY - alturaEscalon, mitadAncho * 2 - 4, alturaEscalon + 1, 1)
        lienzo.fillRect(pantallaX - (mitadAncho >> 1), pantallaY - alturaEscalon * 2, mitadAncho, alturaEscalon + 1, 1)
    }
}

function dibujarMundo(lienzo: Image) {
    calcularVectoresMirada()
    prepararRayos()
    crearTexturasBloque()
    lienzo.fill(9)
    // Unas pocas bandas anchas de cielo en vez de una línea de horizonte dura. filaY es la parte hacia arriba de la
    // dirección de los rayos de esa fila: el horizonte sube y baja cuando la mirada se inclina.
    for (let fila = 0, y = 8; y < 112; fila++, y += anchoRayo) {
        let pendiente = filaY[fila]
        if (pendiente < -95) lienzo.fillRect(0, y, 160, anchoRayo, 6)
        else if (pendiente < -35) lienzo.fillRect(0, y, 160, anchoRayo, 11)
        else if (pendiente < 0) lienzo.fillRect(0, y, 160, anchoRayo, 13)
        else if (pendiente < 25) lienzo.fillRect(0, y, 160, anchoRayo, 1)
    }
    dibujarObjetoCielo(lienzo, 530, 570, 1024, true)
    dibujarObjetoCielo(lienzo, -650, 420, 1600, false)
    dibujarObjetoCielo(lienzo, 1100, 350, 1700, false)
    dibujarObjetoCielo(lienzo, 1600, 470, -1050, false)
    dibujarObjetoCielo(lienzo, -900, 560, -1800, false)
    let ojoY = jugadorY + ALTURA_OJOS
    // 40 x 26 rayos con un ancho de rayo de 4 (20 x 13 con 8, rápido; 80 x 52 con 2, fino). El cielo no necesita otra
    // llamada de dibujo, porque ya está dibujado de antemano.
    for (let fila = 0, y = 8; y < 112; fila++, y += anchoRayo) {
        let direccionFilaX = filaX[fila]
        let direccionFilaY = filaY[fila]
        let direccionFilaZ = filaZ[fila]
        for (let columna = 0, x = 0; x < 160; columna++, x += anchoRayo) {
            let direccionX = direccionFilaX + columnaX[columna]
            let direccionZ = direccionFilaZ + columnaZ[columna]
            if (seguirRayo(jugadorX, ojoY, jugadorZ, direccionX, direccionFilaY, direccionZ, 8 * 1024)) {
                lienzo.fillRect(x, y, anchoRayo, anchoRayo, colorDelImpacto(direccionX, direccionFilaY, direccionZ))
            }
        }
    }
}
