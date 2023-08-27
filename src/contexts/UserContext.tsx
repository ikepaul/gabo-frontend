import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { createContext, useState, ReactNode, useEffect } from "react";
import { app } from "../firebase/firebase";
import Authenticate from "../components/Authenticate/Authenticate";

const UserContext = createContext<User | null>(null);

interface Props {
  children: ReactNode;
}
function UserProvider(props: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={user}>
      {user ? props.children : <Authenticate />}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };
