// Módulo para manejo de almacenamiento local (LocalStorage)

/**
 * Clase para manejar el almacenamiento local de tareas
 */
export class LocalStore {
  constructor(key = 'agenda_base_tasks') {
    this.key = key;
  }

  /**
   * Carga las tareas de un usuario desde LocalStorage
   * @param {string} userId - ID del usuario
   * @returns {Array} Lista de tareas
   */
  load(userId) {
    try {
      const raw = localStorage.getItem(this.key + ':' + userId);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error al cargar tareas del LocalStorage:', error);
      return [];
    }
  }

  /**
   * Guarda las tareas de un usuario en LocalStorage
   * @param {string} userId - ID del usuario
   * @param {Array} tasks - Lista de tareas a guardar
   */
  save(userId, tasks) {
    try {
      localStorage.setItem(this.key + ':' + userId, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error al guardar tareas en LocalStorage:', error);
    }
  }

  /**
   * Obtiene la lista de tareas de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} Lista de tareas
   */
  list(userId) {
    return this.load(userId);
  }

  /**
   * Agrega una nueva tarea
   * @param {string} userId - ID del usuario
   * @param {string} title - Título de la tarea
   * @returns {Object} Tarea creada
   */
  add(userId, title) {
    const tasks = this.load(userId);
    const item = {
      id: this._generateId(),
      title,
      done: false,
      createdAt: Date.now()
    };
    tasks.unshift(item);
    this.save(userId, tasks);
    return item;
  }

  /**
   * Cambia el estado de una tarea (completada/pendiente)
   * @param {string} userId - ID del usuario
   * @param {string} id - ID de la tarea
   * @returns {Object|null} Tarea actualizada o null si no se encuentra
   */
  toggle(userId, id) {
    const tasks = this.load(userId);
    const index = tasks.findIndex(t => t.id === id);
    
    if (index > -1) {
      tasks[index].done = !tasks[index].done;
      this.save(userId, tasks);
      return tasks[index];
    }
    return null;
  }

  /**
   * Elimina una tarea
   * @param {string} userId - ID del usuario
   * @param {string} id - ID de la tarea
   * @returns {boolean} true si se eliminó correctamente
   */
  remove(userId, id) {
    const tasks = this.load(userId).filter(t => t.id !== id);
    this.save(userId, tasks);
    return true;
  }

  /**
   * Actualiza una tarea existente
   * @param {string} userId - ID del usuario
   * @param {string} id - ID de la tarea
   * @param {Object} updates - Campos a actualizar
   * @returns {Object|null} Tarea actualizada o null si no se encuentra
   */
  update(userId, id, updates) {
    const tasks = this.load(userId);
    const index = tasks.findIndex(t => t.id === id);
    
    if (index > -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.save(userId, tasks);
      return tasks[index];
    }
    return null;
  }

  /**
   * Genera un ID único para las tareas
   * @returns {string} ID único
   * @private
   */
  _generateId() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  /**
   * Limpia todas las tareas de un usuario
   * @param {string} userId - ID del usuario
   */
  clear(userId) {
    localStorage.removeItem(this.key + ':' + userId);
  }

  /**
   * Obtiene estadísticas básicas de las tareas
   * @param {string} userId - ID del usuario
   * @returns {Object} Estadísticas de las tareas
   */
  getStats(userId) {
    const tasks = this.load(userId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  }
}
