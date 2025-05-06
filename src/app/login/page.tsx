import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="w-full max-w-[400px] mx-auto flex flex-col gap-4 p-6 bg-background-dim rounded shadow">
        <label htmlFor="email">Email:</label>
        <Input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <Input id="password" name="password" type="password" required />
        <Button variant="default" formAction={login}>
          Log in
        </Button>
        <Button variant="secondary" formAction={signup}>
          Sign up
        </Button>
      </form>
    </div>
  );
}
