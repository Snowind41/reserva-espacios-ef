# Espacios EF · Reserva de espacios

Una web móvil para que el equipo de Educación Física pueda consultar pistas y reservar clases con una agenda clara. Con Firebase conectado, los cambios se sincronizan y se muestran en tiempo real.

**Web publicada:** https://snowind41.github.io/reserva-espacios-ef/

## Espacios disponibles

Tatami 1 y 2, Gimnasio (zona piscina Bizola), Pista exterior polideportiva, Soportales (ping-pong), Pabellón completo y mitades A y B, Pádel 1 y 2 y Campo de fútbol.

La agenda va de **09:00 a 17:00**. ESO y Bachillerato tienen franjas de **55 minutos**; Primaria, de **60 minutos**. Elige una hora libre para reservar. Cada reserva muestra el nombre y grupo; solo quien la hizo puede anularla. El nombre queda guardado en el dispositivo.

## Empezar a usarla

### 1. Publicar con GitHub Pages

1. Abre este repositorio en GitHub y entra en **Settings → Pages**.
2. En «Build and deployment», selecciona **Deploy from a branch**.
3. Elige la rama **main** y la carpeta **/(root)**; pulsa **Save**.
4. Espera a que se publique. La dirección es https://snowind41.github.io/reserva-espacios-ef/.

### 2. Conectar Firebase para compartir reservas

Sin configurar Firebase, la web funciona en **modo de demostración**: las reservas se guardan únicamente en el navegador y dispositivo actual. Para compartir reservas entre compañeros:

1. Entra en [Firebase Console](https://console.firebase.google.com/) con una cuenta de Google y crea un proyecto.
2. Ve a **Compilación → Realtime Database → Crear base de datos** y elige la región que corresponda.
3. En **Configuración del proyecto → General → Tus apps**, crea o selecciona una app web (`</>`). Copia los datos de configuración que muestra Firebase.
4. En este repositorio, abre `config.js` y pulsa el lápiz para editarlo. Sustituye cada valor `PEGA_AQUI...` por el correspondiente. En particular, copia la URL de Realtime Database completa (por ejemplo, `https://NOMBRE-DEFAULT-RIDB.europe-west1.firebasedatabase.app`).
5. Guarda con **Commit changes** y vuelve a abrir la web. La banda de demostración desaparecerá cuando Firebase conecte correctamente.

La aplicación conserva el formato habitual del objeto `firebaseConfig` y acepta las configuraciones existentes que incluyan `apiKey`, `authDomain`, `projectId`, `appId` y `databaseURL`. No reemplaces valores reales con marcadores de posición.

### 3. Añadir al móvil

Abre el enlace en el navegador del móvil y usa su menú **Añadir a pantalla de inicio**. Comparte el enlace con el equipo y pide a cada persona que pulse su nombre y se identifique una vez.

## Reglas recomendadas para la base de datos

En **Realtime Database → Reglas**, adapta y publica las reglas. Ejemplo básico de lectura compartida y escritura de reservas:

```json
{
  "rules": {
    "reservas": {
      ".read": true,
      ".write": true,
      "$reserva": {
        ".validate": "newData.hasChildren(['fecha', 'espacio', 'inicio', 'fin', 'profesor', 'grupo', 'creada'])"
      }
    }
  }
}
```

Estas reglas abiertas permiten leer y escribir todas las reservas sin autenticación. La escritura en el nodo `reservas` es necesaria para que la aplicación compruebe de forma atómica que el pabellón y sus mitades no se reserven simultáneamente. **No proporcionan identificación segura ni restringen por profesor.** Para datos sensibles o acceso restringido, configura Firebase Authentication y adapta las reglas al nuevo diseño antes de publicar el enlace. No publiques claves privadas.

## Pabellón completo y mitades

Reservar el pabellón completo bloquea las mitades A y B en esa hora. Reservar A o B bloquea el pabellón completo, pero permite usar la otra mitad. Las reservas ocupadas o bloqueadas no se pueden seleccionar.

## Notificaciones y datos

Con Firebase activo se muestra un aviso cuando un compañero crea una reserva. En modo demostración no hay sincronización ni avisos entre dispositivos. Las reservas se escriben en `reservas`, con los campos `fecha`, `espacio`, `inicio`, `fin`, `profesor`, `grupo` y `creada`; el identificador conserva el formato `fecha_espacio_inicio`.
