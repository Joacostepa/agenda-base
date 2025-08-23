// Archivo principal de la aplicación - Agenda Base

import { tryInitFirebase } from './modules/firebase.js';
import { 
  setCurrentUser, 
  onAuthStateChanged, 
  handleGoogleSignIn, 
  handleSignOut, 
  enterAsGuest 
} from './modules/auth.js';
import { 
  loadTasks, 
  addTask, 
  toggleTask, 
  removeTask, 
  onTasksChange 
} from './modules/tasks.js';
import { 
  initUI, 
  renderNavUser, 
  renderTasks, 
  showLogin, 
  showApp, 
  clearTaskInput,
  getTaskInputValue,
  setLoadingState,
  updatePageTitle,
  renderWelcomeMessage
} from './modules/ui.js';
import { $ } from './utils/helpers.js';

/**
 * Clase principal de la aplicación
 */
class AgendaApp {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    try {
      console.log('🚀 Inicializando Agenda Base...');
      
      // Inicializar Firebase
      await this.initFirebase();
      
      // Inicializar UI
      initUI();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Configurar listeners de estado
      this.setupStateListeners();
      
      // Inicializar autenticación
      await this.initAuth();
      
      this.isInitialized = true;
      console.log('✅ Agenda Base inicializada correctamente');
      
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      this.showError('Error al inicializar la aplicación');
    }
  }

  /**
   * Inicializa Firebase
   */
  async initFirebase() {
    try {
      const firebase = await tryInitFirebase();
      if (firebase) {
        console.log('🔥 Firebase inicializado');
      } else {
        console.log('📱 Usando modo invitado (LocalStorage)');
      }
    } catch (error) {
      console.warn('⚠️ Firebase no disponible:', error);
    }
  }

  /**
   * Configura los event listeners de la aplicación
   */
  setupEventListeners() {
    // Botones de autenticación
    $('#btn-google')?.addEventListener('click', this.handleGoogleSignIn.bind(this));
    $('#btn-guest')?.addEventListener('click', this.handleGuestLogin.bind(this));
    
    // Formulario de tareas
    $('#btn-add-task')?.addEventListener('click', this.handleAddTask.bind(this));
    $('#task-title')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleAddTask();
      }
    });

    // Eventos personalizados
    window.addEventListener('user-logout', this.handleUserLogout.bind(this));
    window.addEventListener('task-toggle', (e) => this.handleTaskToggle(e.detail.taskId));
    window.addEventListener('task-delete', (e) => this.handleTaskDelete(e.detail.taskId));
  }

  /**
   * Configura los listeners de cambios de estado
   */
  setupStateListeners() {
    // Listener de cambios de autenticación
    onAuthStateChanged((user) => {
      if (user) {
        this.handleUserLogin(user);
      } else {
        this.handleUserLogout();
      }
    });

    // Listener de cambios en las tareas
    onTasksChange((tasks) => {
      renderTasks();
      this.updateTaskCount(tasks.length);
    });
  }

  /**
   * Inicializa la autenticación
   */
  async initAuth() {
    // Si Firebase está disponible, configurar el listener de estado
    // Si no, mostrar la vista de login
    if (window.Firebase) {
      // Firebase manejará el estado de autenticación
      console.log('🔐 Esperando estado de autenticación de Firebase...');
    } else {
      // Sin Firebase, mostrar login
      showLogin();
    }
  }

  /**
   * Maneja el inicio de sesión con Google
   */
  async handleGoogleSignIn() {
    try {
      setLoadingState(true);
      await handleGoogleSignIn();
    } catch (error) {
      console.error('Error en inicio de sesión con Google:', error);
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Maneja el inicio de sesión como invitado
   */
  handleGuestLogin() {
    try {
      enterAsGuest();
    } catch (error) {
      console.error('Error al entrar como invitado:', error);
      this.showError('Error al entrar como invitado');
    }
  }

  /**
   * Maneja el inicio de sesión de un usuario
   * @param {Object} user - Usuario autenticado
   */
  handleUserLogin(user) {
    try {
      console.log('👤 Usuario autenticado:', user.displayName);
      
      // Actualizar UI
      renderNavUser();
      showApp();
      updatePageTitle(user.displayName);
      
      // Cargar tareas del usuario
      this.loadUserTasks();
      
      // Mostrar mensaje de bienvenida
      const welcomeContainer = $('#welcome-message');
      if (welcomeContainer) {
        renderWelcomeMessage(welcomeContainer);
      }
      
    } catch (error) {
      console.error('Error al manejar login del usuario:', error);
      this.showError('Error al cargar datos del usuario');
    }
  }

  /**
   * Maneja el cierre de sesión del usuario
   */
  async handleUserLogout() {
    try {
      console.log('👋 Cerrando sesión...');
      
      await handleSignOut();
      
      // Actualizar UI
      renderNavUser();
      showLogin();
      updatePageTitle();
      
      // Limpiar datos
      this.clearUserData();
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.showError('Error al cerrar sesión');
    }
  }

  /**
   * Carga las tareas del usuario actual
   */
  async loadUserTasks() {
    try {
      await loadTasks();
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      this.showError('Error al cargar las tareas');
    }
  }

  /**
   * Maneja la adición de una nueva tarea
   */
  async handleAddTask() {
    try {
      const title = getTaskInputValue();
      
      if (!title || title.trim().length === 0) {
        this.showInputError('El título de la tarea no puede estar vacío');
        return;
      }

      setLoadingState(true);
      await addTask(title.trim());
      clearTaskInput();
      
    } catch (error) {
      console.error('Error al agregar tarea:', error);
      this.showError('Error al agregar la tarea');
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Maneja el cambio de estado de una tarea
   * @param {string} taskId - ID de la tarea
   */
  async handleTaskToggle(taskId) {
    try {
      await toggleTask(taskId);
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error);
      this.showError('Error al cambiar el estado de la tarea');
    }
  }

  /**
   * Maneja la eliminación de una tarea
   * @param {string} taskId - ID de la tarea
   */
  async handleTaskDelete(taskId) {
    try {
      await removeTask(taskId);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      this.showError('Error al eliminar la tarea');
    }
  }

  /**
   * Actualiza el contador de tareas en la UI
   * @param {number} count - Cantidad de tareas
   */
  updateTaskCount(count) {
    const taskCountElement = $('#task-count');
    if (taskCountElement) {
      taskCountElement.textContent = count;
    }
  }

  /**
   * Limpia los datos del usuario
   */
  clearUserData() {
    // Los módulos individuales manejan la limpieza de datos
    console.log('🧹 Datos del usuario limpiados');
  }

  /**
   * Muestra un error en la UI
   * @param {string} message - Mensaje de error
   */
  showError(message) {
    console.error('❌ Error:', message);
    // Aquí se podría implementar un sistema de notificaciones más robusto
  }

  /**
   * Muestra un error en el campo de entrada
   * @param {string} message - Mensaje de error
   */
  showInputError(message) {
    // Esta función se implementa en el módulo UI
    console.warn('⚠️ Error de entrada:', message);
  }

  /**
   * Obtiene el estado de inicialización de la aplicación
   * @returns {boolean} true si la aplicación está inicializada
   */
  getInitializationStatus() {
    return this.isInitialized;
  }
}

// Crear instancia global de la aplicación
window.AgendaApp = new AgendaApp();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.AgendaApp.init();
});

// Exportar para uso en otros módulos si es necesario
export default window.AgendaApp;
