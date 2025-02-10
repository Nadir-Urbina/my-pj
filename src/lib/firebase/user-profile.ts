import { db } from '../firebase'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

export interface UserProfile {
  fullName: string
  username: string
  email: string
  photoURL: string
  bio: string
  dateOfBirth: string
  joinedAt: string
  badges: string[]
  ministryRole: string
  homebaseMinistry: string
  spiritualLeader: string
  spiritualGifts: string[]
  prayerPartners: string[]
  journalCount: number
  lastActive: string
}

export const createUserProfile = async (userId: string, userData: any) => {
  const userProfile = {
    ...userData,
    // Add lowercase fields for searching
    emailLower: userData.email.toLowerCase(),
    displayNameLower: userData.fullName.toLowerCase(),
  }
  
  // Create the user profile
  await setDoc(doc(db, "users", userId), userProfile)
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, 'users', userId)
  await updateDoc(userRef, updates)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId)
  const docSnap = await getDoc(userRef)
  return docSnap.exists() ? docSnap.data() as UserProfile : null
}

export function generateUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    + Math.floor(Math.random() * 1000)
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('username', '==', username.toLowerCase()))
  const querySnapshot = await getDocs(q)
  return querySnapshot.empty
} 