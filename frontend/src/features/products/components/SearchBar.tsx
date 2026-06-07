import { Search, X } from 'lucide-react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  value:    string;
  onChange: (value: string) => void;
  total?:   number;
}

export function SearchBar({ value, onChange, total }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 300);

  useEffect(() => { onChange(debounced); }, [debounced]);
  useEffect(() => { setLocal(value); }, [value]);

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={local}
          onChange={e => setLocal(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-9 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
        />
        {local && (
          <button onClick={() => setLocal('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
            <X size={14} />
          </button>
        )}
      </div>
      {total !== undefined && <p className="text-xs text-text-muted">{total} products found</p>}
    </div>
  );
}
