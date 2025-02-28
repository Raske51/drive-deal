interface Color {
  value: string;
  label: string;
  hex: string;
}

interface ColorSelectProps {
  colors: Color[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export default function ColorSelect({
  colors,
  selected,
  onChange,
  label = 'Couleurs'
}: ColorSelectProps) {
  const toggleColor = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(color => color !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => toggleColor(color.value)}
            className={`group relative flex items-center justify-center p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              selected.includes(color.value)
                ? 'ring-2 ring-blue-500'
                : 'ring-1 ring-gray-200'
            }`}
          >
            <span
              className="h-8 w-8 rounded-full border border-black border-opacity-10"
              style={{ backgroundColor: color.hex }}
            />
            <span className="sr-only">{color.label}</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {color.label}
                <svg
                  className="absolute text-gray-900 h-2 w-full left-0 top-full"
                  x="0px"
                  y="0px"
                  viewBox="0 0 255 255"
                  xmlSpace="preserve"
                >
                  <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 