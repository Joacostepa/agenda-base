// Utilidades generales para la aplicación

/**
 * Selector de elementos DOM simplificado
 * @param {string} selector - Selector CSS
 * @param {Document|Element} context - Contexto de búsqueda (opcional)
 * @returns {Element|null}
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Selector de múltiples elementos DOM
 * @param {string} selector - Selector CSS
 * @param {Document|Element} context - Contexto de búsqueda (opcional)
 * @returns {Array<Element>}
 */
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

/**
 * Genera un ID único
 * @returns {string}
 */
export const uid = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now() + "-" + Math.random().toString(16).slice(2);
};

/**
 * Muestra un mensaje toast temporal
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en milisegundos (opcional)
 */
export const toast = (message, duration = 2200) => {
  const toastElement = document.createElement('div');
  toastElement.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow z-50 toast';
  toastElement.textContent = message;
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    toastElement.remove();
  }, duration);
};

/**
 * Valida si un string está vacío o solo contiene espacios
 * @param {string} str - String a validar
 * @returns {boolean}
 */
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

/**
 * Formatea una fecha para mostrar
 * @param {number|Date} timestamp - Timestamp o fecha
 * @returns {string}
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
