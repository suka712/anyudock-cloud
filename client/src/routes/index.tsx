import { createRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { api, ApiError } from "@/lib/api";
import { authQueryOptions } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Github,
  Cloud,
  Share2,
  Key,
  Users,
  ArrowRight,
  Mail,
  Loader2,
} from "lucide-react";
import "../index.css";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: user, isLoading: authLoading } = useQuery(authQueryOptions);

  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailInput = (formData.get("email") as string).trim();

    try {
      await api("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: emailInput }),
      });
      setEmail(emailInput);
      setStep("verify");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const code = (formData.get("code") as string).trim();

    try {
      await api("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Invalid or expired code",
      );
    } finally {
      setLoading(false);
    }
  };

  const contributors = [
    "Anh D Tran",
    "Bush",
    "khiem",
    "suka712",
    "Thai",
    "Trinh Thu",
  ];

  return (
    <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-background">
      {/* Header */}
      <nav className="border-b-4 border-primary p-6 flex justify-between items-center bg-background sticky top-0 z-50">
        <Link
          to="/"
          className="text-3xl font-black uppercase tracking-tighter italic border-3 border-primary pr-1"
        >
          AnyuDock
        </Link>
        <a
          href="https://github.com/suka712/anyudock-cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-primary hover:text-background p-2 transition-colors border-2 border-transparent hover:border-primary"
        >
          <Github size={32} />
        </a>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="p-6 md:p-20 grid lg:grid-cols-2 gap-12 items-center border-b-4 border-primary">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-none tracking-tighter">
              Simple S3 <br /> Storage.
            </h1>
            <p className="text-xl md:text-2xl font-medium border-l-8 border-primary pl-6 max-w-xl">
              Share files and env configs between machines with zero friction.
              Brutalist by design, minimal by nature.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="bg-primary text-background px-4 py-2 text-lg font-bold">
                FAST
              </div>
              <div className="border-4 border-primary px-4 py-2 text-lg font-bold">
                SECURE
              </div>
              <div className="bg-primary text-background px-4 py-2 text-lg font-bold">
                RAW
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md rounded-none border-4 border-primary shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-background overflow-hidden">
              <CardHeader className="bg-primary text-background border-b-4 border-primary">
                <CardTitle className="text-4xl font-black uppercase italic tracking-tighter">
                  Anyudock
                </CardTitle>
                <CardDescription className="text-background/80 font-bold">
                  {user ? (
                    `Welcome back`
                  ) : step === "email" ? (
                    "Enter your email to receive a verification code."
                  ) : (
                    `We sent a 6-digit code to ${email}`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {authLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-primary" size={48} />
                  </div>
                ) : user ? (
                  <div className="flex flex-col justify-center">
                    <Label htmlFor="email" className="text-lg font-black uppercase pb-2">
                      Logged in as {user.email}
                    </Label>
                    <Button
                      onClick={() => navigate({ to: "/dashboard" })}
                      className="rounded-none border-4 border-primary bg-background text-primary hover:bg-primary hover:text-background transition-all p-8 text-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.75 hover:translate-y-0.75"
                    >
                      GO TO DASHBOARD
                      <ArrowRight className="ml-2" />
                    </Button>
                    <p className="text-sm font-black uppercase text-center text-muted-foreground italic pt-5">
                      You are signed in.
                    </p>
                  </div>
                ) : step === "email" ? (
                  <form
                    onSubmit={handleSendOtp}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-3">
                      <Label
                        htmlFor="email"
                        className="text-lg font-black uppercase"
                      >
                        Email Address
                      </Label>
                      <div className="relative group">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="YOU@EXAMPLE.COM"
                          required
                          autoFocus
                          className="rounded-none border-4 border-primary p-6 text-lg focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 uppercase font-black"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {error && (
                      <p className="p-4 bg-destructive text-destructive-foreground font-black border-4 border-primary uppercase italic">
                        {error}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-none border-4 border-primary bg-background text-primary hover:bg-primary hover:text-background transition-all p-8 text-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.75 hover:translate-y-0.75"
                    >
                      {loading ? "SENDING..." : "GET CODE"}
                      <ArrowRight className="ml-2" />
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleVerifyOtp}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-3">
                      <Label
                        htmlFor="code"
                        className="text-lg font-black uppercase"
                      >
                        Verification Code
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="000000"
                        required
                        autoFocus
                        className="rounded-none border-4 border-primary p-6 text-3xl tracking-[1rem] text-center focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 font-black"
                      />
                    </div>
                    {error && (
                      <p className="p-4 bg-destructive text-destructive-foreground font-black border-4 border-primary uppercase italic">
                        {error}
                      </p>
                    )}
                    <div className="flex flex-col gap-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="rounded-none border-4 border-primary bg-background text-primary hover:bg-primary hover:text-background transition-all p-8 text-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.75 hover:translate-y-0.75"
                      >
                        {loading ? "VERIFYING..." : "LOG IN"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setError("");
                        }}
                        className="text-sm font-black uppercase underline decoration-4 underline-offset-4 hover:text-muted-foreground transition-colors"
                      >
                        ← Back to email
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="p-6 md:p-20 border-b-4 border-primary bg-primary text-background">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 italic">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Cloud,
                title: "S3 Integration",
                desc: "Effortless integration with any S3 provider. Your data, your rules.",
              },
              {
                icon: Share2,
                title: "Quick Sharing",
                desc: "Share your files with a simple, secure link. No tracking, no bullshit.",
              },
              {
                icon: Key,
                title: "Env Management",
                desc: "Distribute environment configs across systems in seconds.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="border-4 border-background p-8 space-y-4 hover:bg-background hover:text-primary transition-colors group"
              >
                <f.icon
                  size={48}
                  className="group-hover:scale-110 transition-transform"
                />
                <h3 className="text-2xl font-black uppercase">{f.title}</h3>
                <p className="font-bold text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contributors Section */}
        <section className="p-6 md:p-20 bg-background border-b-4 border-primary overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none text-primary">
            <Users size={400} />
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 italic">
            The Squad
          </h2>
          <div className="flex flex-wrap gap-4">
            {contributors.map((name, i) => (
              <div
                key={i}
                className="border-4 border-primary px-8 py-4 text-xl font-black uppercase bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                {name}
              </div>
            ))}
          </div>
          <div className="mt-16 border-8 border-primary p-12 text-center relative bg-background">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background px-4 text-2xl font-black uppercase italic">
              Join Us
            </div>
            <p className="text-2xl md:text-4xl font-black uppercase mb-8">
              Want to make AnyuDock better?
            </p>
            <a
              href="https://github.com/anyudock/anyudock-cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-background px-12 py-6 text-3xl font-black uppercase hover:bg-background hover:text-primary border-4 border-primary transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.25 hover:translate-y-1.25"
            >
              Contribute on GitHub
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-10 text-center font-black uppercase tracking-widest text-sm border-t-4 border-primary">
        AnyuDock Cloud © {new Date().getFullYear()} — Built for Speed.
      </footer>
    </div>
  );
};

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});
