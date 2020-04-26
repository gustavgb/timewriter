import { auth, authProvider } from 'api'

export const login = () => auth.signInWithPopup(authProvider)
