import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginSuperAdmin } from '../../services/auth/superadmin';
import { saveToken } from '../../services/auth/storage';

export default function LoginSuperAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[#f8f8f8] to-[#eeeeee]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-[#A11B1B] flex items-center justify-center shadow-lg shadow-[#A11B1B]/20 mb-4">
            <span className="text-white font-bold text-xl">EV</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#565556] text-center">
            Connexion Superadmin
          </h1>
          <p className="text-[#A5A6A5] text-sm mt-1 text-center">
            Accédez à votre espace de gestion
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 border border-[#e5e5e5]">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setLoading(true);
              try {
                const res = await loginSuperAdmin({ email, mot_de_passe: password });
                saveToken(res.token);
                navigate('/superadmin');
              } catch (err: unknown) {
                const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Email ou mot de passe incorrect';
                setError(msg);
              } finally {
                setLoading(false);
              }
            }}
            className="flex flex-col gap-5"
          >
            {error && (
              <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sa-email" className="text-sm font-medium text-[#565556]">
                Email
              </label>
              <input
                id="sa-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@eazyvisa.com"
                className="px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] bg-white placeholder:text-[#A5A6A5] outline-none transition-all duration-200 focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="sa-password" className="text-sm font-medium text-[#565556]">
                  Mot de passe
                </label>
                <a href="#" className="text-xs text-[#A11B1B] hover:underline font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                id="sa-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] bg-white placeholder:text-[#A5A6A5] outline-none transition-all duration-200 focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 px-4 rounded-lg bg-[#A11B1B] text-white text-sm font-semibold shadow-md shadow-[#A11B1B]/20 hover:bg-[#8a1616] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/connexion"
            className="text-sm text-[#A5A6A5] hover:text-[#A11B1B] transition-colors duration-200 font-medium"
          >
            ← Connexion Admin / Employé
          </Link>
        </div>
      </div>
    </div>
  );
}
