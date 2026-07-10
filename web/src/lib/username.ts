const STORAGE_KEY = 'excalihome-username'

export const getUsername = () => localStorage.getItem(STORAGE_KEY)

export const setUsername = (name: string) => localStorage.setItem(STORAGE_KEY, name.trim())

export const clearUsername = () => localStorage.removeItem(STORAGE_KEY)
