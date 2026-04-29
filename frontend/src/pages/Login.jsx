import { SignIn } from "../lib/auth.jsx";

export default function Login() {
  return (
    <div className="pt-24 flex justify-center">
      <SignIn path="/login" routing="path" />
    </div>
  );
}
