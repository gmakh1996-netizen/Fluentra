import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthState } from "@/app/(auth)/actions";

/** Inline success/error feedback for auth forms. ARIA live for screen readers. */
export function AuthMessage({ state }: { state?: AuthState }) {
  if (!state?.error && !state?.success) return null;
  const isError = Boolean(state.error);
  return (
    <div aria-live="polite">
      <Alert variant={isError ? "destructive" : "success"}>
        {isError ? <AlertCircle /> : <CheckCircle2 />}
        <AlertDescription>{state.error ?? state.success}</AlertDescription>
      </Alert>
    </div>
  );
}
