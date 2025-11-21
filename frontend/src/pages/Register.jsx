import { SignUp } from "@clerk/clerk-react";

export default function Register() {
  return (
    <div className="pt-24 flex justify-center">
      <SignUp path="/register" routing="path" />
    </div>
  );
}
