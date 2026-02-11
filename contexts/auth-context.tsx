"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { onAuthStateChanged } from "firebase/auth"

import {
  type UserSubscription,
  DEFAULT_SUBSCRIPTION,
  mapSubscription,
} from "@/lib/subscription-service"
import { doc, getDoc } from "firebase/firestore"
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  type User,
} from "@/lib/auth-service"
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/config"

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User | null>
  register: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUserSubscription = useCallback(
    async (uid: string): Promise<UserSubscription> => {
      const db = getFirebaseDb()
      const snapshot = await getDoc(doc(db, "users", uid))
      if (!snapshot.exists()) {
        return DEFAULT_SUBSCRIPTION
      }

      const data = snapshot.data() as { subscription?: unknown }
      return mapSubscription(data.subscription)
    },
    []
  )

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const subscription = await loadUserSubscription(firebaseUser.uid)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            subscription,
          })
        } catch {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            subscription: DEFAULT_SUBSCRIPTION,
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return unsubscribe
  }, [loadUserSubscription])

  const login = useCallback((email: string, password: string) => {
    return authLogin(email, password)
  }, [])

  const register = useCallback((email: string, password: string) => {
    return authRegister(email, password)
  }, [])

  const logout = useCallback(() => {
    return authLogout()
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user?.uid) {
      return
    }

    try {
      const subscription = await loadUserSubscription(user.uid)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              subscription,
            }
          : prev
      )
    } catch {
      // Keep existing user state when profile refresh fails.
    }
  }, [loadUserSubscription, user?.uid])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
