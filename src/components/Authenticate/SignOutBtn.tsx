import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebase/firebase";
import { ComponentPropsWithoutRef } from "react";

export default function SignOutBtn({
  ...rest
}: ComponentPropsWithoutRef<"button">) {
  const handleSignOut = () => {
    const auth = getAuth(app);
    signOut(auth).catch((error) => {
      console.error(error);
    });
  };
  return (
    <>
      <button {...rest} onClick={handleSignOut}>
        Sign out
      </button>
    </>
  );
}
