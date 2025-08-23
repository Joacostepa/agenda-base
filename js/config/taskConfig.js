// Configuración para el sistema de tareas avanzado

/**
 * Categorías predefinidas para las tareas
 */
export const TASK_CATEGORIES = [
  { id: 'work', name: 'Trabajo', color: 'bg-blue-500', icon: '💼' },
  { id: 'personal', name: 'Personal', color: 'bg-green-500', icon: '👤' },
  { id: 'health', name: 'Salud', color: 'bg-red-500', icon: '🏥' },
  { id: 'finance', name: 'Finanzas', color: 'bg-yellow-500', icon: '💰' },
  { id: 'home', name: 'Hogar', color: 'bg-purple-500', icon: '🏠' },
  { id: 'study', name: 'Estudio', color: 'bg-indigo-500', icon: '📚' },
  { id: 'shopping', name: 'Compras', color: 'bg-pink-500', icon: '🛒' },
  { id: 'travel', name: 'Viajes', color: 'bg-orange-500', icon: '✈️' },
  { id: 'other', name: 'Otros', color: 'bg-gray-500', icon: '📌' }
];

/**
 * Prioridades disponibles para las tareas
 */
export const TASK_PRIORITIES = [
  { id: 'low', name: 'Baja', color: 'bg-gray-400', icon: '🔽' },
  { id: 'medium', name: 'Media', color: 'bg-yellow-400', icon: '➡️' },
  { id: 'high', name: 'Alta', color: 'bg-red-500', icon: '🔼' },
  { id: 'urgent', name: 'Urgente', color: 'bg-red-600', icon: '🚨' }
];

/**
 * Estados disponibles para las tareas
 */
export const TASK_STATUSES = [
  { id: 'pending', name: 'Pendiente', color: 'bg-gray-400', icon: '⏳' },
  { id: 'completed', name: 'Completada', color: 'bg-green-500', icon: '✅' },
  { id: 'cancelled', name: 'Cancelada', color: 'bg-red-400', icon: '❌' }
];

/**
 * Obtiene una categoría por ID
 * @param {string} categoryId - ID de la categoría
 * @returns {Object|null} Categoría encontrada
 */
export function getCategoryById(categoryId) {
  return TASK_CATEGORIES.find(cat => cat.id === categoryId) || TASK_CATEGORIES.find(cat => cat.id === 'other');
}

/**
 * Obtiene una prioridad por ID
 * @param {string} priorityId - ID de la prioridad
 * @returns {Object|null} Prioridad encontrada
 */
export function getPriorityById(priorityId) {
  return TASK_PRIORITIES.find(pri => pri.id === priorityId) || TASK_PRIORITIES.find(pri => pri.id === 'medium');
}

/**
 * Obtiene un estado por ID
 * @param {string} statusId - ID del estado
 * @returns {Object|null} Estado encontrado
 */
export function getStatusById(statusId) {
  return TASK_STATUSES.find(status => status.id === statusId) || TASK_STATUSES.find(status => status.id === 'pending');
}

/**
 * Obtiene el color de una categoría
 * @param {string} categoryId - ID de la categoría
 * @returns {string} Color de la categoría
 */
export function getCategoryColor(categoryId) {
  const category = getCategoryById(categoryId);
  return category ? category.color : 'bg-gray-500';
}

/**
 * Obtiene el icono de una categoría
 * @param {string} categoryId - ID de la categoría
 * @returns {string} Icono de la categoría
 */
export function getCategoryIcon(categoryId) {
  const category = getCategoryById(categoryId);
  return category ? category.icon : '📌';
}
