// components/AirportAutocomplete.tsx
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { getSuggestionAeroport } from '../../services/flights'; // adaptez le chemin

interface AirportSuggestion {
  code: string;
  name: string;
  city?: string;
  country?: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export function AirportAutocomplete({
  value,
  onChange,
  label,
  placeholder = 'Rechercher un aéroport...',
  required = false,
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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
        let items = response?.data?.data || response?.data || response;
        if (!Array.isArray(items)) {
          items = [];
        }
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
    onChange(suggestion.code);
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
          if (e.target.value === '') {
            onChange('');
          }
        }}
        onFocus={() => {
          if (inputValue.trim().length >= 2) setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
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