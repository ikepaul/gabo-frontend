import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../../firebase/firebase";

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
      <button onClick={signIn}>Sign In</button>
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
      <button onClick={signUp}>Sign Up</button>
    </div>
  );
}
