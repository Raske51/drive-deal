interface MileageRangeInputProps {
  initialMinMileage?: number;
  initialMaxMileage?: number;
  onChange: (minMileage: number | undefined, maxMileage: number | undefined) => void;
}

export default function MileageRangeInput({
  initialMinMileage,
  initialMaxMileage,
  onChange
}: MileageRangeInputProps) {
  const formatMileage = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const parseMileage = (value: string) => {
    return Number(value.replace(/\D/g, ''));
  };

  const handleMinMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseMileage(e.target.value);
    onChange(value, initialMaxMileage);
  };

  const handleMaxMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : parseMileage(e.target.value);
    onChange(initialMinMileage, value);
  };

  const handleMinMileageBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value !== '') {
      e.target.value = formatMileage(parseMileage(e.target.value));
    }
  };

  const handleMaxMileageBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value !== '') {
      e.target.value = formatMileage(parseMileage(e.target.value));
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative rounded-md shadow-sm flex-1">
        <input
          type="text"
          defaultValue={initialMinMileage ? formatMileage(initialMinMileage) : ''}
          onChange={handleMinMileageChange}
          onBlur={handleMinMileageBlur}
          placeholder="Min"
          className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm">km</span>
        </div>
      </div>

      <span className="text-gray-500">à</span>

      <div className="relative rounded-md shadow-sm flex-1">
        <input
          type="text"
          defaultValue={initialMaxMileage ? formatMileage(initialMaxMileage) : ''}
          onChange={handleMaxMileageChange}
          onBlur={handleMaxMileageBlur}
          placeholder="Max"
          className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm">km</span>
        </div>
      </div>
    </div>
  );
} 