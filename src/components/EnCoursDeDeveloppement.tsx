export default function EnCoursDeDeveloppement() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="w-20 h-20 rounded-2xl bg-[rgba(161,27,27,0.08)] flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-[#A11B1B]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.702.633A6.965 6.965 0 0 1 3.5 16.5a6.995 6.995 0 0 1 10.354-4.646l.633.702c.686.833 1.874.995 2.95.904"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-[#565556] mb-2">
        En cours de développement
      </h2>
      <p className="text-[#A5A6A5] text-base max-w-sm leading-relaxed">
        Cette page est en cours de construction. Revenez bientôt pour découvrir les nouvelles fonctionnalités.
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[rgba(161,27,27,0.08)] text-[#A11B1B]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A11B1B] animate-pulse" />
        Bientôt disponible
      </span>
    </div>
  );
}
