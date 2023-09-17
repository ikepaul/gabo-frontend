import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app, firestore } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import Button from "../Reusable/Button/Button";

export default function Authenticate() {
  const [emailIn, setEmailIn] = useState<string>("");
  const [passwordIn, setPasswordIn] = useState<string>("");
  const [emailUp, setEmailUp] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [passwordUp, setPasswordUp] = useState<string>("");

  const signIn = () => {
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, emailIn, passwordIn).catch((error) => {
      console.error(error);
    });
  };

  const signUp = () => {
    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, emailUp, passwordUp)
      .then((userCredential) => {
        // Signed in
        updateProfile(userCredential.user, {
          displayName,
        });
        setDoc(doc(firestore, "users", userCredential.user.uid), {
          cardBackTheme: "plain_black",
          cardFrontTheme: "dark_2color_0",
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div>
      <h3>Sign In</h3>
      <input
        type="text"
        value={emailIn}
        onChange={(e) => setEmailIn(e.target.value)}
        placeholder="Email"
      />
      <input
        type="text"
        value={passwordIn}
        onChange={(e) => setPasswordIn(e.target.value)}
        placeholder="Password"
      />
      <Button onClick={signIn}>Sign In</Button>
      <br />
      <br />
      <h3>Sign Up</h3>
      <input
        type="text"
        value={emailUp}
        onChange={(e) => setEmailUp(e.target.value)}
        placeholder="Email"
      />
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="text"
        value={passwordUp}
        onChange={(e) => setPasswordUp(e.target.value)}
        placeholder="Password"
      />
      <Button onClick={signUp}>Sign Up</Button>
    </div>
  );
}
