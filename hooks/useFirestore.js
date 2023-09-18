import { useCallback } from "react";

import { collection, getDocs, query, where } from "firebase/firestore";

import useFirebase from "@hooks/useFirebase";

export default function useFirestore() {
  const { firestore } = useFirebase();

  const checkHandle = useCallback(
    async (handle) => {
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("handle", "==", handle));
        const users = await getDocs(q);
        return { exists: users.size > 0 };
      } catch (error) {
        throw error;
      }
    },
    [firestore],
  );

  const getUserByNumber = useCallback(
    async (number) => {
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("phone.full", "==", number));
        const users = await getDocs(q);

        return {
          exists: users.size > 0,
          success: true,
          user:
            users.size > 0
              ? { id: users.docs[0].id, ...users.docs[0].data() }
              : null,
        };
      } catch (error) {
        throw error;
      }
    },
    [firestore],
  );

  return { checkHandle, getUserByNumber };
}
