# Prado de cubos

¡Hola! Esto es **Prado de cubos**, un juego de **Calliope Hacker** para el **Calliope mini 3 con GameKit**.

Miras un pequeño mundo hecho de bloques: hierba, tierra, piedra, árboles y, muy abajo, una cueva con cristales.
Camina, extrae bloques, ponlos en otro sitio y fabrica en la mesa de trabajo tablas y un pico. Tu meta: encontrar
5 cristales. Al principio, una breve práctica te enseña todo paso a paso. El Calliope Hacker está sentado en su
escritorio en la imagen colgada en la pared de la mesa de trabajo.

## Cómo se juega

- **Cruceta arriba y abajo:** avanzar y retroceder
- **Cruceta izquierda y derecha:** girar
- **Mantener B y pulsar arriba o abajo:** mirar hacia arriba o hacia abajo
- **Mantener A:** extraer el bloque que señala la mira
- **Pulsación corta de A:** saltar
- **Pulsación corta de B durante el salto:** poner un bloque bajo tus pies, así sales de cualquier hoyo
- **Pulsación corta de B:** poner un bloque de tu bolsa
- **Mantener B y pulsar izquierda o derecha:** elegir otro material
- **MENU:** mesa de trabajo para fabricar, guardar la partida, volver al inicio y más cosas (B confirma la fila elegida,
  A cierra)

## Cámbialo tú

Todo el código del juego está dentro de este archivo del juego. Ábrelo en MakeCode Arcade (arcade.makecode.com,
«Importar»). Cambia un número, arranca el simulador y mira qué pasa:

- **Caminar más deprisa:** en `mundo.ts`, en la función `moverJugador`, está `Math.idiv(avance * duracionMs * 7, 10)`.
  Con `14` en lugar de `7`, el jugador corre el doble de deprisa.
- **Más tierra al empezar:** en `mundo.ts`, en la función `generarMundo`, está `bolsa = [0, 0, 24, 16, 8, 0, 12, 0, 0]`.
  El 24 es la tierra con la que empiezas; prueba con 99. Vale para cada mundo nuevo (mesa de trabajo, «Nuevo mundo»).
- **Extraer más deprisa:** en `main.ts` está `? (tienePico ? 220 : 600) : 300` en dos sitios: en la función
  `actualizarJuego` (decide cuándo se rompe el bloque) y en `dibujarPanel` (dibuja la barrita de progreso). El 300 son
  los milisegundos que se tarda en extraer un bloque que no es piedra ni cristal (tierra, madera…). Prueba con 100 en
  los dos sitios.

La explicación del código para niños, familias y docentes está en calliope-hacker.de.
