import { useEffect, useState, useRef  } from 'react';
import {
  FileText, Loader2, AlertTriangle, Plus, X, Plane, CheckCircle2,
  XCircle, Ban, Eye, Pencil, Calendar, ArrowRight, MapPin,
} from 'lucide-react';
import {
  getMesDemandesVoyage, createDemandeVoyage, updateDemandeVoyage, annulerDemandeVoyage,
  type DemandeVoyage,
} from '../../services/demandesVoyage';
import { getSuggestionAeroport } from '../../services/flights'; // ou le chemin exact
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statutBadge(statut: string) {
  const map: Record<string, { cls: string; text: string; icon: React.ReactNode }> = {
    EN_ATTENTE: { cls: 'bg-amber-50 text-amber-700 border-amber-200', text: 'En attente', icon: null },
    APPROUVEE: { cls: 'bg-green-50 text-green-700 border-green-200', text: 'Approuvée', icon: <CheckCircle2 className="w-3 h-3" /> },
    REJETEE: { cls: 'bg-red-50 text-red-700 border-red-200', text: 'Rejetée', icon: <XCircle className="w-3 h-3" /> },
    ANNULEE: { cls: 'bg-gray-100 text-gray-600 border-gray-200', text: 'Annulée', icon: <Ban className="w-3 h-3" /> },
    TERMINEE: { cls: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Terminée', icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  const s = map[statut] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', text: statut, icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.icon}<span>{s.text}</span>
    </span>
  );
}

function classBadge(classe: string) {
  const labels: Record<string, string> = { Y: 'Économique', W: 'Premium', J: 'Affaires', F: 'Première' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556] font-medium">
      <Plane className="w-3 h-3 text-[#A11B1B]" />{labels[classe] || classe}
    </span>
  );
}
// Interface pour les suggestions d'aéroports
interface AirportSuggestion {
  code: string;
  name: string;
  city?: string;
  country?: string;
}
// Composant autocomplete pour les aéroports
function AirportAutocomplete({
  value,
  onChange,
  label,
  placeholder = 'Rechercher un aéroport...',
  required = false,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchroniser l'état interne avec la valeur externe
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Appel API avec debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const query = inputValue.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoading(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await getSuggestionAeroport(query);
        // Extrait le tableau principal (peut être à différents niveaux)
        let items = response?.data?.data || response?.data || response;
        if (!Array.isArray(items)) {
          items = [];
        }
        // Filtre les aéroports et formate
        const airportSuggestions = items
          .filter((item: any) => item.type === 'airport')
          .map((item: any) => ({
            code: item.iata_code || '',
            name: item.name || '',
            city: item.city_name || item.city?.name || item.city?.city_name || '',
            country: item.iata_country_code || '',
          }));
        setSuggestions(airportSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [inputValue]);

  // Fermer les suggestions en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AirportSuggestion) => {
    onChange(suggestion.code); // stocke le code IATA
    setInputValue(`${suggestion.name} (${suggestion.code})`);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1">
      <label className="text-xs font-medium text-[#565556]">
        {label} {required && '*'}
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          // Si l'utilisateur efface tout, on propage la valeur vide
          if (e.target.value === '') {
            onChange('');
          }
        }}
        onFocus={() => {
          if (inputValue.trim().length >= 2) setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white w-full"
      />
      {isLoading && (
        <div className="absolute right-3 top-9">
          <Loader2 className="w-4 h-4 animate-spin text-[#A5A6A5]" />
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-[#f0f0f0]">
          {suggestions.map((item, index) => (
            <li
              key={item.code}
              className={`px-4 py-2.5 cursor-pointer hover:bg-[#fafafa] transition-colors flex items-center justify-between ${
                index === selectedIndex ? 'bg-[#f4f4f4]' : ''
              }`}
              onClick={() => handleSelect(item)}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#565556]">{item.name}</span>
                <span className="text-xs text-[#A5A6A5]">{item.city}, {item.country}</span>
              </div>
              <span className="text-xs font-mono text-[#A11B1B] bg-[#f4f4f4] px-2 py-0.5 rounded-full">
                {item.code}
              </span>
            </li>
          ))}
        </ul>
      )}
      {showSuggestions && suggestions.length === 0 && inputValue.trim().length >= 2 && !isLoading && (
        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-lg shadow-lg p-3 text-sm text-[#A5A6A5] text-center">
          Aucun aéroport trouvé
        </div>
      )}
    </div>
  );
}
// Page principale MesDemandes
export default function MesDemandes() {
  const [demandes, setDemandes] = useState<DemandeVoyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [sel, setSel] = useState<DemandeVoyage | null>(null);

  const [depart, setDepart] = useState('');
  const [arrive, setArrive] = useState('');
  const [ville, setVille] = useState('');
  const [pays, setPays] = useState('');
  const [etat, setEtat] = useState('');
  const [region, setRegion] = useState('');
  const [allerRetour, setAllerRetour] = useState(true);
  const [dateDepart, setDateDepart] = useState('');
  const [dateRetour, setDateRetour] = useState('');
  const [classe, setClasse] = useState<'Y' | 'W' | 'J' | 'F'>('Y');
  const [hotel, setHotel] = useState<string>('NON_INCLUS');
  const [motif, setMotif] = useState('');

  const [actLoad, setActLoad] = useState(false);
  const [actErr, setActErr] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getMesDemandesVoyage();
      setDemandes(res.demandes);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function reset() {
    setDepart(''); setArrive(''); setVille(''); setPays(''); setEtat(''); setRegion(''); setAllerRetour(true);
    setDateDepart(''); setDateRetour(''); setClasse('Y'); setHotel('NON_INCLUS'); setMotif(''); setActErr('');
  }

  function openCreate() { reset(); setShowCreate(true); }

  function openEdit(d: DemandeVoyage) {
    setSel(d);
    setDepart(d.depart); setArrive(d.arrive); setVille(d.ville || ''); setPays(d.pays || ''); setEtat(d.etat || ''); setRegion(d.region || ''); setAllerRetour(d.allerRetour);
    setDateDepart(d.dateDepart.slice(0, 16));
    setDateRetour(d.dateRetour ? d.dateRetour.slice(0, 16) : '');
    setClasse(d.classe as 'Y' | 'W' | 'J' | 'F'); setHotel(d.hotel || 'NON_INCLUS'); setMotif(d.motif);
    setActErr(''); setShowEdit(true);
  }

  async function handleCreate(e: React.SubmitEvent) {
    e.preventDefault();
    if (!depart.trim() || !arrive.trim() || !dateDepart || !motif.trim()) { setActErr('Champs obligatoires manquants'); return; }
    if (allerRetour && !dateRetour) { setActErr('Date de retour requise'); return; }
    setActLoad(true); setActErr('');
    try {
      await createDemandeVoyage({
        depart: depart.trim(), arrive: arrive.trim(), ville: ville.trim() || undefined, pays: pays.trim() || undefined, etat: etat.trim() || undefined, region: region.trim() || undefined, allerRetour,
        dateDepart: new Date(dateDepart).toISOString(),
        dateRetour: allerRetour && dateRetour ? new Date(dateRetour).toISOString() : undefined,
        classe, hotel, motif: motif.trim(),
      });
      setShowCreate(false); reset(); await load();
    } catch (err: unknown) {
      setActErr((err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création');
    } finally { setActLoad(false); }
  }

  async function handleEdit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!sel) return;
    if (!depart.trim() || !arrive.trim() || !dateDepart || !motif.trim()) { setActErr('Champs obligatoires manquants'); return; }
    if (allerRetour && !dateRetour) { setActErr('Date de retour requise'); return; }
    setActLoad(true); setActErr('');
    try {
      await updateDemandeVoyage(sel.id, {
        depart: depart.trim(), arrive: arrive.trim(), ville: ville.trim() || undefined, pays: pays.trim() || undefined, etat: etat.trim() || undefined, region: region.trim() || undefined, allerRetour,
        dateDepart: new Date(dateDepart).toISOString(),
        dateRetour: allerRetour && dateRetour ? new Date(dateRetour).toISOString() : undefined,
        classe, hotel, motif: motif.trim(),
      });
      setShowEdit(false); setSel(null); await load();
    } catch (err: unknown) {
      setActErr((err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification');
    } finally { setActLoad(false); }
  }

  async function handleAnnuler(d: DemandeVoyage) {
    if (!confirm(`Annuler la demande ${d.depart} → ${d.arrive} ?`)) return;
    setActLoad(true);
    try { await annulerDemandeVoyage(d.id); await load(); }
    catch (err: unknown) { setError((err as Error & { data?: { message?: string } }).data?.message || 'Erreur'); }
    finally { setActLoad(false); }
  }

  const enAttente = demandes.filter((d) => d.statut === 'EN_ATTENTE').length;

  const formFields = (
    <>
      {actErr && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{actErr}</div>}
      {/* <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Aéroport Départ *</span></label>
          <input value={depart} onChange={(e) => setDepart(e.target.value)} required
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Aéroport Arrivée *</span></label>
          <input value={arrive} onChange={(e) => setArrive(e.target.value)} required
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        </div>
      </div> */}
{/* Formulaire de création/édition */}
<div className="grid grid-cols-2 gap-3">
  <AirportAutocomplete
    label="Aéroport Départ"
    value={depart}
    onChange={setDepart}
    placeholder="Ex: Paris, CDG..."
    required
  />
  <AirportAutocomplete
    label="Aéroport Arrivée"
    value={arrive}
    onChange={setArrive}
    placeholder="Ex: New York, JFK..."
    required
  />
</div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#565556]"><span>Ville précise</span></label>
        <input value={ville} onChange={(e) => setVille(e.target.value)}
          placeholder="Ex: Paris centre, Lyon Part-Dieu…"
          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Pays</span></label>
          <input value={pays} onChange={(e) => setPays(e.target.value)}
            placeholder="Ex: France"
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>État/Province</span></label>
          <input value={etat} onChange={(e) => setEtat(e.target.value)}
            placeholder="Ex: Île-de-France"
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Région</span></label>
          <input value={region} onChange={(e) => setRegion(e.target.value)}
            placeholder="Ex: Paris"
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input id="ar" type="checkbox" checked={allerRetour} onChange={(e) => setAllerRetour(e.target.checked)}
          className="w-4 h-4 rounded border-[#e5e5e5] text-[#A11B1B] focus:ring-[#A11B1B]" />
        <label htmlFor="ar" className="text-sm text-[#565556]"><span>Aller-retour</span></label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Date départ *</span></label>
          <input type="datetime-local" value={dateDepart} onChange={(e) => setDateDepart(e.target.value)} required
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        </div>
        {allerRetour && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#565556]"><span>Date retour *</span></label>
            <input type="datetime-local" value={dateRetour} onChange={(e) => setDateRetour(e.target.value)} required={allerRetour}
              className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Classe *</span></label>
          <select value={classe} onChange={(e) => setClasse(e.target.value as 'Y' | 'W' | 'J' | 'F')}
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white">
            <option value="Y">Économique (Y)</option>
            <option value="W">Premium (W)</option>
            <option value="J">Affaires (J)</option>
            <option value="F">Première (F)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#565556]"><span>Hôtel</span></label>
          <select value={hotel} onChange={(e) => setHotel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white">
            <option value="NON_INCLUS">Non inclus</option>
            <option value="1">1 étoile</option>
            <option value="2">2 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="5">5 étoiles</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#565556]"><span>Motif *</span></label>
        <textarea value={motif} onChange={(e) => setMotif(e.target.value)} required rows={3}
          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white resize-none" />
      </div>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#A11B1B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#565556]"><span>Mes demandes de voyage</span></h1>
            <p className="text-sm text-[#A5A6A5]"><span>Créez et suivez vos demandes</span></p>
          </div>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors">
          <Plus className="w-4 h-4" /><span>Nouvelle demande</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /><p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: demandes.length, color: 'text-[#565556]' },
          { label: 'En attente', value: enAttente, color: 'text-amber-600' },
          { label: 'Approuvées', value: demandes.filter((d) => d.statut === 'APPROUVEE').length, color: 'text-green-600' },
          { label: 'Rejetées', value: demandes.filter((d) => d.statut === 'REJETEE').length, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white border border-[#e5e5e5]">
            <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>{s.label}</span></p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[#A5A6A5]">
            <Loader2 className="w-5 h-5 animate-spin" /><span>Chargement…</span>
          </div>
        ) : demandes.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#A5A6A5]">
            <Plane className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" />
            <p className="text-sm"><span>Aucune demande</span></p>
            <p className="text-xs mt-1"><span>Cliquez sur "Nouvelle demande"</span></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                  {['Trajet', 'Ville', 'Date', 'Classe', 'Hôtel', 'Statut', 'Motif', 'Actions'].map((h) => (
                    <th key={h} className={`px-4 py-2.5 font-medium text-[#565556] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      <span>{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demandes.map((d) => (
                  <tr key={d.id} className="border-b border-[#f0f0f0]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2 text-[#565556]">
                        <MapPin className="w-3.5 h-3.5 text-[#A11B1B]" />
                        <span>{d.depart}</span><ArrowRight className="w-3.5 h-3.5 text-[#A5A6A5]" /><span>{d.arrive}</span>
                        {d.allerRetour && <span className="ml-1 px-1.5 py-0.5 rounded bg-[#f4f4f4] text-[10px] text-[#A5A6A5]"><span>A/R</span></span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[#565556]">{d.ville || <span className="text-xs text-[#A5A6A5]">—</span>}</td>
                    <td className="px-4 py-2.5 text-[#565556]">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#A5A6A5]" /><span>{fmtDate(d.dateDepart)}</span></div>
                    </td>
                    <td className="px-4 py-2.5">{classBadge(d.classe)}</td>
                    <td className="px-4 py-2.5 text-[#565556]">
                      {d.hotel && d.hotel !== 'NON_INCLUS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556] font-medium">
                          {d.hotel} {d.hotel === '1' ? 'étoile' : 'étoiles'}
                        </span>
                      ) : <span className="text-xs text-[#A5A6A5]">Non inclus</span>}
                    </td>
                    <td className="px-4 py-2.5">{statutBadge(d.statut)}</td>
                    <td className="px-4 py-2.5 text-[#565556] max-w-[200px] truncate">{d.motif}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSel(d); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Détail"><Eye className="w-4 h-4" /></button>
                        {d.statut === 'EN_ATTENTE' && (
                          <>
                            <button onClick={() => openEdit(d)} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Modifier"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleAnnuler(d)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Annuler"><Ban className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal création */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2"><Plane className="w-5 h-5 text-[#A11B1B]" /><span>Nouvelle demande</span></h3>
              <button onClick={() => { setShowCreate(false); reset(); }} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">{formFields}
              <div className="flex justify-end gap-3 pt-2 border-t border-[#e5e5e5]">
                <button type="button" onClick={() => { setShowCreate(false); reset(); }}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"><span>Annuler</span></button>
                <button type="submit" disabled={actLoad}
                  className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                  {actLoad ? <span>Création…</span> : <span>Créer</span>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {showEdit && sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2"><Pencil className="w-5 h-5 text-[#A11B1B]" /><span>Modifier la demande</span></h3>
              <button onClick={() => { setShowEdit(false); setSel(null); }} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">{formFields}
              <div className="flex justify-end gap-3 pt-2 border-t border-[#e5e5e5]">
                <button type="button" onClick={() => { setShowEdit(false); setSel(null); }}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"><span>Annuler</span></button>
                <button type="submit" disabled={actLoad}
                  className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                  {actLoad ? <span>Modification…</span> : <span>Enregistrer</span>}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {showDetail && sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#565556]"><span>Détail de la demande</span></h3>
              <button onClick={() => { setShowDetail(false); setSel(null); }} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Référence</span></span><span className="font-mono text-[#565556]">#{sel.id}</span></div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Trajet</span></span><span className="text-[#565556]">{sel.depart} → {sel.arrive} {sel.allerRetour ? '(A/R)' : ''}</span></div>
              {sel.ville && <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Ville</span></span><span className="text-[#565556]">{sel.ville}</span></div>}
              {sel.pays && <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Pays</span></span><span className="text-[#565556]">{sel.pays}</span></div>}
              {sel.etat && <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>État/Province</span></span><span className="text-[#565556]">{sel.etat}</span></div>}
              {sel.region && <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Région</span></span><span className="text-[#565556]">{sel.region}</span></div>}
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Départ</span></span><span className="text-[#565556]">{fmtDateTime(sel.dateDepart)}</span></div>
              {sel.dateRetour && <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Retour</span></span><span className="text-[#565556]">{fmtDateTime(sel.dateRetour)}</span></div>}
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Classe</span></span>{classBadge(sel.classe)}</div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Hôtel</span></span>
                {sel.hotel && sel.hotel !== 'NON_INCLUS' ? (
                  <span className="text-[#565556]">{sel.hotel} {sel.hotel === '1' ? 'étoile' : 'étoiles'}</span>
                ) : <span className="text-[#A5A6A5]">Non inclus</span>}
              </div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Statut</span></span>{statutBadge(sel.statut)}</div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]"><span>Motif</span></span><span className="text-[#565556]">{sel.motif}</span></div>
              {sel.commentaire && <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5]"><span>Commentaire</span></p><p className="text-[#565556] mt-0.5">{sel.commentaire}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
