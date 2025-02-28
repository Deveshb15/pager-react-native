import { useEffect, useMemo, useState } from "react";

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  onAuthStateChanged,
  getReactNativePersistence,
} from "firebase/auth";

import firebaseConfig from "@utils/firebase";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default function useFirebase(props = {}) {
  const { onLogout } = props;
  const [user, setUser] = useState(undefined);

  const { isLoading: loggingOut, mutate: logout } = useMutation(
    () => auth.signOut(),
    { onSuccess: () => onLogout() },
  );

  useEffect(() => {
    const authListener = onAuthStateChanged(auth, (user) => {
      console.log("user", user);
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener();
    };
  }, []);

  return useMemo(
    () => ({
      auth,
      firestore,
      logout,
      loggingOut,
      storage,
      user,
    }),
    [loggingOut, logout, user],
  );
}
