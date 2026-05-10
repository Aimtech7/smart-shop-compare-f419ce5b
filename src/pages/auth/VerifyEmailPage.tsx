import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const key = searchParams.get("key");
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verify = async () => {
      if (!key) {
        setStatus("error");
        setMessage("Missing verification key.");
        return;
      }

      try {
        await verifyEmail(key);
        setStatus("success");
        setMessage("Your email has been verified! You can now log in to your account.");
        toast.success("Email verified successfully");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Invalid or expired verification link.");
      }
    };

    verify();
  }, [key]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/40 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">TB</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
          <CardDescription>Completing your THA BUYER registration</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center space-y-6 pb-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Verifying your email address...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-muted-foreground">{message}</p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 transition-all">
                <Link to="/auth/login">Continue to Login</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-destructive" />
              <p className="text-destructive font-medium">{message}</p>
              <div className="flex flex-col w-full gap-3">
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/auth/signup">Try Signing Up Again</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full h-12">
                  <Link to="/help">Contact Support</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
