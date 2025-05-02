import { Input } from '@/components/ui/input';
import { login, signup } from './actions';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <form>
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
  );
}
