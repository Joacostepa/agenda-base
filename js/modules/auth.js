// Módulo para manejo de autenticación

import { getFirebase } from './firebase.js';
import { toast } from '../utils/helpers.js';
import { createOrUpdateUser, setCurrentUserProfile } from './users.js';

/**
 * Estado del usuario autenticado
 */
let currentUser = null;

/**
 * Callbacks para cambios de estado de autenticación
 */
const authStateCallbacks = [];

/**
 * Obtiene el usuario actual
 * @returns {Object|null} Usuario actual o null si no hay sesión
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Establece el usuario actual
 * @param {Object} user - Objeto usuario
 */
export function setCurrentUser(user) {
  currentUser = user;
  // Notificar a todos los listeners
  authStateCallbacks.forEach(callback => callback(user));
}

/**
 * Registra un callback para cambios de estado de autenticación
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 */
export function onAuthStateChanged(callback) {
  authStateCallbacks.push(callback);
  // Ejecutar inmediatamente si ya hay un usuario
  if (currentUser) {
    callback(currentUser);
  }
}

/**
 * Inicia sesión con Google usando Firebase
 * @returns {Promise<Object>} Usuario autenticado
 */
export async function handleGoogleSignIn() {
  const Firebase = getFirebase();
  
  if (!Firebase) {
    toast('Configurá Firebase primero (ver comentarios en firebase.js).');
    throw new Error('Firebase no está configurado');
  }

  const { signInWithPopup } = Firebase.helpers;
  
  try {
    const result = await signInWithPopup(Firebase.auth, Firebase.providers.google);
    
    // Crear/actualizar perfil del usuario en la base de datos
    const userProfile = await createOrUpdateUser({
      uid: result.user.uid,
      displayName: result.user.displayName || 'Usuario',
      email: result.user.email,
      photoURL: result.user.photoURL
    });
    
    const user = {
      id: result.user.uid,
      displayName: result.user.displayName || 'Usuario',
      email: result.user.email,
      photoURL: result.user.photoURL,
      mode: 'firebase'
    };
    
    // Establecer usuario actual y perfil
    setCurrentUser(user);
    setCurrentUserProfile(userProfile);
    
    toast(`¡Bienvenido, ${user.displayName}!`);
    return user;
  } catch (error) {
    console.error('Error en inicio de sesión con Google:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      toast('Inicio de sesión cancelado');
    } else if (error.code === 'auth/popup-blocked') {
      toast('El popup fue bloqueado. Permite popups para este sitio.');
    } else {
      toast('No se pudo iniciar sesión. Intenta de nuevo.');
    }
    
    throw error;
  }
}

/**
 * Cierra la sesión del usuario
 * @returns {Promise<void>}
 */
export async function handleSignOut() {
  if (currentUser?.mode === 'firebase') {
    const Firebase = getFirebase();
    if (Firebase) {
      try {
        await Firebase.helpers.signOut(Firebase.auth);
      } catch (error) {
        console.error('Error al cerrar sesión de Firebase:', error);
      }
    }
  }
  
  // Reset del usuario
  setCurrentUser(null);
  toast('Sesión cerrada');
}

/**
 * Entra como usuario invitado
 * @returns {Object} Usuario invitado
 */
export function enterAsGuest() {
  const guestUser = {
    id: 'guest_' + Date.now(),
    displayName: 'Invitado',
    email: null,
    photoURL: null,
    mode: 'guest'
  };
  
  setCurrentUser(guestUser);
  toast('Entraste como invitado (datos se guardan en este navegador).');
  return guestUser;
}

/**
 * Verifica si el usuario actual es invitado
 * @returns {boolean} true si es usuario invitado
 */
export function isGuestUser() {
  return currentUser?.mode === 'guest';
}

/**
 * Verifica si el usuario actual está autenticado con Firebase
 * @returns {boolean} true si está autenticado con Firebase
 */
export function isFirebaseUser() {
  return currentUser?.mode === 'firebase';
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean} true si hay usuario autenticado
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Obtiene el ID del usuario actual
 * @returns {string|null} ID del usuario o null si no hay sesión
 */
export function getCurrentUserId() {
  return currentUser?.id || null;
}

/**
 * Obtiene el nombre de visualización del usuario actual
 * @returns {string} Nombre del usuario o 'Usuario' por defecto
 */
export function getCurrentUserDisplayName() {
  return currentUser?.displayName || 'Usuario';
}

/**
 * Obtiene la URL de la foto del usuario actual
 * @returns {string|null} URL de la foto o null si no hay foto
 */
export function getCurrentUserPhotoURL() {
  return currentUser?.photoURL || null;
}

/**
 * Obtiene el modo de autenticación del usuario actual
 * @returns {string|null} 'guest', 'firebase' o null si no hay sesión
 */
export function getCurrentUserMode() {
  return currentUser?.mode || null;
}
