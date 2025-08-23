# Configuración de Firebase para Agenda Base

## Problema Actual
La aplicación está experimentando errores de permisos en Firestore:
- "Missing or insufficient permissions"
- Error 400 en la API de Firestore

## Solución: Configurar Reglas de Seguridad

### 1. Acceder a la Consola de Firebase
1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `agenda-andamios`

### 2. Configurar Reglas de Firestore
1. En el menú lateral, ve a **Firestore Database**
2. Haz clic en la pestaña **Rules**
3. Reemplaza las reglas existentes con las siguientes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir listar usuarios (solo lectura)
    match /users/{document=**} {
      allow list: if request.auth != null;
    }
    
    // Reglas para la colección de tareas
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }
    
    // Permitir listar tareas del usuario autenticado
    match /users/{document=**} {
      allow list: if request.auth != null;
    }
    
    // Reglas para otras colecciones (si las hay)
    match /{document=**} {
      allow read, write: if false; // Denegar acceso por defecto
    }
  }
}
```

4. Haz clic en **Publish**

### 3. Verificar Autenticación
1. En el menú lateral, ve a **Authentication**
2. Asegúrate de que **Google** esté habilitado como proveedor
3. Verifica que el dominio de tu aplicación esté en la lista de dominios autorizados

### 4. Configurar Dominios Autorizados
1. En **Authentication** > **Settings** > **Authorized domains**
2. Agrega tu dominio: `agenda-base.netlify.app`

### 5. Verificar Configuración del Proyecto
1. En **Project Settings** > **General**
2. Verifica que la configuración en `js/modules/firebase.js` coincida con tu proyecto

## Archivos Creados
- `firestore.rules` - Reglas de seguridad para Firestore
- `firebase.json` - Configuración de despliegue
- `firestore.indexes.json` - Índices para consultas eficientes

## Después de la Configuración
1. Recarga la aplicación
2. Intenta iniciar sesión con Google
3. Los errores de permisos deberían estar resueltos

## Notas Importantes
- Las reglas solo permiten acceso a usuarios autenticados
- Los usuarios solo pueden acceder a sus propios datos
- Las reglas son seguras y siguen el principio de menor privilegio
