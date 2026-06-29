import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginCommon() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[#f8f8f8] to-[#eeeeee]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-[#A11B1B] flex items-center justify-center shadow-lg shadow-[#A11B1B]/20 mb-4">
            <span className="text-white font-bold text-xl">EV</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#565556] text-center">
            Connexion
          </h1>
          <p className="text-[#A5A6A5] text-sm mt-1 text-center">
            Accédez à votre espace Eazy Visa
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-8 border border-[#e5e5e5]">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-email" className="text-sm font-medium text-[#565556]">
                Email
              </label>
              <input
                id="c-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.com"
                className="px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] bg-white placeholder:text-[#A5A6A5] outline-none transition-all duration-200 focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="c-password" className="text-sm font-medium text-[#565556]">
                  Mot de passe
                </label>
                <a href="#" className="text-xs text-[#A11B1B] hover:underline font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
              <input
                id="c-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] bg-white placeholder:text-[#A5A6A5] outline-none transition-all duration-200 focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
              />
            </div>

            <button
              type="submit"
              className="mt-2 py-3 px-4 rounded-lg bg-[#A11B1B] text-white text-sm font-semibold shadow-md shadow-[#A11B1B]/20 hover:bg-[#8a1616] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Se connecter
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/connexion-superadmin"
            className="text-sm text-[#A5A6A5] hover:text-[#A11B1B] transition-colors duration-200 font-medium"
          >
            Connexion Superadmin →
          </Link>
        </div>
      </div>
    </div>
  );
}
