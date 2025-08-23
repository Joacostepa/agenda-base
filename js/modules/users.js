// Módulo para gestión de usuarios del sistema

import { getFirebase } from './firebase.js';
import { toast } from '../utils/helpers.js';

/**
 * Estado global de usuarios
 */
let users = [];
let currentUserProfile = null;

/**
 * Callbacks para cambios en usuarios
 */
const usersChangeCallbacks = [];

/**
 * Registra un callback para cambios en usuarios
 * @param {Function} callback - Función a ejecutar cuando cambien los usuarios
 */
export function onUsersChange(callback) {
  usersChangeCallbacks.push(callback);
  // Ejecutar inmediatamente si ya hay usuarios
  if (users.length > 0) {
    callback(users);
  }
}

/**
 * Notifica a todos los listeners sobre cambios en usuarios
 */
function notifyUsersChange() {
  usersChangeCallbacks.forEach(callback => callback([...users]));
}

/**
 * Obtiene todos los usuarios del sistema
 * @returns {Array} Lista de usuarios
 */
export function getUsers() {
  return [...users];
}

/**
 * Obtiene el perfil del usuario actual
 * @returns {Object|null} Perfil del usuario actual
 */
export function getCurrentUserProfile() {
  return currentUserProfile;
}

/**
 * Establece el perfil del usuario actual
 * @param {Object} profile - Perfil del usuario
 */
export function setCurrentUserProfile(profile) {
  currentUserProfile = profile;
}

/**
 * Carga todos los usuarios del sistema
 * @returns {Promise<void>}
 */
export async function loadUsers() {
  try {
    const firebaseUsers = await fetchFirestoreUsers();
    users = firebaseUsers;
    notifyUsersChange();
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    toast('Error al cargar la lista de usuarios');
    users = [];
    notifyUsersChange();
  }
}

/**
 * Crea o actualiza el perfil de un usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario creado/actualizado
 */
export async function createOrUpdateUser(userData) {
  try {
    const { uid, displayName, email, photoURL } = userData;
    
    if (!uid || !displayName || !email) {
      throw new Error('Datos de usuario incompletos');
    }

    const userProfile = {
      uid,
      displayName,
      email,
      photoURL: photoURL || null,
      createdAt: Date.now(),
      lastSeen: Date.now(),
      isActive: true
    };

    const result = await saveUserToFirestore(userProfile);
    
    // Actualizar lista local
    const existingIndex = users.findIndex(u => u.uid === uid);
    if (existingIndex > -1) {
      users[existingIndex] = result;
    } else {
      users.unshift(result);
    }
    
    notifyUsersChange();
    return result;
  } catch (error) {
    console.error('Error al crear/actualizar usuario:', error);
    toast('Error al guardar perfil de usuario');
    throw error;
  }
}

/**
 * Busca usuarios por nombre o email
 * @param {string} query - Término de búsqueda
 * @returns {Array} Usuarios que coinciden con la búsqueda
 */
export function searchUsers(query) {
  if (!query || query.trim().length === 0) {
    return [...users];
  }

  const searchTerm = query.toLowerCase().trim();
  
  return users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  );
}

/**
 * Obtiene un usuario por su UID
 * @param {string} uid - UID del usuario
 * @returns {Object|null} Usuario encontrado o null
 */
export function getUserById(uid) {
  return users.find(user => user.uid === uid) || null;
}

/**
 * Actualiza el estado de actividad de un usuario
 * @param {string} uid - UID del usuario
 * @param {boolean} isActive - Estado de actividad
 */
export async function updateUserActivity(uid, isActive) {
  try {
    const user = getUserById(uid);
    if (!user) return;

    const updates = {
      isActive,
      lastSeen: Date.now()
    };

    await updateUserInFirestore(uid, updates);
    
    // Actualizar lista local
    const index = users.findIndex(u => u.uid === uid);
    if (index > -1) {
      users[index] = { ...users[index], ...updates };
      notifyUsersChange();
    }
  } catch (error) {
    console.error('Error al actualizar actividad del usuario:', error);
  }
}

/**
 * Obtiene estadísticas de usuarios
 * @returns {Object} Estadísticas de usuarios
 */
export function getUsersStats() {
  const total = users.length;
  const active = users.filter(u => u.isActive).length;
  const inactive = total - active;
  
  return { total, active, inactive };
}

// =========================
// Funciones de Firebase
// =========================

/**
 * Obtiene usuarios desde Firestore
 * @returns {Promise<Array>} Lista de usuarios
 */
async function fetchFirestoreUsers() {
  const Firebase = getFirebase();
  
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { collection, getDocs, orderBy } = Firebase.helpers;
  
  try {
    const querySnapshot = await getDocs(
      collection(Firebase.db, 'users')
    );
    
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener usuarios de Firestore:', error);
    throw error;
  }
}

/**
 * Guarda un usuario en Firestore
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario guardado
 */
async function saveUserToFirestore(userData) {
  const Firebase = getFirebase();
  
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { collection, doc, setDoc } = Firebase.helpers;
  
  try {
    const userRef = doc(Firebase.db, 'users', userData.uid);
    await setDoc(userRef, userData, { merge: true });
    
    return userData;
  } catch (error) {
    console.error('Error al guardar usuario en Firestore:', error);
    throw error;
  }
}

/**
 * Actualiza un usuario en Firestore
 * @param {string} uid - UID del usuario
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<void>}
 */
async function updateUserInFirestore(uid, updates) {
  const Firebase = getFirebase();
  
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { doc, updateDoc } = Firebase.helpers;
  
  try {
    const userRef = doc(Firebase.db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error al actualizar usuario en Firestore:', error);
    throw error;
  }
}
