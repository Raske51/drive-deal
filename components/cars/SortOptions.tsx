interface SortOption {
  label: string;
  value: string;
  order: 'asc' | 'desc';
}

interface SortOptionsProps {
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSortChange: (sort: string, order: 'asc' | 'desc') => void;
}

export default function SortOptions({ currentSort, currentOrder, onSortChange }: SortOptionsProps) {
  const sortOptions: SortOption[] = [
    { label: 'Prix croissant', value: 'price', order: 'asc' },
    { label: 'Prix décroissant', value: 'price', order: 'desc' },
    { label: 'Année récente', value: 'year', order: 'desc' },
    { label: 'Année ancienne', value: 'year', order: 'asc' },
    { label: 'Kilométrage croissant', value: 'mileage', order: 'asc' },
    { label: 'Kilométrage décroissant', value: 'mileage', order: 'desc' },
    { label: 'Date d\'ajout', value: 'createdAt', order: 'desc' },
  ];

  return (
    <div className="flex items-center space-x-4 mb-6">
      <label htmlFor="sort" className="text-sm font-medium text-gray-700">
        Trier par:
      </label>
      <div className="relative">
        <select
          id="sort"
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={`${currentSort}-${currentOrder}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-') as [string, 'asc' | 'desc'];
            onSortChange(sort, order);
          }}
        >
          {sortOptions.map((option) => (
            <option
              key={`${option.value}-${option.order}`}
              value={`${option.value}-${option.order}`}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
} 