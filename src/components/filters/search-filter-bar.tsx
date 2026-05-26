'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, X, CalendarRange } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect, useRef } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface DateRangeConfig {
  fromKey: string;
  toKey: string;
  fromLabel?: string;
  toLabel?: string;
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  sortOptions?: SortOption[];
  defaultSort?: string;
  dateRange?: DateRangeConfig;
}

export function SearchFilterBar({
  searchPlaceholder = 'Search...',
  filters = [],
  sortOptions = [],
  defaultSort,
  dateRange,
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  // Track if this is the initial mount to avoid running effect on first render
  const isInitialMount = useRef(true);

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(search, 300);

  // Update URL when search changes (but not on initial mount or when searchParams changes)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = searchParams.get('search') || '';

    // Only update if the debounced search is different from URL
    if (debouncedSearch !== currentSearch) {
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
        params.set('page', '1'); // Reset to page 1 on search
      } else {
        params.delete('search');
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch]); // Only depend on debouncedSearch, not searchParams!

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const filter = filters.find(f => f.key === key);
    const defaultValue = filter?.defaultValue || 'all';

    if (value && value !== defaultValue) {
      params.set(key, value);
      params.set('page', '1'); // Reset to page 1 on filter change
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== defaultSort) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle date range change
  const handleDateChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
      params.set('page', '1');
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearch('');
    router.push(pathname, { scroll: false });
  };

  // Count active filters
  const activeDateFilters = dateRange
    ? [dateRange.fromKey, dateRange.toKey].filter(k => searchParams.get(k)).length
    : 0;

  const activeFilterCount =
    filters.filter(filter => {
      const value = searchParams.get(filter.key);
      const defaultValue = filter.defaultValue || 'all';
      return value && value !== defaultValue;
    }).length +
    (search ? 1 : 0) +
    activeDateFilters;

  const hasFiltersOrSort = filters.length > 0 || sortOptions.length > 0 || !!dateRange;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button (Mobile) */}
        {hasFiltersOrSort && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Filters Row (Desktop always visible, Mobile toggleable) */}
      {hasFiltersOrSort && (
        <div className={`flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
          {/* Date Range Inputs */}
          {dateRange && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <CalendarRange className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <Input
                    type="date"
                    value={searchParams.get(dateRange.fromKey) || ''}
                    onChange={(e) => handleDateChange(dateRange.fromKey, e.target.value)}
                    className="w-full sm:w-[150px] text-sm"
                    placeholder={dateRange.fromLabel || 'Dari'}
                    title={dateRange.fromLabel || 'Dari Tanggal'}
                  />
                  <span className="text-muted-foreground text-sm shrink-0">–</span>
                  <Input
                    type="date"
                    value={searchParams.get(dateRange.toKey) || ''}
                    onChange={(e) => handleDateChange(dateRange.toKey, e.target.value)}
                    className="w-full sm:w-[150px] text-sm"
                    placeholder={dateRange.toLabel || 'Sampai'}
                    title={dateRange.toLabel || 'Sampai Tanggal'}
                    min={searchParams.get(dateRange.fromKey) || undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dropdown Filters */}
          {filters.map((filter) => {
            const currentValue = searchParams.get(filter.key) || filter.defaultValue || 'all';

            return (
              <div key={filter.key} className="w-full sm:w-auto min-w-[150px]">
                <Select value={currentValue} onValueChange={(value) => handleFilterChange(filter.key, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}

          {/* Sort */}
          {sortOptions.length > 0 && (
            <div className="w-full sm:w-auto min-w-[150px]">
              <Select
                value={searchParams.get('sort') || defaultSort || sortOptions[0].value}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Clear All Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearAll}
              className="w-full sm:w-auto text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
              Search: &quot;{search}&quot;
              <button onClick={() => setSearch('')} className="hover:bg-blue-200 rounded p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {/* Date range badges */}
          {dateRange && searchParams.get(dateRange.fromKey) && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
              Dari: {new Date(searchParams.get(dateRange.fromKey)!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              <button
                onClick={() => handleDateChange(dateRange.fromKey, '')}
                className="hover:bg-blue-200 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {dateRange && searchParams.get(dateRange.toKey) && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
              Sampai: {new Date(searchParams.get(dateRange.toKey)!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              <button
                onClick={() => handleDateChange(dateRange.toKey, '')}
                className="hover:bg-blue-200 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.map((filter) => {
            const value = searchParams.get(filter.key);
            const defaultValue = filter.defaultValue || 'all';

            if (!value || value === defaultValue) return null;

            const option = filter.options.find(o => o.value === value);
            if (!option) return null;

            return (
              <div key={filter.key} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                {filter.label}: {option.label}
                <button
                  onClick={() => handleFilterChange(filter.key, defaultValue)}
                  className="hover:bg-blue-200 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
