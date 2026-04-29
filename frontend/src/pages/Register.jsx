import { SignUp } from "../lib/auth.jsx";

export default function Register() {
  return (
    <div className="pt-24 flex justify-center">
      <SignUp path="/register" routing="path" />
    </div>
  );
}
