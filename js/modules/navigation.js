// Módulo para manejar la navegación entre proyectos

import { $ } from '../utils/helpers.js';
import { getCurrentUser } from './auth.js';

/**
 * Estado de navegación actual
 */
let currentProject = 'inbox';
let projects = {};

/**
 * Colores disponibles para proyectos
 */
const availableColors = {
  blue: { name: 'Azul', hex: 'rgb(59 130 246)' },
  green: { name: 'Verde', hex: 'rgb(34 197 94)' },
  purple: { name: 'Púrpura', hex: 'rgb(168 85 247)' },
  orange: { name: 'Naranja', hex: 'rgb(249 115 22)' },
  red: { name: 'Rojo', hex: 'rgb(239 68 68)' },
  yellow: { name: 'Amarillo', hex: 'rgb(234 179 8)' }
};

/**
 * Inicializa la navegación
 */
export function initNavigation() {
  setupProjectNavigation();
  setupSidebarToggle();
  setupNewProjectModal();
  loadUserProjects();
  updateProjectCounts();
  setActiveProject(currentProject);
}

/**
 * Configura la navegación entre proyectos
 */
function setupProjectNavigation() {
  const projectButtons = document.querySelectorAll('.project-nav-item');
  
  projectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const projectId = button.dataset.project;
      if (projectId && projects[projectId]) {
        switchToProject(projectId);
      }
    });
  });
}

/**
 * Configura el toggle de la barra lateral en móviles
 */
function setupSidebarToggle() {
  const toggleBtn = $('#btn-toggle-sidebar');
  const sidebar = $('#sidebar');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-collapsed');
    });
  }
}

/**
 * Cambia al proyecto especificado
 */
export function switchToProject(projectId) {
  if (!projects[projectId]) return;
  
  // Actualizar estado
  currentProject = projectId;
  
  // Actualizar UI
  setActiveProject(projectId);
  updateProjectHeader(projectId);
  
  // Disparar evento para que otros módulos sepan del cambio
  window.dispatchEvent(new CustomEvent('project-changed', { 
    detail: { projectId, project: projects[projectId] } 
  }));
}

/**
 * Establece el proyecto activo en la UI
 */
function setActiveProject(projectId) {
  // Remover clase active de todos los botones
  document.querySelectorAll('.project-nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Agregar clase active al botón del proyecto actual
  const activeButton = document.querySelector(`[data-project="${projectId}"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
}

/**
 * Actualiza el header del proyecto
 */
function updateProjectHeader(projectId) {
  const project = projects[projectId];
  if (!project) return;
  
  const title = $('#current-project-title');
  const subtitle = $('#current-project-subtitle');
  
  if (title) title.textContent = project.name;
  if (subtitle) subtitle.textContent = project.description;
}

/**
 * Actualiza los contadores de tareas por proyecto
 */
export function updateProjectCounts() {
  // Por ahora, establecer contadores de ejemplo
  // En el futuro, esto se conectará con el sistema de tareas
  const counts = {
    andamios: 37,
    iae: 13,
    personal: 8,
    tcba: 3
  };
  
  Object.entries(counts).forEach(([projectId, count]) => {
    const countElement = document.querySelector(`[data-project="${projectId}"].project-count`);
    if (countElement) {
      countElement.textContent = count;
    }
  });
}

/**
 * Obtiene el proyecto actual
 */
export function getCurrentProject() {
  return currentProject;
}

/**
 * Obtiene la información del proyecto actual
 */
export function getCurrentProjectInfo() {
  return projects[currentProject];
}

/**
 * Obtiene todos los proyectos
 */
export function getAllProjects() {
  return projects;
}

/**
 * Carga las listas del usuario actual
 */
async function loadUserProjects() {
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    // Por ahora, crear listas por defecto para el usuario
    // En el futuro, esto se cargará desde Firebase/LocalStorage
    const defaultProjects = {
      inbox: { 
        id: 'inbox', 
        name: 'Buzón de entrada', 
        color: 'blue', 
        description: 'Tareas sin categorizar',
        isDefault: true 
      }
    };
    
    projects = defaultProjects;
    renderProjectsList();
    
  } catch (error) {
    console.error('Error al cargar proyectos del usuario:', error);
  }
}

/**
 * Renderiza la lista de proyectos en la barra lateral
 */
function renderProjectsList() {
  const projectsList = document.querySelector('.project-nav-item')?.parentElement?.parentElement;
  if (!projectsList) return;
  
  // Limpiar lista actual (excepto el primer elemento que es el template)
  const existingItems = projectsList.querySelectorAll('li');
  existingItems.forEach((item, index) => {
    if (index > 0) item.remove(); // Mantener solo el primer elemento como template
  });
  
  // Agregar cada proyecto
  Object.entries(projects).forEach(([projectId, project]) => {
    if (projectId !== 'inbox') { // El inbox ya está en el HTML
      addProjectToSidebar(projectId, project);
    }
  });
}

/**
 * Guarda las listas del usuario
 */
async function saveUserProjects() {
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    // Por ahora, guardar en localStorage
    // En el futuro, esto se guardará en Firebase
    const userKey = `projects_${user.uid || 'guest'}`;
    localStorage.setItem(userKey, JSON.stringify(projects));
    
    console.log('✅ Proyectos guardados para usuario:', user.displayName || 'Invitado');
  } catch (error) {
    console.error('Error al guardar proyectos:', error);
  }
}

/**
 * Configura el modal de nueva lista
 */
function setupNewProjectModal() {
  const newProjectBtn = $('#btn-new-project');
  const modal = $('#new-project-modal');
  const closeBtn = $('#btn-close-new-project');
  const cancelBtn = $('#btn-cancel-new-project');
  const createBtn = $('#btn-create-new-project');
  
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
      if (modal) modal.classList.remove('hidden');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }
  
  if (createBtn) {
    createBtn.addEventListener('click', createNewProject);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
}

/**
 * Crea una nueva lista/proyecto
 */
async function createNewProject() {
  const nameInput = $('#new-project-name');
  const descriptionInput = $('#new-project-description');
  const colorSelect = $('#new-project-color');
  const modal = $('#new-project-modal');
  
  if (!nameInput || !colorSelect) return;
  
  const name = nameInput.value.trim();
  const description = descriptionInput ? descriptionInput.value.trim() : '';
  const color = colorSelect.value;
  
  if (!name) {
    alert('Por favor ingresa un nombre para la lista');
    return;
  }
  
  // Crear nuevo proyecto
  const projectId = name.toLowerCase().replace(/\s+/g, '-');
  const newProject = {
    id: projectId,
    name,
    description: description || `Lista: ${name}`,
    color,
    isDefault: false,
    createdAt: Date.now()
  };
  
  projects[projectId] = newProject;
  
  // Agregar a la UI
  addProjectToSidebar(projectId, newProject);
  
  // Guardar en almacenamiento del usuario
  await saveUserProjects();
  
  // Limpiar formulario y cerrar modal
  nameInput.value = '';
  if (descriptionInput) descriptionInput.value = '';
  colorSelect.value = 'blue';
  modal.classList.add('hidden');
  
  console.log('✅ Nueva lista creada:', newProject);
}

/**
 * Agrega un proyecto a la barra lateral
 */
function addProjectToSidebar(projectId, project) {
  const projectsList = document.querySelector('.project-nav-item').parentElement.parentElement;
  if (!projectsList) return;
  
  const newProjectItem = document.createElement('li');
  newProjectItem.className = 'group relative';
  newProjectItem.innerHTML = `
    <div class="flex items-center justify-between">
      <button class="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors project-nav-item" data-project="${projectId}">
        <span class="flex items-center gap-3">
          <span class="w-2 h-2 bg-${project.color}-500 rounded-full"></span>
          ${project.name}
        </span>
        <span class="text-xs bg-gray-700 px-2 py-1 rounded-full project-count" data-project="${projectId}">0</span>
      </button>
      
      <!-- Botones de acción (solo visibles en hover) -->
      <div class="hidden group-hover-action items-center gap-1 px-2">
        <button class="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-gray-800 transition-colors edit-project-btn" data-project="${projectId}" title="Editar">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors delete-project-btn" data-project="${projectId}" title="Eliminar">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Agregar event listeners
  const projectButton = newProjectItem.querySelector('.project-nav-item');
  const editButton = newProjectItem.querySelector('.edit-project-btn');
  const deleteButton = newProjectItem.querySelector('.delete-project-btn');
  
  projectButton.addEventListener('click', () => {
    switchToProject(projectId);
  });
  
  editButton.addEventListener('click', (e) => {
    e.stopPropagation();
    editProject(projectId);
  });
  
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteProject(projectId);
  });
  
  projectsList.appendChild(newProjectItem);
}

/**
 * Edita un proyecto existente
 */
function editProject(projectId) {
  const project = projects[projectId];
  if (!project || project.isDefault) return;
  
  // Llenar el modal con los datos actuales
  const nameInput = $('#new-project-name');
  const descriptionInput = $('#new-project-description');
  const colorSelect = $('#new-project-color');
  const modal = $('#new-project-modal');
  const createBtn = $('#btn-create-new-project');
  
  if (nameInput && descriptionInput && colorSelect && modal && createBtn) {
    nameInput.value = project.name;
    descriptionInput.value = project.description;
    colorSelect.value = project.color;
    
    // Cambiar el texto del botón
    createBtn.textContent = 'Actualizar Lista';
    
    // Cambiar el título del modal
    const modalTitle = modal.querySelector('h3');
    if (modalTitle) modalTitle.textContent = '✏️ Editar Lista';
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Cambiar el comportamiento del botón para actualizar
    createBtn.onclick = () => updateProject(projectId);
  }
}

/**
 * Actualiza un proyecto existente
 */
async function updateProject(projectId) {
  const nameInput = $('#new-project-name');
  const descriptionInput = $('#new-project-description');
  const colorSelect = $('#new-project-color');
  const modal = $('#new-project-modal');
  
  if (!nameInput || !colorSelect) return;
  
  const name = nameInput.value.trim();
  const description = descriptionInput ? descriptionInput.value.trim() : '';
  const color = colorSelect.value;
  
  if (!name) {
    alert('Por favor ingresa un nombre para la lista');
    return;
  }
  
  // Actualizar proyecto
  projects[projectId] = {
    ...projects[projectId],
    name,
    description: description || `Lista: ${name}`,
    color,
    updatedAt: Date.now()
  };
  
  // Actualizar UI
  renderProjectsList();
  
  // Guardar cambios
  await saveUserProjects();
  
  // Cerrar modal y resetear
  closeAndResetModal();
  
  console.log('✅ Lista actualizada:', projects[projectId]);
}

/**
 * Elimina un proyecto
 */
async function deleteProject(projectId) {
  const project = projects[projectId];
  if (!project || project.isDefault) return;
  
  if (!confirm(`¿Estás seguro de que querés eliminar la lista "${project.name}"? Esta acción no se puede deshacer.`)) {
    return;
  }
  
  // Eliminar proyecto
  delete projects[projectId];
  
  // Si era el proyecto activo, cambiar al inbox
  if (currentProject === projectId) {
    switchToProject('inbox');
  }
  
  // Actualizar UI
  renderProjectsList();
  
  // Guardar cambios
  await saveUserProjects();
  
  console.log('✅ Lista eliminada:', project.name);
}

/**
 * Cierra y resetea el modal
 */
function closeAndResetModal() {
  const modal = $('#new-project-modal');
  const nameInput = $('#new-project-name');
  const descriptionInput = $('#new-project-description');
  const colorSelect = $('#new-project-color');
  const createBtn = $('#btn-create-new-project');
  const modalTitle = modal?.querySelector('h3');
  
  if (modal) modal.classList.add('hidden');
  if (nameInput) nameInput.value = '';
  if (descriptionInput) descriptionInput.value = '';
  if (colorSelect) colorSelect.value = 'blue';
  if (createBtn) {
    createBtn.textContent = 'Crear Lista';
    createBtn.onclick = createNewProject;
  }
  if (modalTitle) modalTitle.textContent = '✨ Nueva Lista';
}
