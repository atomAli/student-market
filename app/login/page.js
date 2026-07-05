import LoginForm from "./LoginForm";

export default function LoginPage({ searchParams }) {
  const callbackUrl = Array.isArray(searchParams?.callbackUrl)
    ? searchParams.callbackUrl[0]
    : searchParams?.callbackUrl || "/";

  return <LoginForm callbackUrl={callbackUrl} />;
}
