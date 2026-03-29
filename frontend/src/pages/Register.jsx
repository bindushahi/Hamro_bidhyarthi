import { useState } from "react";
import { registerUser } from "../api";
import { useLanguage } from "../i18n";

export default function Register({ onSwitch }) {
  const { t } = useLanguage();
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
          <h2 className="text-lg font-semibold text-white mb-1">{t("reg_submitted")}</h2>
          <p className="text-sm text-white/80 mb-6">{t("reg_pending")}</p>
          <button
            onClick={onSwitch}
            className="text-sm text-white font-medium hover:underline"
          >
            {t("auth_back_signin")}
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
          <h1 className="text-2xl font-semibold text-black tracking-tight">{t("reg_create")}</h1>
          <p className="text-sm text-black/80 mt-1">{t("reg_needs_approval")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">{t("reg_full_name")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder={t("reg_name_placeholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">{t("auth_email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder={t("auth_email_placeholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">{t("reg_phone")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder={t("reg_phone_placeholder")}
            />
            <p className="text-xs text-black/70 mt-1">{t("reg_phone_hint")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1">{t("auth_password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-black/40 rounded-lg text-sm text-black placeholder-gray/70 focus:outline-none focus:border-white/80 bg-white/10"
              placeholder={t("reg_password_hint")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/90 mb-1.5">{t("reg_i_am_a")}</label>
            <div className="grid grid-cols-2 gap-2">
              {["teacher", "counselor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    role === r
                      ? "border-black bg-black text-white"
                      : "border-white/40 text-black/70 hover:border-white/60"
                  }`}
                >
                  {t(`role_${r}`)}
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
            {loading ? t("reg_registering") : t("reg_submit")}
          </button>
        </form>

        <p className="text-center text-sm text-black/70 mt-6">
          {t("reg_has_account")}{" "}
          <button onClick={onSwitch} className="text-blue-600 font-medium hover:underline">
            {t("auth_sign_in")}
          </button>
        </p>
      </div>
    </div>
  );
}
