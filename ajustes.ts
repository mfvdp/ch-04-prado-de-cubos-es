// Ajustes para el espacio de la partida guardada en la memoria flash del Calliope.
// La partida se guarda en un pequeño sistema de archivos llamado RAFFS. Este reparte el espacio reservado en dos
// mitades: para guardar, la partida antigua Y la nueva (3522 bytes cada una), con los datos de gestión, tienen que
// caber en una mitad. PXT, la herramienta de construcción de MakeCode, también resta esa reserva del espacio del
// programa. MakeCode impone el nombre SETTINGS_SIZE: no se debe cambiar.
namespace userconfig {
    export const SETTINGS_SIZE = 16 * 1024
}

const enDispositivo = control.deviceDalVersion() != "sim"
