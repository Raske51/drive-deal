import { useState } from 'react';
import PriceRangeSlider from './PriceRangeSlider';
import YearRangeSelect from './YearRangeSelect';
import MileageRangeInput from './MileageRangeInput';
import MultiSelect from '../common/MultiSelect';
import ColorSelect from './ColorSelect';
import FilterAccordion from './FilterAccordion';

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}

export default function SearchFilters({
  onFiltersChange,
  initialFilters = {}
}: SearchFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilters = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const fuelTypes = [
    { value: 'essence', label: 'Essence' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybride', label: 'Hybride' },
    { value: 'electrique', label: 'Électrique' }
  ];

  const transmissionTypes = [
    { value: 'manuelle', label: 'Manuelle' },
    { value: 'automatique', label: 'Automatique' }
  ];

  const colors = [
    { value: 'blanc', label: 'Blanc', hex: '#FFFFFF' },
    { value: 'noir', label: 'Noir', hex: '#000000' },
    { value: 'gris', label: 'Gris', hex: '#808080' },
    { value: 'rouge', label: 'Rouge', hex: '#FF0000' },
    { value: 'bleu', label: 'Bleu', hex: '#0000FF' },
    { value: 'vert', label: 'Vert', hex: '#008000' },
    { value: 'marron', label: 'Marron', hex: '#8B4513' },
    { value: 'beige', label: 'Beige', hex: '#F5F5DC' }
  ];

  const filterSections = [
    {
      title: 'Prix',
      content: (
        <PriceRangeSlider
          min={0}
          max={100000}
          step={1000}
          initialMin={filters.minPrice}
          initialMax={filters.maxPrice}
          onChange={(min, max) => {
            updateFilters('minPrice', min);
            updateFilters('maxPrice', max);
          }}
        />
      )
    },
    {
      title: 'Année',
      content: (
        <YearRangeSelect
          minYear={1990}
          maxYear={new Date().getFullYear()}
          initialMinYear={filters.minYear}
          initialMaxYear={filters.maxYear}
          onChange={(min, max) => {
            updateFilters('minYear', min);
            updateFilters('maxYear', max);
          }}
        />
      )
    },
    {
      title: 'Kilométrage',
      content: (
        <MileageRangeInput
          initialMinMileage={filters.minMileage}
          initialMaxMileage={filters.maxMileage}
          onChange={(min, max) => {
            updateFilters('minMileage', min);
            updateFilters('maxMileage', max);
          }}
        />
      )
    },
    {
      title: 'Carburant',
      content: (
        <MultiSelect
          options={fuelTypes}
          selected={filters.fuelTypes || []}
          onChange={(selected) => updateFilters('fuelTypes', selected)}
          placeholder="Sélectionner le type de carburant"
        />
      )
    },
    {
      title: 'Transmission',
      content: (
        <MultiSelect
          options={transmissionTypes}
          selected={filters.transmissionTypes || []}
          onChange={(selected) => updateFilters('transmissionTypes', selected)}
          placeholder="Sélectionner le type de transmission"
        />
      )
    },
    {
      title: 'Couleur',
      content: (
        <ColorSelect
          colors={colors}
          selected={filters.colors || []}
          onChange={(selected) => updateFilters('colors', selected)}
        />
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Filtres
      </h2>
      <FilterAccordion sections={filterSections} />
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setFilters({});
            onFiltersChange({});
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
} 