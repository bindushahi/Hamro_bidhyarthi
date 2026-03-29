import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ onSwitch }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ email, full_name: fullName, phone_number: phone, password, role });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
        style={{ backgroundImage: "url('/LandingBg.png')" }}
      >
        <div className="w-full max-w-sm bg-white/30 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg text-center">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-emerald-600 text-lg">✓</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">
            Registration submitted
          </h2>
          <p className="text-sm text-white/80 mb-6">
            Your account is pending admin approval. You'll be able to sign in once approved.
          </p>
          <button
            onClick={onSwitch}
            className="text-sm text-white font-medium hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/LandingBg.png')" }}
    >
      <div className="w-full max-w-sm bg-white/30 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-black/80 mt-1">
            Your account will need admin approval
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder="Ram Kumar Shrestha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder="you@school.edu.np"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder="+977 98XXXXXXXX"
            />
            <p className="text-xs text-black/70 mt-1">OTP will be sent to this number via SMS</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1.5">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {["teacher", "counselor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    role === r
                      ? "border-black bg-black text-white"
                      : "border-white/40 text-black/70 hover:border-white/60"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-600/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-black/70 mt-6">
          Already have an account?{" "}
          <button onClick={onSwitch} className="text-blue-600 font-medium hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}