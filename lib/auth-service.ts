import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"

import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/config"

export type User = {
  uid: string
  email: string | null
}

function mapUser(user: { uid: string; email: string | null }): User {
  return {
    uid: user.uid,
    email: user.email,
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const auth = getFirebaseAuth()
    const credentials = await signInWithEmailAndPassword(auth, email, password)
    return mapUser(credentials.user)
  } catch (error) {
    throw error
  }
}

export async function register(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const auth = getFirebaseAuth()
    const db = getFirebaseDb()
    const credentials = await createUserWithEmailAndPassword(auth, email, password)
    const { user } = credentials

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
    })

    return mapUser(user)
  } catch (error) {
    throw error
  }
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth()
  await signOut(auth)
}

export function getCurrentUser(): Promise<User | null> {
  const auth = getFirebaseAuth()
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (!user) {
        resolve(null)
        return
      }

      resolve(mapUser(user))
    })
  })
}
