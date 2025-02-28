interface YearRangeSelectProps {
  minYear: number;
  maxYear: number;
  initialMinYear?: number;
  initialMaxYear?: number;
  onChange: (minYear: number, maxYear: number) => void;
}

export default function YearRangeSelect({
  minYear,
  maxYear,
  initialMinYear = maxYear,
  initialMaxYear = maxYear,
  onChange
}: YearRangeSelectProps) {
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const handleMinYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinYear = Number(e.target.value);
    onChange(newMinYear, Math.max(newMinYear, initialMaxYear));
  };

  const handleMaxYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMaxYear = Number(e.target.value);
    onChange(Math.min(initialMinYear, newMaxYear), newMaxYear);
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={initialMinYear}
        onChange={handleMinYearChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">Année min</option>
        {years.map((year) => (
          <option
            key={year}
            value={year}
            disabled={year > initialMaxYear}
          >
            {year}
          </option>
        ))}
      </select>

      <span className="text-gray-500">à</span>

      <select
        value={initialMaxYear}
        onChange={handleMaxYearChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">Année max</option>
        {years.map((year) => (
          <option
            key={year}
            value={year}
            disabled={year < initialMinYear}
          >
            {year}
          </option>
        ))}
      </select>
    </div>
  );
} 