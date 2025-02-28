import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchResults from '../SearchResults';

const mockCars = [
  {
    _id: '1',
    title: 'BMW Serie 3',
    price: 25000,
    year: 2020,
    mileage: 30000,
    fuelType: 'Diesel',
    transmission: 'Automatique',
    color: 'Noir',
    imageUrl: '/images/bmw.jpg',
    location: 'Paris'
  },
  {
    _id: '2',
    title: 'Audi A4',
    price: 28000,
    year: 2021,
    mileage: 20000,
    fuelType: 'Essence',
    transmission: 'Manuelle',
    color: 'Blanc',
    imageUrl: '/images/audi.jpg',
    location: 'Lyon'
  }
];

jest.mock('../CarCard', () => {
  return function MockCarCard(props: any) {
    return (
      <div data-testid={`car-card-${props.car._id}`}>
        {props.car.title}
        <button onClick={() => props.onFavoriteToggle(props.car._id)}>
          Toggle Favorite
        </button>
      </div>
    );
  };
});

describe('SearchResults', () => {
  const mockOnFavoriteToggle = jest.fn();
  const mockOnSortChange = jest.fn();
  const mockOnPageChange = jest.fn();

  const defaultProps = {
    cars: [],
    total: 0,
    filters: {},
    loading: false,
    onSortChange: mockOnSortChange,
    onPageChange: mockOnPageChange,
    currentPage: 1,
    totalPages: 1,
    currentSort: 'price',
    currentOrder: 'asc' as const,
    onFavoriteToggle: mockOnFavoriteToggle,
    favorites: []
  };

  beforeEach(() => {
    mockOnFavoriteToggle.mockClear();
    mockOnSortChange.mockClear();
    mockOnPageChange.mockClear();
  });

  it('renders loading state correctly', () => {
    render(<SearchResults {...defaultProps} loading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders empty state when no cars are available', () => {
    render(<SearchResults {...defaultProps} />);
    expect(screen.getByText('Aucun résultat trouvé')).toBeInTheDocument();
    expect(screen.getByText('Essayez de modifier vos critères de recherche')).toBeInTheDocument();
  });

  it('renders car cards when cars are available', () => {
    render(
      <SearchResults
        {...defaultProps}
        cars={mockCars}
        total={mockCars.length}
      />
    );

    expect(screen.getByTestId('car-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('car-card-2')).toBeInTheDocument();
    expect(screen.getByText('BMW Serie 3')).toBeInTheDocument();
    expect(screen.getByText('Audi A4')).toBeInTheDocument();
  });

  it('handles favorite toggle correctly', async () => {
    render(
      <SearchResults
        {...defaultProps}
        cars={mockCars}
        total={mockCars.length}
      />
    );

    const toggleButton = screen.getAllByText('Toggle Favorite')[0];
    await userEvent.click(toggleButton);

    expect(mockOnFavoriteToggle).toHaveBeenCalledWith('1');
  });

  it('displays correct number of results', () => {
    render(
      <SearchResults
        {...defaultProps}
        cars={mockCars}
        total={mockCars.length}
      />
    );

    expect(screen.getByText(`${mockCars.length} résultats`)).toBeInTheDocument();
  });

  it('handles sort change correctly', async () => {
    render(
      <SearchResults
        {...defaultProps}
        cars={mockCars}
        total={mockCars.length}
      />
    );

    const sortSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(sortSelect, 'price-desc');

    expect(mockOnSortChange).toHaveBeenCalledWith('price', 'desc');
  });

  it('shows pagination when there are multiple pages', () => {
    render(
      <SearchResults
        {...defaultProps}
        cars={mockCars}
        total={mockCars.length}
        totalPages={3}
        currentPage={2}
      />
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
  });
}); 