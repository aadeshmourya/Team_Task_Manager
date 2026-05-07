import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { Button, TextInput } from "../components/ui";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        payload
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="TaskFlow"
      title="Sign in to your team workspace"
      subtitle="A focused place to organize projects, assign work, and keep delivery moving."
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-slate-500">
          Welcome back
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Login</h2>
      </div>

      {location.state?.message && (
        <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {location.state.message}
        </div>
      )}

      {error && (
        <div
          className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <TextInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          icon={LogIn}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?
        <Link to="/signup" className="ml-2 font-semibold text-slate-950">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
