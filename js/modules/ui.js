// Módulo para manejo de la interfaz de usuario

import { $ } from '../utils/helpers.js';
import { getCurrentUser, getCurrentUserDisplayName, getCurrentUserPhotoURL } from './auth.js';
import { getTasks, getTasksStats } from './tasks.js';
import { getCategoryById, getPriorityById, getStatusById } from '../config/taskConfig.js';

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
  
  // Contenedor para metadatos de la tarea
  const metadata = document.createElement('div');
  metadata.className = 'flex items-center gap-2 mt-1';
  
  // Categoría
  if (task.category && task.category !== 'other') {
    const category = document.createElement('span');
    const categoryConfig = getCategoryById(task.category);
    category.className = `text-xs px-2 py-1 rounded-full ${categoryConfig.color} text-white`;
    category.textContent = `${categoryConfig.icon} ${categoryConfig.name}`;
    metadata.appendChild(category);
  }
  
  // Prioridad
  if (task.priority && task.priority !== 'medium') {
    const priority = document.createElement('span');
    const priorityConfig = getPriorityById(task.priority);
    priority.className = `text-xs px-2 py-1 rounded-full ${priorityConfig.color} text-white`;
    priority.textContent = `${priorityConfig.icon} ${priorityConfig.name}`;
    metadata.appendChild(priority);
  }
  
  // Estado
  if (task.status && task.status !== 'pending') {
    const status = document.createElement('span');
    const statusConfig = getStatusById(task.status);
    status.className = `text-xs px-2 py-1 rounded-full ${statusConfig.color} text-white`;
    status.textContent = `${statusConfig.icon} ${statusConfig.name}`;
    metadata.appendChild(status);
  }
  
  // Fecha de vencimiento (si existe)
  if (task.dueDate) {
    const dueDate = document.createElement('span');
    const now = Date.now();
    const isOverdue = !task.done && task.dueDate < now;
    const isDueToday = !task.done && new Date(task.dueDate).toDateString() === new Date().toDateString();
    
    dueDate.className = `text-xs px-2 py-1 rounded-full ${
      isOverdue ? 'bg-red-100 text-red-700' :
      isDueToday ? 'bg-orange-100 text-orange-700' :
      'bg-blue-100 text-blue-700'
    }`;
    
    dueDate.textContent = new Date(task.dueDate).toLocaleDateString('es-AR', {
      month: 'short',
      day: 'numeric'
    });
    
    metadata.appendChild(dueDate);
  }
  
  // Agregar metadatos al contenedor izquierdo
  left.append(checkbox, title);
  if (metadata.children.length > 0) {
    left.appendChild(metadata);
  }
  
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
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
      <div class="bg-blue-50 p-3 rounded-lg">
        <div class="text-xl font-bold text-blue-600">${stats.total}</div>
        <div class="text-xs text-blue-500">Total</div>
      </div>
      <div class="bg-green-50 p-3 rounded-lg">
        <div class="text-xl font-bold text-green-600">${stats.completed}</div>
        <div class="text-xs text-green-500">Completadas</div>
      </div>
      <div class="bg-yellow-50 p-3 rounded-lg">
        <div class="text-xl font-bold text-yellow-600">${stats.pending}</div>
        <div class="text-xs text-yellow-500">Pendientes</div>
      </div>
      <div class="bg-red-50 p-3 rounded-lg">
        <div class="text-xl font-bold text-red-600">${stats.overdue}</div>
        <div class="text-xs text-red-500">Vencidas</div>
      </div>
      <div class="bg-orange-50 p-3 rounded-lg">
        <div class="text-xl font-bold text-orange-600">${stats.dueToday}</div>
        <div class="text-xs text-orange-500">Vencen hoy</div>
      </div>
      <div class="bg-purple-50 p-3 rounded-lg">
        <div class="text-xl font-bold text-purple-600">${stats.dueSoon}</div>
        <div class="text-xs text-purple-500">Vencen pronto</div>
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
 * Limpia el campo de fecha de vencimiento
 */
export function clearTaskForm() {
  clearTaskInput();
  clearTaskDueDate();
  
  // Resetear selects a valores por defecto
  const categorySelect = $('#task-category');
  const prioritySelect = $('#task-priority');
  const statusSelect = $('#task-status');
  
  if (categorySelect) categorySelect.value = 'other';
  if (prioritySelect) prioritySelect.value = 'medium';
  if (statusSelect) statusSelect.value = 'pending';
}

/**
 * Limpia el campo de fecha de vencimiento
 */
export function clearTaskDueDate() {
  const dueDateInput = $('#task-due-date');
  if (dueDateInput) {
    dueDateInput.value = '';
  }
}

/**
 * Obtiene el valor del campo de fecha de vencimiento
 * @returns {string} Valor de la fecha o string vacío
 */
export function getTaskDueDate() {
  const dueDateInput = $('#task-due-date');
  return dueDateInput ? dueDateInput.value : '';
}

/**
 * Obtiene el valor del campo de categoría
 * @returns {string} Valor de la categoría
 */
export function getTaskCategory() {
  const categorySelect = $('#task-category');
  return categorySelect ? categorySelect.value : 'other';
}

/**
 * Obtiene el valor del campo de prioridad
 * @returns {string} Valor de la prioridad
 */
export function getTaskPriority() {
  const prioritySelect = $('#task-priority');
  return prioritySelect ? prioritySelect.value : 'medium';
}

/**
 * Obtiene el valor del campo de estado
 * @returns {string} Valor del estado
 */
export function getTaskStatus() {
  const statusSelect = $('#task-status');
  return statusSelect ? statusSelect.value : 'pending';
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

/**
 * Renderiza la lista de usuarios del sistema
 * @param {Array} users - Lista de usuarios a renderizar
 */
export function renderUsers(users) {
  const usersList = $('#users-list');
  const usersEmptyState = $('#users-empty-state');
  const userCount = $('#user-count');
  
  if (!usersList || !usersEmptyState || !userCount) return;
  
  // Actualizar contador
  userCount.textContent = `(${users.length})`;
  
  // Limpiar lista actual
  usersList.innerHTML = '';
  
  // Mostrar estado vacío si no hay usuarios
  if (!users || users.length === 0) {
    usersEmptyState.classList.remove('hidden');
    return;
  }
  
  // Ocultar estado vacío
  usersEmptyState.classList.add('hidden');
  
  // Renderizar cada usuario
  users.forEach(user => {
    const userElement = createUserElement(user);
    usersList.appendChild(userElement);
  });
}

/**
 * Crea un elemento DOM para un usuario individual
 * @param {Object} user - Objeto usuario
 * @returns {HTMLElement} Elemento DOM del usuario
 */
function createUserElement(user) {
  const div = document.createElement('div');
  div.className = 'flex items-center justify-between gap-4 p-6 hover:bg-gray-50 transition-colors';
  
  // Información del usuario
  const userInfo = document.createElement('div');
  userInfo.className = 'flex items-center gap-4';
  
  // Avatar del usuario
  const avatar = document.createElement('img');
  avatar.src = user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.displayName)}`;
  avatar.alt = `Avatar de ${user.displayName}`;
  avatar.className = 'h-12 w-12 rounded-full ring-2 ring-white object-cover';
  
  // Detalles del usuario
  const details = document.createElement('div');
  details.className = 'flex-1';
  
  const name = document.createElement('h4');
  name.className = 'font-medium text-gray-900';
  name.textContent = user.displayName;
  
  const email = document.createElement('p');
  email.className = 'text-sm text-gray-500';
  email.textContent = user.email;
  
  const status = document.createElement('div');
  status.className = 'flex items-center gap-2 mt-1';
  
  const statusDot = document.createElement('div');
  statusDot.className = `w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`;
  
  const statusText = document.createElement('span');
  statusText.className = 'text-xs text-gray-500';
  statusText.textContent = user.isActive ? 'Activo' : 'Inactivo';
  
  status.append(statusDot, statusText);
  details.append(name, email, status);
  userInfo.append(avatar, details);
  
  // Fecha de registro
  const registrationDate = document.createElement('div');
  registrationDate.className = 'text-right text-sm text-gray-500';
  registrationDate.textContent = new Date(user.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  div.append(userInfo, registrationDate);
  return div;
}

/**
 * Configura la búsqueda de usuarios
 * @param {Function} onSearch - Función a ejecutar cuando cambie la búsqueda
 */
export function setupUserSearch(onSearch) {
  const searchInput = $('#user-search');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    onSearch(query);
  });
}
