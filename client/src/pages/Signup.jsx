import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { Button, SelectInput, TextInput } from "../components/ui";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
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
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      await axios.post("http://localhost:5000/api/auth/signup", payload);

      navigate("/", {
        state: {
          message: "Account created. Sign in to continue.",
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to create an account right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="TaskFlow"
      title="Create a workspace-ready account"
      subtitle="Choose your role, join the board, and start moving work through a clear process."
    >
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-slate-500">
          Get started
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">Signup</h2>
      </div>

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
          label="Name"
          type="text"
          name="name"
          placeholder="Full name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

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
          placeholder="Create password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <SelectInput
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </SelectInput>

        <Button
          type="submit"
          icon={UserPlus}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?
        <Link to="/" className="ml-2 font-semibold text-slate-950">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;
