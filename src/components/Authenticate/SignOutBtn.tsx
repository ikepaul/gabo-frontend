import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebase/firebase";
import { ComponentPropsWithoutRef } from "react";
import Button from "../Reusable/Button/Button";

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
    <Button {...rest} onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
