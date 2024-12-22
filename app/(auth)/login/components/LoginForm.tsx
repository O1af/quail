import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignInWithGoogleButton from "./SignInWithGoogleButton";

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Sign in with a provider below</CardDescription>
      </CardHeader>
      <CardContent>
        <form action="">
          <div className="grid gap-4">
            <div className="grid gap-2"></div>
            <SignInWithGoogleButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
