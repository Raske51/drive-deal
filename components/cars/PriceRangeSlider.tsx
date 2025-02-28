import { useState, useEffect } from 'react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  initialMin?: number;
  initialMax?: number;
  onChange: (min: number, max: number) => void;
}

export default function PriceRangeSlider({
  min,
  max,
  step = 1000,
  initialMin = min,
  initialMax = max,
  onChange
}: PriceRangeSliderProps) {
  const [minValue, setMinValue] = useState(initialMin);
  const [maxValue, setMaxValue] = useState(initialMax);

  useEffect(() => {
    setMinValue(initialMin);
    setMaxValue(initialMax);
  }, [initialMin, initialMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(value);
    onChange(value, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(value);
    onChange(minValue, value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getLeftPosition = () => {
    return ((minValue - min) / (max - min)) * 100;
  };

  const getRightPosition = () => {
    return ((maxValue - min) / (max - min)) * 100;
  };

  return (
    <div className="w-full px-2">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">{formatPrice(minValue)}</span>
        <span className="text-sm text-gray-600">{formatPrice(maxValue)}</span>
      </div>

      <div className="relative h-2">
        {/* Track background */}
        <div className="absolute w-full h-1 bg-gray-200 rounded top-1/2 transform -translate-y-1/2"></div>

        {/* Selected range */}
        <div
          className="absolute h-1 bg-blue-500 rounded top-1/2 transform -translate-y-1/2"
          style={{
            left: `${getLeftPosition()}%`,
            right: `${100 - getRightPosition()}%`
          }}
        ></div>

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none"
          style={{
            '--thumb-size': '1rem',
            '--thumb-color': '#fff',
            '--thumb-border': '#3b82f6',
            '--thumb-shadow': '0 1px 3px rgba(0,0,0,0.2)'
          } as any}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none"
          style={{
            '--thumb-size': '1rem',
            '--thumb-color': '#fff',
            '--thumb-border': '#3b82f6',
            '--thumb-shadow': '0 1px 3px rgba(0,0,0,0.2)'
          } as any}
        />
      </div>

      <style jsx>{`
        input[type='range'] {
          -webkit-appearance: none;
          pointer-events: auto;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: var(--thumb-size);
          width: var(--thumb-size);
          border-radius: 50%;
          background: var(--thumb-color);
          border: 2px solid var(--thumb-border);
          box-shadow: var(--thumb-shadow);
          cursor: pointer;
          pointer-events: auto;
          margin-top: -7px;
        }

        input[type='range']::-moz-range-thumb {
          height: var(--thumb-size);
          width: var(--thumb-size);
          border-radius: 50%;
          background: var(--thumb-color);
          border: 2px solid var(--thumb-border);
          box-shadow: var(--thumb-shadow);
          cursor: pointer;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
} 