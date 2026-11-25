# Reserva de espacios de Educación Física

Aplicación web para móvil donde los profesores de EF reservan pistas y espacios, y todos ven en tiempo real quién ha reservado qué.

## Espacios
Tatami 1, Tatami 2, Gimnasio, Pista exterior, Soportales (ping-pong), Pabellón (completo o mitad A / mitad B), Pádel 1, Pádel 2 y Campo de fútbol.

## Puesta en marcha (sin programar)

### Paso 1. Publicar la web con GitHub Pages
1. En este repositorio, ve a **Settings → Pages**.
2. En *Branch* elige `main` y carpeta `/ (root)`. Pulsa **Save**.
3. Tras 1-2 minutos tendrás una dirección tipo `https://snowind41.github.io/reserva-espacios-ef/`.

### Paso 2. Crear la base de datos en Firebase (gratis)
1. Entra en https://console.firebase.google.com con tu cuenta de Google.
2. **Crear proyecto** (ponle un nombre, desactiva Analytics).
3. En el menú, **Compilación → Realtime Database → Crear base de datos**. Elige Europa y *modo de prueba*.
4. En **Configuración del proyecto (rueda dentada) → Tus apps → icono `</>` (Web)**, registra la app y copia el bloque `firebaseConfig`.
5. En este repositorio, abre `config.js`, pulsa el lápiz ✏️ y pega tus valores. Guarda con **Commit changes**.

### Paso 3. Usarla en el móvil
1. Abre la dirección de GitHub Pages en el móvil.
2. Menú del navegador → **Añadir a pantalla de inicio**.
3. Comparte el enlace con tus compañeros.

## Seguridad
El *modo de prueba* de Firebase caduca a los 30 días. Para mantenerlo, en Realtime Database → **Reglas**, pon:

```json
{
  "rules": {
    "reservas": {
      ".read": true,
      ".write": true
    }
  }
}
```

Cualquiera con el enlace puede reservar, así que compártelo solo con el profesorado.

## Cómo funciona el pabellón
Si reservas el pabellón completo, las dos mitades se bloquean. Si reservas una mitad, el pabellón completo se bloquea, pero la otra mitad sigue libre.
