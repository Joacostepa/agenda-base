// Módulo para integración con Firebase

/**
 * Configuración de Firebase (completar para habilitar Google Sign-In)
 */
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyANeT4ku6NwEFwkjWikExQi7wN22NuFVNw",
  authDomain: "agenda-andamios.firebaseapp.com",
  projectId: "agenda-andamios",
  storageBucket: "agenda-andamios.firebasestorage.app",
  messagingSenderId: "17277902551",
  appId: "1:17277902551:web:dfa5ea3aef2b0c288a1a92"
};

let Firebase = null; // { app, auth, db, providers }

/**
 * Intenta inicializar Firebase
 * @returns {Object|null} Instancia de Firebase o null si falla
 */
export async function tryInitFirebase() {
  const cfg = FIREBASE_CONFIG || {};
  const hasConfig = cfg.apiKey && cfg.projectId && cfg.appId;
  
  if (!hasConfig) {
    console.log('Firebase no configurado - usando modo invitado');
    return null;
  }

  try {
    const [
      { initializeApp },
      { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut },
      { getFirestore, collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, getDocs, setDoc }
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'),
    ]);

    const app = initializeApp(cfg);
    const auth = getAuth(app);
    const db = getFirestore(app);

    Firebase = {
      app,
      auth,
      db,
      providers: { google: new GoogleAuthProvider() },
      helpers: {
        collection,
        query,
        where,
        orderBy,
        addDoc,
        updateDoc,
        deleteDoc,
        doc,
        getDocs,
        setDoc,
        signInWithPopup,
        onAuthStateChanged,
        signOut
      }
    };

    console.log('Firebase inicializado correctamente');
    return Firebase;
  } catch (error) {
    console.warn('No se pudo inicializar Firebase:', error);
    return null;
  }
}

/**
 * Obtiene la instancia de Firebase
 * @returns {Object|null} Instancia de Firebase
 */
export function getFirebase() {
  return Firebase;
}

/**
 * Obtiene las tareas de Firestore para un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de tareas
 */
export async function fetchFirestoreTasks(userId) {
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { collection, query, where, orderBy, getDocs } = Firebase.helpers;
  
  try {
    const q = query(
      collection(Firebase.db, 'tasks'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error al obtener tareas de Firestore:', error);
    throw error;
  }
}

/**
 * Agrega una nueva tarea en Firestore
 * @param {string} userId - ID del usuario
 * @param {string} title - Título de la tarea
 * @returns {Promise<Object>} Tarea creada
 */
export async function addFirestoreTask(userId, title, dueDate = null) {
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { collection, addDoc } = Firebase.helpers;
  
  try {
    const docRef = await addDoc(collection(Firebase.db, 'tasks'), {
      ownerId: userId,
      title,
      done: false,
      createdAt: Date.now(),
      dueDate: dueDate ? new Date(dueDate).getTime() : null
    });

    return {
      id: docRef.id,
      ownerId: userId,
      title,
      done: false,
      createdAt: Date.now(),
      dueDate: dueDate ? new Date(dueDate).getTime() : null
    };
  } catch (error) {
    console.error('Error al agregar tarea en Firestore:', error);
    throw error;
  }
}

/**
 * Cambia el estado de una tarea en Firestore
 * @param {string} userId - ID del usuario
 * @param {string} id - ID de la tarea
 * @returns {Promise<Object|null>} Tarea actualizada o null si no se encuentra
 */
export async function toggleFirestoreTask(userId, id) {
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  try {
    // Obtener el estado actual de la tarea
    const list = await fetchFirestoreTasks(userId);
    const current = list.find(t => t.id === id);
    
    if (!current) return null;

    const { updateDoc, doc } = Firebase.helpers;
    await updateDoc(doc(Firebase.db, 'tasks', id), {
      done: !current.done
    });

    return { ...current, done: !current.done };
  } catch (error) {
    console.error('Error al cambiar estado de tarea en Firestore:', error);
    throw error;
  }
}

/**
 * Elimina una tarea de Firestore
 * @param {string} userId - ID del usuario
 * @param {string} id - ID de la tarea
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
export async function removeFirestoreTask(userId, id) {
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { deleteDoc, doc } = Firebase.helpers;
  
  try {
    await deleteDoc(doc(Firebase.db, 'tasks', id));
    return true;
  } catch (error) {
    console.error('Error al eliminar tarea de Firestore:', error);
    throw error;
  }
}

/**
 * Actualiza una tarea existente en Firestore
 * @param {string} userId - ID del usuario
 * @param {string} id - ID de la tarea
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object|null>} Tarea actualizada o null si no se encuentra
 */
export async function updateFirestoreTask(userId, id, updates) {
  if (!Firebase) {
    throw new Error('Firebase no está inicializado');
  }

  const { updateDoc, doc } = Firebase.helpers;
  
  try {
    await updateDoc(doc(Firebase.db, 'tasks', id), updates);
    
    // Obtener la tarea actualizada
    const list = await fetchFirestoreTasks(userId);
    return list.find(t => t.id === id) || null;
  } catch (error) {
    console.error('Error al actualizar tarea en Firestore:', error);
    throw error;
  }
}
