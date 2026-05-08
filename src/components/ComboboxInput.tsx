/**
 * ComboboxInput — Autocomplete + free text.
 * Shows suggestions from a list, but ALWAYS allows typing anything custom.
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  suggestions: string[];
  placeholder?: string;
  id?: string;
  error?: boolean;
}

export function ComboboxInput({ value, onChange, suggestions, placeholder, id, error }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const ref = useRef<HTMLDivElement>(null);

  // Sync query when value is set externally (e.g. form reset)
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions.slice(0, 8);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);          // always update form with typed value
    setOpen(true);
  };

  const select = (s: string) => {
    setQuery(s);
    onChange(s);
    setOpen(false);
  };

  const clear = () => {
    setQuery('');
    onChange('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className={`flex items-center border rounded-lg bg-background transition-colors ${error ? 'border-red-500' : 'border-input'} focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30`}>
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-0.5 pr-2">
          {query && (
            <button type="button" onClick={clear} className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="button" onClick={() => setOpen(v => !v)} className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl">
          {filtered.length === 0 ? (
            query ? (
              <div className="px-3 py-2.5 text-sm text-muted-foreground">
                Press Enter or keep typing to use "<span className="font-medium text-foreground">{query}</span>"
              </div>
            ) : (
              <div className="px-3 py-2.5 text-sm text-muted-foreground">Start typing…</div>
            )
          ) : (
            <>
              {filtered.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => select(s)}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors ${s === value ? 'bg-accent font-medium' : ''}`}
                >
                  {s}
                </button>
              ))}
              {query && !filtered.some(s => s.toLowerCase() === query.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => select(query)}
                  className="w-full text-left px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-accent border-t border-border transition-colors"
                >
                  ✚ Use "<span className="font-medium">{query}</span>"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
