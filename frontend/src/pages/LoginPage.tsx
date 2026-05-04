    import * as React from "react";
    import { useNavigate } from "react-router-dom";
    import { ApiError } from "@/api/http";
    import { useLogin } from "@/api/resources";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { toast } from "@/hooks/use-toast";

    export default function LoginPage() {
        const navigate = useNavigate();
        const login = useLogin();

        const [email, setEmail] = React.useState("");
        const [password, setPassword] = React.useState("");

        const handleLogin = async (e: React.FormEvent) => {
            e.preventDefault();

            const normalizedEmail = email.trim();
            const normalizedPassword = password;

            if (!normalizedEmail || !normalizedPassword) {
                toast({
                    title: "Login xətası",
                    description: "Email və şifrə boş ola bilməz.",
                    variant: "destructive",
                });
                return;
            }

            try {
                await login.mutateAsync({ email: normalizedEmail, password: normalizedPassword });

                toast({
                    title: "Uğurlu giriş",
                    description: "Sistemə daxil oldunuz.",
                });

                navigate("/dashboard", { replace: true });
            } catch (err) {
                console.log(err);

                const errorDescription =
                    err instanceof ApiError
                        ? err.message
                        : "Email və ya şifrə yanlışdır.";
                
                toast({
                    title: "Login xətası",
                    description: errorDescription,
                    variant: "destructive",
                });
            }
        };

        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <form
                    onSubmit={handleLogin}
                    className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-card"
                >
                    <h1 className="mb-6 text-center text-2xl font-bold">CRM Login</h1>

                    <div className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            type="password"
                            placeholder="Şifrə"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button className="w-full" type="submit" disabled={login.isPending}>
                            {login.isPending ? "Giriş edilir..." : "Daxil ol"}
                        </Button>
                    </div>
                </form>
            </div>
        );
    }
