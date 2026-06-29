import { signInWithOAuth } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { GoogleIcon, AppleIcon } from "@/components/auth/brand-icons";

/**
 * Google + Apple sign-in. Each is a tiny form posting to the `signInWithOAuth`
 * server action, which redirects to the provider's consent screen. Works
 * without client JS (progressive enhancement).
 */
export function OAuthButtons({ next }: { next?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="google" />
        {next && <input type="hidden" name="next" value={next} />}
        <Button type="submit" variant="outline" className="w-full" size="lg">
          <GoogleIcon className="size-4" />
          Google
        </Button>
      </form>
      <form action={signInWithOAuth}>
        <input type="hidden" name="provider" value="apple" />
        {next && <input type="hidden" name="next" value={next} />}
        <Button type="submit" variant="outline" className="w-full" size="lg">
          <AppleIcon className="size-4" />
          Apple
        </Button>
      </form>
    </div>
  );
}
