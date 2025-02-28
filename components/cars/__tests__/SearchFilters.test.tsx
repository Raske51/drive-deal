import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilters from '../SearchFilters';

jest.mock('../PriceRangeSlider', () => {
  return function MockPriceRangeSlider(props: any) {
    return (
      <div data-testid="price-range-slider">
        <button onClick={() => props.onChange(10000, 50000)}>Update Price</button>
      </div>
    );
  };
});

jest.mock('../YearRangeSelect', () => {
  return function MockYearRangeSelect(props: any) {
    return (
      <div data-testid="year-range-select">
        <button onClick={() => props.onChange(2018, 2022)}>Update Year</button>
      </div>
    );
  };
});

jest.mock('../MileageRangeInput', () => {
  return function MockMileageRangeInput(props: any) {
    return (
      <div data-testid="mileage-range-input">
        <button onClick={() => props.onChange(10000, 50000)}>Update Mileage</button>
      </div>
    );
  };
});

describe('SearchFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renders all filter sections', () => {
    render(
      <SearchFilters
        onFiltersChange={mockOnFiltersChange}
      />
    );

    expect(screen.getByText('Filtres')).toBeInTheDocument();
    expect(screen.getByText('Prix')).toBeInTheDocument();
    expect(screen.getByText('Année')).toBeInTheDocument();
    expect(screen.getByText('Kilométrage')).toBeInTheDocument();
    expect(screen.getByText('Carburant')).toBeInTheDocument();
    expect(screen.getByText('Transmission')).toBeInTheDocument();
    expect(screen.getByText('Couleur')).toBeInTheDocument();
  });

  it('updates price filter correctly', async () => {
    render(
      <SearchFilters
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const updatePriceButton = screen.getByText('Update Price');
    await userEvent.click(updatePriceButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minPrice: 10000,
        maxPrice: 50000
      })
    );
  });

  it('updates year filter correctly', async () => {
    render(
      <SearchFilters
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const updateYearButton = screen.getByText('Update Year');
    await userEvent.click(updateYearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minYear: 2018,
        maxYear: 2022
      })
    );
  });

  it('updates mileage filter correctly', async () => {
    render(
      <SearchFilters
        onFiltersChange={mockOnFiltersChange}
      />
    );

    const updateMileageButton = screen.getByText('Update Mileage');
    await userEvent.click(updateMileageButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        minMileage: 10000,
        maxMileage: 50000
      })
    );
  });

  it('resets all filters when reset button is clicked', async () => {
    render(
      <SearchFilters
        onFiltersChange={mockOnFiltersChange}
        initialFilters={{
          minPrice: 10000,
          maxPrice: 50000,
          minYear: 2018,
          maxYear: 2022
        }}
      />
    );

    const resetButton = screen.getByText('Réinitialiser les filtres');
    await userEvent.click(resetButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({});
  });

  it('preserves initial filters', () => {
    const initialFilters = {
      minPrice: 10000,
      maxPrice: 50000,
      minYear: 2018,
      maxYear: 2022
    };

    render(
      <SearchFilters
        onFiltersChange={mockOnFiltersChange}
        initialFilters={initialFilters}
      />
    );

    expect(screen.getByTestId('price-range-slider')).toBeInTheDocument();
    expect(screen.getByTestId('year-range-select')).toBeInTheDocument();
  });
}); 