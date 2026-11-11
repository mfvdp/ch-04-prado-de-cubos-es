# Parte técnica: Prado de cubos

Aquí se cuenta en pocas palabras cómo está hecho el código y cómo se construye. El saludo y las primeras ideas para
modificarlo están en `README.md`.

## Organización

Es un proyecto para MakeCode Arcade, escrito en TypeScript. `pxt.json` da el nombre del proyecto `prado-de-cubos` y
todos los archivos en el orden en que MakeCode los lee. `mkc.json` dice para qué aparato se construye: el Calliope mini
3 con GameKit (variante «n3»).

Los archivos del juego:

- `ajustes.ts`: Ajustes para el espacio de la partida guardada en la memoria flash del Calliope.
- `mundo.ts`: El mundo y sus reglas: los bloques, los movimientos del jugador, extraer, poner, fabricar y guardar la
  partida.
- `rayos.ts`: Los rayos de visión y la imagen del mundo en 3D de verdad.
- `cine.ts`: La intro con la tarjeta del estudio y el título.
- `sonido.ts`: Los sonidos del juego: cortos, fabricados por el programa, sin archivos de audio y sin reproducción que
  bloquee (todo suena en segundo plano).
- `practica.ts`: La práctica en siete pasos en un terreno aparte.
- `hacker.ts`: Las imágenes del Calliope Hacker, en los colores de la paleta de este juego.
- `main.ts`: Arranque, controles, mesa de trabajo y pantalla.

## Cómo funciona el juego

1. `decodificarProgreso` carga la partida guardada desde `settings`. Si no hay ninguna o está dañada, `generarMundo`
   crea un mundo nuevo.
2. `cinePreparar` construye el decorado de la intro. La intro vuela entre islas flotantes y a través de una puerta, y
   después muestra la tarjeta del estudio y el título. A salta a la estación siguiente, MENU se salta todo.
3. Después de la intro viene la práctica (`iniciarPractica`), mientras todavía no se haya superado. Después, cada
   arranque muestra la pantalla del título.
4. `actualizarJuego` corre en cada actualización: girar y andar (`moverJugador`), buscar el bloque señalado
   (`actualizarObjetivo`), extraer, poner, práctica.
5. La función de `scene.createRenderable` dibuja cada imagen: la intro, o el mundo (`dibujarMundoMemorizado`), la
   herramienta, el panel (`dibujarPanel`), la pantalla del título, el menú de la mesa de trabajo y los textos de la
   práctica.

El mundo mide 24 × 24 bloques en el suelo y 12 bloques de alto. Cada bloque es un número en `mundo`; qué número es qué
bloque se ve en la enumeración `Bloque`. Para dibujar el mundo, `dibujarMundo` lanza un rayo desde el ojo a través de
cada cuadradito de la pantalla (`seguirRayo`) y colorea el cuadradito como el bloque alcanzado (`colorDelImpacto`).

## Construir el juego

- **En el navegador:** abre arcade.makecode.com, elige «Importar» y abre el archivo del juego `prado-de-cubos.hex`. En
  ese archivo está todo el código. El simulador muestra el juego enseguida.
- **En el ordenador:** con la herramienta de línea de órdenes de MakeCode (paquete npm `makecode`) escribe en esta
  carpeta `makecode build`. El archivo del juego para el aparato queda después en `built/n3/binary.hex`.

## En el aparato

Conecta el Calliope mini 3 con el cable USB al ordenador. Aparece como una unidad. Arrastra el archivo del juego
(`.hex`) a esa unidad; después el juego arranca solo. La pantalla del GameKit tiene 160 × 120 píxeles y 16 colores. El
juego guarda desde el menú de la mesa de trabajo («Guardar partida») y más o menos una vez por minuto por sí solo, si
algo ha cambiado. Si cargas otro programa en el aparato, MakeCode puede borrar la partida guardada.

Este juego existe también en alemán, inglés y francés. Las cuatro versiones nacen del mismo proyecto de partida.
