// Módulo para gestión de tareas

import { LocalStore } from './localStore.js';
import { 
  fetchFirestoreTasks, 
  addFirestoreTask, 
  toggleFirestoreTask, 
  removeFirestoreTask,
  updateFirestoreTask 
} from './firebase.js';
import { getCurrentUserId, getCurrentUserMode } from './auth.js';
import { toast } from '../utils/helpers.js';
import { 
  TASK_CATEGORIES, 
  TASK_PRIORITIES, 
  TASK_STATUSES,
  getCategoryById,
  getPriorityById,
  getStatusById
} from '../config/taskConfig.js';

/**
 * Estado global de las tareas
 */
let tasks = [];

/**
 * Instancia del almacenamiento local
 */
const localStore = new LocalStore();

/**
 * Callbacks para cambios en las tareas
 */
const tasksChangeCallbacks = [];

/**
 * Obtiene todas las tareas del usuario actual
 * @returns {Array} Lista de tareas
 */
export function getTasks() {
  return [...tasks];
}

/**
 * Obtiene tareas filtradas por categoría
 * @param {string} category - ID de la categoría
 * @returns {Array} Lista de tareas filtradas
 */
export function getTasksByCategory(category) {
  return tasks.filter(task => task.category === category);
}

/**
 * Obtiene tareas filtradas por prioridad
 * @param {string} priority - ID de la prioridad
 * @returns {Array} Lista de tareas filtradas
 */
export function getTasksByPriority(priority) {
  return tasks.filter(task => task.priority === priority);
}

/**
 * Obtiene tareas filtradas por estado
 * @param {string} status - ID del estado
 * @returns {Array} Lista de tareas filtradas
 */
export function getTasksByStatus(status) {
  return tasks.filter(task => task.status === status);
}

/**
 * Obtiene tareas con búsqueda por texto
 * @param {string} searchText - Texto a buscar
 * @returns {Array} Lista de tareas que coinciden
 */
export function searchTasks(searchText) {
  if (!searchText || searchText.trim().length === 0) {
    return [...tasks];
  }
  
  const query = searchText.toLowerCase().trim();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(query) ||
    (task.description && task.description.toLowerCase().includes(query))
  );
}

/**
 * Registra un callback para cambios en las tareas
 * @param {Function} callback - Función a ejecutar cuando cambien las tareas
 */
export function onTasksChange(callback) {
  tasksChangeCallbacks.push(callback);
  // Ejecutar inmediatamente si ya hay tareas
  if (tasks.length > 0) {
    callback(tasks);
  }
}

/**
 * Notifica a todos los listeners sobre cambios en las tareas
 */
function notifyTasksChange() {
  tasksChangeCallbacks.forEach(callback => callback([...tasks]));
}

/**
 * Carga las tareas del usuario actual
 * @returns {Promise<void>}
 */
export async function loadTasks() {
  const userId = getCurrentUserId();
  const mode = getCurrentUserMode();
  
  if (!userId || !mode) {
    tasks = [];
    notifyTasksChange();
    return;
  }

  try {
    if (mode === 'guest') {
      tasks = localStore.list(userId);
    } else if (mode === 'firebase') {
      tasks = await fetchFirestoreTasks(userId);
    }
    
    notifyTasksChange();
  } catch (error) {
    console.error('Error al cargar tareas:', error);
    toast('Error al cargar las tareas');
    tasks = [];
    notifyTasksChange();
  }
}

/**
 * Agrega una nueva tarea
 * @param {string} title - Título de la tarea
 * @param {string|null} dueDate - Fecha de vencimiento (opcional)
 * @param {string} category - Categoría de la tarea (opcional)
 * @param {string} priority - Prioridad de la tarea (opcional)
 * @param {string} status - Estado de la tarea (opcional)
 * @returns {Promise<Object>} Tarea creada
 */
export async function addTask(title, dueDate = null, category = 'other', priority = 'medium', status = 'pending') {
  const userId = getCurrentUserId();
  const mode = getCurrentUserMode();
  
  if (!userId || !mode) {
    throw new Error('Usuario no autenticado');
  }

  if (!title || title.trim().length === 0) {
    throw new Error('El título de la tarea no puede estar vacío');
  }

  try {
    let newTask;
    
    if (mode === 'guest') {
      newTask = localStore.add(userId, title.trim(), dueDate, category, priority, status);
      tasks.unshift(newTask);
    } else if (mode === 'firebase') {
      newTask = await addFirestoreTask(userId, title.trim(), dueDate, category, priority, status);
      tasks.unshift(newTask);
    }
    
    notifyTasksChange();
    toast('Tarea agregada correctamente');
    return newTask;
  } catch (error) {
    console.error('Error al agregar tarea:', error);
    toast('Error al agregar la tarea');
    throw error;
  }
}

/**
 * Cambia el estado de una tarea (completada/pendiente)
 * @param {string} id - ID de la tarea
 * @returns {Promise<Object|null>} Tarea actualizada o null si no se encuentra
 */
export async function toggleTask(id) {
  const userId = getCurrentUserId();
  const mode = getCurrentUserMode();
  
  if (!userId || !mode) {
    throw new Error('Usuario no autenticado');
  }

  try {
    let updatedTask;
    
    if (mode === 'guest') {
      updatedTask = localStore.toggle(userId, id);
      if (updatedTask) {
        const index = tasks.findIndex(t => t.id === id);
        if (index > -1) {
          tasks[index] = updatedTask;
        }
      }
    } else if (mode === 'firebase') {
      updatedTask = await toggleFirestoreTask(userId, id);
      if (updatedTask) {
        const index = tasks.findIndex(t => t.id === id);
        if (index > -1) {
          tasks[index] = updatedTask;
        }
      }
    }
    
    if (updatedTask) {
      notifyTasksChange();
      const status = updatedTask.done ? 'completada' : 'marcada como pendiente';
      toast(`Tarea ${status}`);
    }
    
    return updatedTask;
  } catch (error) {
    console.error('Error al cambiar estado de tarea:', error);
    toast('Error al cambiar el estado de la tarea');
    throw error;
  }
}

/**
 * Actualiza una tarea existente
 * @param {string} id - ID de la tarea
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Tarea actualizada o null si no se encuentra
 */
export async function updateTask(id, updates) {
  const userId = getCurrentUserId();
  const mode = getCurrentUserMode();
  
  if (!userId || !mode) {
    throw new Error('Usuario no autenticado');
  }

  try {
    let updatedTask;
    
    if (mode === 'guest') {
      updatedTask = localStore.update(userId, id, updates);
      if (updatedTask) {
        const index = tasks.findIndex(t => t.id === id);
        if (index > -1) {
          tasks[index] = updatedTask;
        }
      }
    } else if (mode === 'firebase') {
      updatedTask = await updateFirestoreTask(userId, id, updates);
      if (updatedTask) {
        const index = tasks.findIndex(t => t.id === id);
        if (index > -1) {
          tasks[index] = updatedTask;
        }
      }
    }
    
    if (updatedTask) {
      notifyTasksChange();
      toast('Tarea actualizada correctamente');
    }
    
    return updatedTask;
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    toast('Error al actualizar la tarea');
    throw error;
  }
}

/**
 * Elimina una tarea
 * @param {string} id - ID de la tarea
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export async function removeTask(id) {
  const userId = getCurrentUserId();
  const mode = getCurrentUserMode();
  
  if (!userId || !mode) {
    throw new Error('Usuario no autenticado');
  }

  try {
    let success;
    
    if (mode === 'guest') {
      success = localStore.remove(userId, id);
      if (success) {
        tasks = tasks.filter(t => t.id !== id);
      }
    } else if (mode === 'firebase') {
      success = await removeFirestoreTask(userId, id);
      if (success) {
        tasks = tasks.filter(t => t.id !== id);
      }
    }
    
    if (success) {
      notifyTasksChange();
      toast('Tarea eliminada correctamente');
    }
    
    return success;
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    toast('Error al eliminar la tarea');
    throw error;
  }
}

/**
 * Obtiene estadísticas de las tareas del usuario actual
 * @returns {Object} Estadísticas de las tareas
 */
export function getTasksStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending = total - completed;
  
  // Calcular tareas vencidas
  const now = Date.now();
  const overdue = tasks.filter(t => !t.done && t.dueDate && t.dueDate < now).length;
  
  // Calcular tareas que vencen hoy
  const today = new Date();
  const dueToday = tasks.filter(t => !t.done && t.dueDate && 
    new Date(t.dueDate).toDateString() === today.toDateString()
  ).length;
  
  // Calcular tareas que vencen pronto (próximos 3 días)
  const threeDaysFromNow = now + (3 * 24 * 60 * 60 * 1000);
  const dueSoon = tasks.filter(t => !t.done && t.dueDate && 
    t.dueDate > now && t.dueDate <= threeDaysFromNow
  ).length;
  
  return { total, completed, pending, overdue, dueToday, dueSoon };
}

/**
 * Filtra las tareas según criterios
 * @param {Object} filters - Criterios de filtrado
 * @returns {Array} Tareas filtradas
 */
export function filterTasks(filters = {}) {
  let filteredTasks = [...tasks];
  
  // Filtro por estado
  if (filters.done !== undefined) {
    filteredTasks = filteredTasks.filter(t => t.done === filters.done);
  }
  
  // Filtro por categoría
  if (filters.category) {
    filteredTasks = filteredTasks.filter(t => t.category === filters.category);
  }
  
  // Filtro por prioridad
  if (filters.priority) {
    filteredTasks = filteredTasks.filter(t => t.priority === filters.priority);
  }
  
  // Filtro por estado
  if (filters.status) {
    filteredTasks = filteredTasks.filter(t => t.status === filters.status);
  }
  
  // Filtro por texto
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title.toLowerCase().includes(searchTerm)
    );
  }
  
  // Ordenamiento
  if (filters.sortBy === 'createdAt') {
    filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
  } else if (filters.sortBy === 'title') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sortBy === 'priority') {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    filteredTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  } else if (filters.sortBy === 'dueDate') {
    filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate - b.dueDate;
    });
  }
  
  return filteredTasks;
}

/**
 * Limpia todas las tareas del usuario actual
 * @returns {Promise<void>}
 */
export async function clearAllTasks() {
  const userId = getCurrentUserId();
  const mode = getCurrentUserMode();
  
  if (!userId || !mode) {
    throw new Error('Usuario no autenticado');
  }

  try {
    if (mode === 'guest') {
      localStore.clear(userId);
    } else if (mode === 'firebase') {
      // Eliminar todas las tareas de Firestore
      for (const task of tasks) {
        await removeFirestoreTask(userId, task.id);
      }
    }
    
    tasks = [];
    notifyTasksChange();
    toast('Todas las tareas han sido eliminadas');
  } catch (error) {
    console.error('Error al limpiar tareas:', error);
    toast('Error al limpiar las tareas');
    throw error;
  }
}
