# CIMET Control de Calidad · Guía de publicación

La app tiene tres partes:
- **Archivos de la app** (esta carpeta): se publican gratis en GitHub Pages y quedan en una dirección web.
- **Firebase**: guarda los datos en la nube y maneja los usuarios. Plan gratuito (Spark).
- **Celulares**: abren la dirección y la instalan con ícono en la pantalla de inicio.

Mientras `firebase-config.js` no tenga los datos de Firebase, la app abre en modo demostración: no pide usuario y guarda solo en ese celular.

---

## 1. Crear el proyecto en Firebase (unos 15 minutos)

1. Entra a https://console.firebase.google.com con la cuenta de Google de la empresa.
2. **Crear un proyecto** → nombre `cimet-calidad` → puedes desactivar Google Analytics → Crear.
3. Menú izquierdo **Compilación → Firestore Database → Crear base de datos**.
   - Ubicación: `southamerica-east1 (São Paulo)` o `us-east1`. No se puede cambiar después.
   - Modo: **producción**.
4. En Firestore, pestaña **Reglas**: borra lo que hay, pega el contenido del archivo `firestore.rules` y toca **Publicar**.
5. Menú **Compilación → Authentication → Comenzar** → en Métodos de acceso habilita **Correo electrónico/contraseña**.
6. Pestaña **Usuarios → Agregar usuario**: crea un usuario por cada supervisor (correo y contraseña). Así controlas quién entra.
7. Engranaje ⚙ → **Configuración del proyecto → General → Tus apps** → ícono web `</>` → nombre `CIMET Calidad` → Registrar (no marques Hosting).
8. Firebase muestra un bloque `firebaseConfig`. Copia esos valores dentro de `firebase-config.js`, reemplazando `PEGAR_AQUI` y las comillas vacías.

## 2. Publicar la app en GitHub Pages

1. Crea una cuenta en https://github.com (si no tienes).
2. **New repository** → nombre `cimet-calidad` → Public → Create.
   El código queda visible, pero los datos no: sin usuario no se puede leer ni escribir nada en la base de datos.
3. En el repositorio: **Add file → Upload files** → arrastra todos los archivos de esta carpeta, incluida la carpeta `icons` → **Commit changes**.
4. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` y carpeta `/ (root)` → Save.
5. En uno o dos minutos la app queda en `https://TU-USUARIO.github.io/cimet-calidad/`.
6. Vuelve a Firebase → **Authentication → Configuración → Dominios autorizados → Agregar dominio** → `TU-USUARIO.github.io`.

## 3. Instalar en los celulares

- **Android (Chrome)**: abre la dirección, entra con el usuario y toca **Instalar** en el aviso de la app (o menú ⋮ → Instalar aplicación).
- **iPhone (Safari)**: abre la dirección → botón Compartir → **Agregar a inicio**.

La primera vez se necesita internet para entrar. Después, si se va la señal en planta, la app sigue funcionando: guarda en el celular y envía los datos cuando vuelve la conexión. Abajo a la izquierda se ve el estado: *Sincronizado*, *Enviando…* o *Sin señal · guardado en el celular*.

## 4. Cómo se guardan los datos

Cada turno es un registro en la colección `turnos`, con nombre `FECHA_TURNO` (por ejemplo `2026-10-23_T1`). Varios supervisores pueden llenar el mismo turno al tiempo: cada valor se guarda por separado y todos ven los cambios en vivo.

## 5. Publicar cambios

Sube los archivos modificados al repositorio (Add file → Upload files). Si cambias algo, sube también el número de `VERSION` en `sw.js` (por ejemplo `cimet-calidad-v2`) para que los celulares descarguen la versión nueva.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Pantallas de la app |
| `app.js` | Lógica, parámetros y límites de calidad |
| `firebase-config.js` | Datos de conexión a Firebase |
| `firestore.rules` | Reglas de seguridad de la base de datos |
| `manifest.webmanifest`, `icons/` | Nombre e ícono al instalar |
| `sw.js` | Funcionamiento sin señal |
