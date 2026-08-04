import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSuperAdmin } from '../../services/auth/superadmin';
import { saveToken } from '../../services/auth/storage';
import AuthLayout from '../../components/auth/AuthLayout';

export default function LoginSuperAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <AuthLayout
      title="Connexion Superadmin"
      subtitle="Accédez à votre espace de gestion"
      backLink={{ to: '/connexion', label: '← Connexion Admin / Employé' }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setLoading(true);
          try {
            const res = await loginSuperAdmin({ email: email, mot_de_passe: password });
            // console.log("email",email,"password",password);
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
    </AuthLayout>
  );
}
