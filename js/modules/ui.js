// Módulo para manejo de la interfaz de usuario

import { $ } from '../utils/helpers.js';
import { getCurrentUser, getCurrentUserDisplayName, getCurrentUserPhotoURL } from './auth.js';
import { getTasks, getTasksStats } from './tasks.js';

/**
 * Elementos DOM principales
 */
const elements = {
  viewLogin: null,
  viewApp: null,
  navUser: null,
  taskList: null,
  emptyState: null,
  inputTitle: null
};

/**
 * Inicializa los elementos DOM
 */
export function initUI() {
  elements.viewLogin = $('#view-login');
  elements.viewApp = $('#view-app');
  elements.navUser = $('#nav-user');
  elements.taskList = $('#task-list');
  elements.emptyState = $('#empty-state');
  elements.inputTitle = $('#task-title');
}

/**
 * Renderiza la barra de navegación del usuario
 */
export function renderNavUser() {
  if (!elements.navUser) return;
  
  elements.navUser.innerHTML = '';
  
  const user = getCurrentUser();
  if (!user) return;

  // Avatar del usuario
  const avatar = document.createElement('img');
  avatar.src = user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.displayName || 'Invitado')}`;
  avatar.alt = 'Avatar del usuario';
  avatar.className = 'h-8 w-8 rounded-full ring-2 ring-white object-cover';
  
  // Nombre del usuario
  const name = document.createElement('span');
  name.className = 'hidden sm:inline text-sm text-gray-700';
  name.textContent = user.displayName || 'Invitado';
  
  // Botón de salir
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'ml-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors';
  logoutBtn.textContent = 'Salir';
  logoutBtn.addEventListener('click', () => {
    // El evento se maneja en el módulo principal
    window.dispatchEvent(new CustomEvent('user-logout'));
  });
  
  elements.navUser.append(avatar, name, logoutBtn);
}

/**
 * Renderiza la lista de tareas
 */
export function renderTasks() {
  if (!elements.taskList || !elements.emptyState) return;
  
  const tasks = getTasks();
  
  // Limpiar lista actual
  elements.taskList.innerHTML = '';
  
  // Mostrar estado vacío si no hay tareas
  if (!tasks || tasks.length === 0) {
    elements.emptyState.classList.remove('hidden');
    return;
  }
  
  // Ocultar estado vacío
  elements.emptyState.classList.add('hidden');
  
  // Renderizar cada tarea
  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    elements.taskList.appendChild(taskElement);
  });
}

/**
 * Crea un elemento DOM para una tarea individual
 * @param {Object} task - Objeto tarea
 * @returns {HTMLLIElement} Elemento DOM de la tarea
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'flex items-center justify-between gap-3 py-3 fade-in';
  
  // Contenedor izquierdo (checkbox + título)
  const left = document.createElement('div');
  left.className = 'flex items-center gap-3 flex-1';
  
  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!task.done;
  checkbox.className = 'h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer';
  checkbox.addEventListener('change', () => {
    window.dispatchEvent(new CustomEvent('task-toggle', { detail: { taskId: task.id } }));
  });
  
  // Título de la tarea
  const title = document.createElement('span');
  title.className = `text-sm flex-1 ${task.done ? 'line-through text-gray-400' : ''}`;
  title.textContent = task.title;
  
  // Fecha de creación (opcional)
  const date = document.createElement('span');
  date.className = 'text-xs text-gray-400 hidden sm:block';
  date.textContent = new Date(task.createdAt).toLocaleDateString('es-AR', {
    month: 'short',
    day: 'numeric'
  });
  
  left.append(checkbox, title, date);
  
  // Botón eliminar
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'rounded-md border px-2.5 py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50 transition-colors';
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que querés eliminar esta tarea?')) {
      window.dispatchEvent(new CustomEvent('task-delete', { detail: { taskId: task.id } }));
    }
  });
  
  li.append(left, deleteBtn);
  return li;
}

/**
 * Renderiza las estadísticas de las tareas
 * @param {HTMLElement} container - Contenedor donde mostrar las estadísticas
 */
export function renderTaskStats(container) {
  if (!container) return;
  
  const stats = getTasksStats();
  
  container.innerHTML = `
    <div class="grid grid-cols-3 gap-4 text-center">
      <div class="bg-blue-50 p-3 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
        <div class="text-sm text-blue-500">Total</div>
      </div>
      <div class="bg-green-50 p-3 rounded-lg">
        <div class="text-2xl font-bold text-green-600">${stats.completed}</div>
        <div class="text-sm text-green-500">Completadas</div>
      </div>
      <div class="bg-yellow-50 p-3 rounded-lg">
        <div class="text-2xl font-bold text-yellow-600">${stats.pending}</div>
        <div class="text-sm text-yellow-500">Pendientes</div>
      </div>
    </div>
  `;
}

/**
 * Muestra la vista de login
 */
export function showLogin() {
  if (elements.viewLogin && elements.viewApp) {
    elements.viewLogin.classList.remove('hidden');
    elements.viewApp.classList.add('hidden');
  }
}

/**
 * Muestra la vista principal de la aplicación
 */
export function showApp() {
  if (elements.viewLogin && elements.viewApp) {
    elements.viewApp.classList.remove('hidden');
    elements.viewLogin.classList.add('hidden');
  }
}

/**
 * Limpia el campo de entrada de tareas
 */
export function clearTaskInput() {
  if (elements.inputTitle) {
    elements.inputTitle.value = '';
    elements.inputTitle.focus();
  }
}

/**
 * Obtiene el valor del campo de entrada de tareas
 * @returns {string} Valor del campo de entrada
 */
export function getTaskInputValue() {
  return elements.inputTitle ? elements.inputTitle.value : '';
}

/**
 * Establece el valor del campo de entrada de tareas
 * @param {string} value - Valor a establecer
 */
export function setTaskInputValue(value) {
  if (elements.inputTitle) {
    elements.inputTitle.value = value;
  }
}

/**
 * Muestra un mensaje de error en el campo de entrada
 * @param {string} message - Mensaje de error
 */
export function showInputError(message) {
  if (elements.inputTitle) {
    elements.inputTitle.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    
    // Remover clases de error después de un tiempo
    setTimeout(() => {
      elements.inputTitle.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    }, 3000);
  }
}

/**
 * Actualiza el estado de carga de la interfaz
 * @param {boolean} isLoading - true si está cargando
 */
export function setLoadingState(isLoading) {
  const addButton = $('#btn-add-task');
  if (addButton) {
    addButton.disabled = isLoading;
    addButton.textContent = isLoading ? 'Agregando...' : 'Agregar';
  }
  
  if (elements.inputTitle) {
    elements.inputTitle.disabled = isLoading;
  }
}

/**
 * Actualiza el título de la página
 * @param {string} title - Nuevo título
 */
export function updatePageTitle(title) {
  if (title) {
    document.title = `${title} - Agenda Base`;
  } else {
    document.title = 'Agenda Base';
  }
}

/**
 * Renderiza un mensaje de bienvenida personalizado
 * @param {HTMLElement} container - Contenedor donde mostrar el mensaje
 */
export function renderWelcomeMessage(container) {
  if (!container) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  const timeOfDay = new Date().getHours();
  let greeting = '¡Hola';
  
  if (timeOfDay < 12) {
    greeting += ' buenos días';
  } else if (timeOfDay < 18) {
    greeting += ' buenas tardes';
  } else {
    greeting += ' buenas noches';
  }
  
  container.innerHTML = `
    <div class="text-center py-4">
      <h2 class="text-xl font-semibold text-gray-800">${greeting}, ${user.displayName}!</h2>
      <p class="text-gray-600">¿Qué tareas tenés para hoy?</p>
    </div>
  `;
}
