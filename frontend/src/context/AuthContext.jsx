import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const signup = async (email, password, displayName, role, extraData = {}) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName });

    const idToken = await userCred.user.getIdToken();

    const registerRes = await api.post(
      '/auth/register',
      { email, password, displayName, role, ...extraData },
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    setUserProfile({ uid: userCred.user.uid, email, displayName, role, ...extraData });
    await userCred.user.getIdToken(true);
    return userCred;
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setToken(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const idToken = await user.getIdToken();
          setToken(idToken);
          const profileRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          setUserProfile(profileRes.data);
        } catch (err) {
          console.error('Failed to fetch user profile:', err.message);
          if (err.message?.includes('Invalid token') || err.message?.includes('Token expired')) {
            await signOut(auth);
            setCurrentUser(null);
            setUserProfile(null);
            setToken(null);
          }
        }
      } else {
        setUserProfile(null);
        setToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!currentUser) return;
    try {
      const idToken = await currentUser.getIdToken(true);
      setToken(idToken);
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error('Profile refresh failed:', err.message);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    token,
    signup,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
