import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CarSearchParams } from '../../models/Car';

type FuelType = "essence" | "diesel" | "électrique" | "hybride" | "gpl";
type TransmissionType = "manuelle" | "automatique";
type SellerType = "particulier" | "professionnel";

interface SearchFormProps {
  initialValues?: Partial<CarSearchParams>;
  onSearch: (params: CarSearchParams) => void;
}

const fuels: FuelType[] = ["essence", "diesel", "électrique", "hybride", "gpl"];
const transmissions: TransmissionType[] = ["manuelle", "automatique"];
const sellerTypes: SellerType[] = ["particulier", "professionnel"];

export default function SearchForm({ initialValues, onSearch }: SearchFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CarSearchParams>>(initialValues || {});

  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : undefined
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => {
      const currentArray = (prev[name as keyof CarSearchParams] as any[]) || [];
      return {
        ...prev,
        [name]: checked
          ? [...currentArray, value]
          : currentArray.filter(item => item !== value)
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData as CarSearchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Marque et Modèle */}
        <div className="space-y-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Marque
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Modèle
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Prix */}
        <div className="space-y-4">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
              Prix minimum
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={formData.minPrice || ''}
              onChange={handleNumberInput}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
              Prix maximum
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={formData.maxPrice || ''}
              onChange={handleNumberInput}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Année */}
        <div className="space-y-4">
          <div>
            <label htmlFor="minYear" className="block text-sm font-medium text-gray-700">
              Année minimum
            </label>
            <input
              type="number"
              id="minYear"
              name="minYear"
              value={formData.minYear || ''}
              onChange={handleNumberInput}
              min="1900"
              max={new Date().getFullYear()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="maxYear" className="block text-sm font-medium text-gray-700">
              Année maximum
            </label>
            <input
              type="number"
              id="maxYear"
              name="maxYear"
              value={formData.maxYear || ''}
              onChange={handleNumberInput}
              min="1900"
              max={new Date().getFullYear()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Carburant */}
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Carburant
            </legend>
            <div className="space-y-2">
              {fuels.map((fuel) => (
                <div key={fuel} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`fuel-${fuel}`}
                    name="fuel"
                    value={fuel}
                    checked={formData.fuel?.includes(fuel as FuelType)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`fuel-${fuel}`} className="ml-3 text-sm text-gray-600">
                    {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Transmission */}
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Transmission
            </legend>
            <div className="space-y-2">
              {transmissions.map((transmission) => (
                <div key={transmission} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`transmission-${transmission}`}
                    name="transmission"
                    value={transmission}
                    checked={formData.transmission?.includes(transmission as TransmissionType)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`transmission-${transmission}`} className="ml-3 text-sm text-gray-600">
                    {transmission.charAt(0).toUpperCase() + transmission.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Type de vendeur */}
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Type de vendeur
            </legend>
            <div className="space-y-2">
              {sellerTypes.map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sellerType-${type}`}
                    name="sellerType"
                    value={type}
                    checked={formData.sellerType?.includes(type as SellerType)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`sellerType-${type}`} className="ml-3 text-sm text-gray-600">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Tri */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
            Trier par
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={formData.sortBy}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="createdAt">Date</option>
            <option value="price">Prix</option>
            <option value="year">Année</option>
            <option value="mileage">Kilométrage</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
            Ordre
          </label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>
      </div>

      {/* Boutons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setFormData({
            brand: '',
            model: '',
            minPrice: undefined,
            maxPrice: undefined,
            minYear: undefined,
            maxYear: undefined,
            fuel: [],
            transmission: [],
            location: {
              department: ''
            },
            sellerType: [],
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Réinitialiser
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Rechercher
        </button>
      </div>
    </form>
  );
} 