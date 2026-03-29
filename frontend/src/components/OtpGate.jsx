import { useState } from "react";
import { requestElevate, verifyElevate } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../i18n";
import { Lock } from "lucide-react";

export default function OtpGate({ children }) {
  const { elevated, elevate } = useAuth();
  const { t } = useLanguage();
  const [otp, setOtp] = useState("");
  const [sentVia, setSentVia] = useState(null);
  const [demoOtp, setDemoOtp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  if (elevated) return children;

  async function handleRequest() {
    setError("");
    setLoading(true);
    try {
      const res = await requestElevate();
      setSentVia(res.sent_via);
      setDemoOtp(res.demo_otp);
      setRequested(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyElevate(otp);
      elevate(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-80">
      <div className="w-full max-w-xs text-center">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Lock size={18} className="text-gray-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          {t("otp_verification_required")}
        </h2>
        <p className="text-sm text-gray-400 mb-5">
          {t("otp_sensitive_data")}
        </p>

        {!requested ? (
          <button
            onClick={handleRequest}
            disabled={loading}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? t("otp_sending") : t("otp_send")}
          </button>
        ) : (
          <form onSubmit={handleVerify} className="space-y-3">
            {sentVia === "sms" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-left">
                <p className="text-xs text-emerald-700">{t("auth_check_phone")}</p>
              </div>
            )}
            {demoOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-left">
                <p className="text-xs text-amber-700">
                  {t("otp_demo")} <span className="font-mono font-bold">{demoOtp}</span>
                </p>
              </div>
            )}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              autoFocus
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-center text-base font-mono tracking-widest focus:outline-none focus:border-gray-400"
              placeholder="000000"
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? t("auth_verifying") : t("auth_verify")}
            </button>
          </form>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-3">{error}</p>
        )}
      </div>
    </div>
  );
}
