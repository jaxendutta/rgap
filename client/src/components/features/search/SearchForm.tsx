// src/components/features/grants/SearchForm.tsx
import React, { useState } from 'react';
import { Search as SearchIcon, BookmarkPlus, SlidersHorizontal, GraduationCap, University, BookMarked } from 'lucide-react';
import { Button } from '@/components/common/ui/Button';
import { Card } from '@/components/common/ui/Card';
import { FilterTags } from '@/components/features/filter/FilterTags';
import { FilterPanel } from '../filter/FilterPanel';
import type { GrantSearchParams } from '@/services/api/grants';
import { DEFAULT_FILTER_STATE, FilterKey } from '@/constants/filters';

interface SearchFormProps {
  initialValues: GrantSearchParams;
  onSearch: (params: GrantSearchParams) => void;
}

interface SearchField {
  key: keyof GrantSearchParams['searchTerms'];
  icon: React.ElementType;
  placeholder: string;
}

const searchFields: SearchField[] = [
  { key: 'recipient', icon: GraduationCap, placeholder: 'Search by recipient...' },
  { key: 'institute', icon: University, placeholder: 'Search by institute...' },
  { key: 'grant', icon: BookMarked, placeholder: 'Search by grant title...' },
];

export const SearchForm = ({ initialValues, onSearch }: SearchFormProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState<GrantSearchParams>(initialValues);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleInputChange = (field: keyof GrantSearchParams['searchTerms'], value: string) => {
    setParams(prev => ({
      ...prev,
      searchTerms: {
        ...prev.searchTerms,
        [field]: value
      }
    }));
  };

  const handleSearch = () => {
    onSearch(params);
  };

  const handleFilterChange = (filters: GrantSearchParams['filters']) => {
    setParams(prev => ({
      ...prev,
      filters
    }));
    handleSearch();
  };

  const handleRemoveFilter = (type: FilterKey, value: string) => {
    setParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [type]: Array.isArray(prev.filters[type]) ? prev.filters[type].filter(val => val !== value) : prev.filters[type]
      }
    }));
    handleSearch();
  }

  const handleClearFilters = () => {
    setParams(prev => ({
      ...prev,
      filters: DEFAULT_FILTER_STATE
    }));
    handleSearch();
  };

  const handleBookmarkSearch = () => {
    setIsBookmarked(true);
    setTimeout(() => setIsBookmarked(false), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {searchFields.map(({ key, icon: Icon, placeholder }) => (
          <div key={key} className="relative">
            <input
              type="text"
              placeholder={placeholder}
              value={params.searchTerms[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        ))}
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          icon={SlidersHorizontal}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <FilterPanel
            filters={params.filters}
            onChange={handleFilterChange}
          />
        </Card>
      )}

      {/* Filter Tags */}
      <FilterTags
        filters={params.filters}
        onRemove={(type: FilterKey, value: string) => { handleRemoveFilter(type, value) }}
        onClearAll={handleClearFilters}
      />

      {/* Search Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="primary"
          icon={SearchIcon}
          onClick={handleSearch}
        >
          Search
        </Button>

        <Button
          variant="outline"
          icon={BookmarkPlus}
          onClick={handleBookmarkSearch}
          className={isBookmarked ? 'text-green-600 border-green-600' : undefined}
        >
          Bookmark Search
        </Button>
      </div>
    </div>
  );
};