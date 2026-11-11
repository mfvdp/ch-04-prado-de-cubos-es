// Los sonidos del juego: cortos, fabricados por el programa, sin archivos de audio y sin reproducción que bloquee (todo
// suena en segundo plano).
let sonidoActivo = true
let ultimoCapituloCine = -1
let sonidoExtraer = music.createSoundEffect(WaveShape.Noise, 600, 130, 70, 0, 75,
    SoundExpressionEffect.None, InterpolationCurve.Curve)
let sonidoPoner = music.createSoundEffect(WaveShape.Triangle, 330, 180, 80, 0, 100,
    SoundExpressionEffect.None, InterpolationCurve.Curve)
let sonidoExito = music.stringPlayable("C5 E5 G5 C6", 280)
let sonidoCristal = music.stringPlayable("E5 G5 B5 E6", 320)
function tocarSonido(claseSonido: number) {
    if (!sonidoActivo) return
    music.play(claseSonido == 0 ? sonidoExtraer
        : claseSonido == 1 ? sonidoPoner
        : claseSonido == 2 ? sonidoExito
        : sonidoCristal, music.PlaybackMode.InBackground)
}
function tocarSonidoCine(capitulo: number) {
    // Cada capítulo de la película (cineCapituloEnMomento) tiene su propio sonido al comenzar.
    if (capitulo == ultimoCapituloCine) return
    ultimoCapituloCine = capitulo
    if (!sonidoActivo) return
    if (capitulo == 0) {
        music.play(music.createSoundEffect(WaveShape.Sine, 65, 98, 45, 15, 4400,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        music.play(music.stringPlayable("C3 G3 D4 G4 E4 G4 D4 G3", 108), music.PlaybackMode.InBackground)
    }
    if (capitulo == 1) {
        music.play(music.createSoundEffect(WaveShape.Triangle, 130, 1046, 12, 85, 2200,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    }
    if (capitulo == 2) {
        music.play(music.createSoundEffect(WaveShape.Noise, 150, 2100, 12, 90, 2400,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        music.play(music.stringPlayable("C4 D4 E4 G4 C5 D5 E5 G5", 180), music.PlaybackMode.InBackground)
    }
    // La tarjeta “Calliope Hacker presenta” recibe una melodía de reconocimiento; el título (capítulo 4) toca las
    // mismas notas más despacio.
    if (capitulo == 3) {
        music.play(music.stringPlayable("C4 G4 C5 E5 G5 E5 D5 C5", 140), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(WaveShape.Triangle, 260, 65, 110, 0, 1200,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    }
    if (capitulo == 4) {
        music.play(music.createSoundEffect(WaveShape.Sawtooth, 120, 35, 115, 0, 1400,
            SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
        music.play(music.stringPlayable("C4 G4 C5 E5 G5 E5 D5 C5", 100), music.PlaybackMode.InBackground)
    }
    if (capitulo == 5) music.play(music.stringPlayable("E5 G5 C6", 220), music.PlaybackMode.InBackground)
}
