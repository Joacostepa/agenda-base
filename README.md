# 📝 Agenda Base v2.0

Una aplicación profesional para gestión de tareas desarrollada con tecnologías web modernas.

## ✨ Características

- **🎯 Gestión de tareas simple y efectiva**
- **👤 Soporte para usuarios invitados (LocalStorage)**
- **🔥 Autenticación con Google (Firebase opcional)**
- **📱 Interfaz responsive y moderna**
- **⚡ Arquitectura modular y escalable**
- **🎨 Diseño con Tailwind CSS**

## 🚀 Inicio rápido

### 1. Clonar o descargar el proyecto

```bash
git clone <url-del-repositorio>
cd "24_Agenda andamios"
```

### 2. Abrir con un servidor web

**Opción A: Python (recomendado)**
```bash
python -m http.server 8000
```

**Opción B: Node.js**
```bash
npx serve .
```

**Opción C: Live Server (VS Code)**
- Instalar extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

### 3. Abrir en el navegador

```
http://localhost:8000
```

### 4. ¡Listo para usar!

- **Modo invitado**: Click en "Entrar como invitado" para empezar inmediatamente
- **Google Sign-In**: Configurar Firebase para sincronización en la nube

## 🏗️ Arquitectura del proyecto

```
24_Agenda andamios/
├── index.html              # Vista principal de la aplicación
├── css/
│   ├── styles.css          # Estilos personalizados
│   └── tailwind.config.js  # Configuración de Tailwind CSS
├── js/
│   ├── main.js             # Aplicación principal (orquestador)
│   ├── modules/
│   │   ├── auth.js         # Gestión de autenticación
│   │   ├── tasks.js        # Lógica de negocio de tareas
│   │   ├── firebase.js     # Integración con Firebase
│   │   ├── localStore.js   # Almacenamiento local
│   │   └── ui.js           # Renderizado de interfaz
│   └── utils/
│       └── helpers.js      # Utilidades generales
└── README.md               # Este archivo
```

## 🔧 Configuración de Firebase (Opcional)

Para habilitar la autenticación con Google y sincronización en la nube:

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication → Google Sign-In
3. Habilitar Firestore Database
4. Obtener configuración del proyecto
5. Editar `js/modules/firebase.js`:

```javascript
export const FIREBASE_CONFIG = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};
```

## 📚 Estructura del código

### Módulos principales

#### `main.js` - Aplicación principal
- Orquesta todos los módulos
- Maneja la inicialización
- Configura event listeners globales
- Gestiona el flujo de la aplicación

#### `auth.js` - Autenticación
- Gestión de usuarios invitados y Firebase
- Manejo de sesiones
- Callbacks de cambios de estado

#### `tasks.js` - Gestión de tareas
- CRUD de tareas
- Integración con LocalStorage y Firestore
- Lógica de negocio centralizada

#### `firebase.js` - Integración Firebase
- Inicialización de Firebase
- Operaciones de Firestore
- Manejo de errores

#### `localStore.js` - Almacenamiento local
- Clase para LocalStorage
- Métodos CRUD optimizados
- Manejo de errores robusto

#### `ui.js` - Interfaz de usuario
- Renderizado de componentes
- Navegación entre vistas
- Manipulación del DOM

#### `helpers.js` - Utilidades
- Funciones helper comunes
- Selectores DOM simplificados
- Utilidades de formato y validación

## 🎨 Tecnologías utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos y animaciones
- **Tailwind CSS**: Framework de utilidades CSS
- **JavaScript ES6+**: Lógica de la aplicación
- **ES6 Modules**: Sistema de módulos nativo
- **LocalStorage API**: Almacenamiento local
- **Firebase**: Backend opcional (Auth + Firestore)

## 🔄 Flujo de la aplicación

1. **Inicialización**: Carga de módulos y configuración
2. **Autenticación**: Login como invitado o con Google
3. **Gestión de tareas**: CRUD completo de tareas
4. **Persistencia**: LocalStorage o Firestore según modo
5. **UI**: Renderizado reactivo de la interfaz

## 🚀 Próximas mejoras sugeridas

### Funcionalidades
- [ ] Sistema de proyectos y categorías
- [ ] Filtros avanzados y búsqueda
- [ ] Vencimientos y recordatorios
- [ ] Recurrencia de tareas
- [ ] Notificaciones push
- [ ] Modo offline mejorado

### Técnicas
- [ ] Tests unitarios (Jest/Vitest)
- [ ] PWA (Progressive Web App)
- [ ] Sincronización en tiempo real
- [ ] Optimización de performance
- [ ] Internacionalización (i18n)
- [ ] Temas personalizables

### Arquitectura
- [ ] State management (Redux/Zustand)
- [ ] Router para navegación
- [ ] Lazy loading de módulos
- [ ] Service Workers
- [ ] TypeScript migration

## 🐛 Solución de problemas

### Error: "Módulos ES6 no soportados"
- Asegúrate de usar un servidor web (no abrir directamente el archivo HTML)
- Verifica que el navegador soporte ES6 modules

### Firebase no funciona
- Verifica la configuración en `firebase.js`
- Revisa la consola del navegador para errores
- Confirma que el proyecto Firebase esté configurado correctamente

### LocalStorage no persiste
- Verifica que no estés en modo incógnito
- Confirma que el navegador soporte LocalStorage
- Revisa la consola para errores de permisos

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Tailwind CSS** por el increíble framework de utilidades
- **Firebase** por la infraestructura backend
- **Comunidad open source** por las herramientas y librerías

## 📞 Contacto

- **Proyecto**: [GitHub Repository](link-al-repo)
- **Issues**: [GitHub Issues](link-a-issues)
- **Discusiones**: [GitHub Discussions](link-a-discussions)

---

**Desarrollado con ❤️ usando tecnologías web modernas**

*Última actualización: Diciembre 2024*
