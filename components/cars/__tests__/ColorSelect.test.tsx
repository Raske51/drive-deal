import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorSelect from '../ColorSelect';

const mockColors = [
  { value: 'white', label: 'Blanc', hex: '#FFFFFF' },
  { value: 'black', label: 'Noir', hex: '#000000' },
  { value: 'red', label: 'Rouge', hex: '#FF0000' },
];

describe('ColorSelect', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default label', () => {
    render(
      <ColorSelect
        colors={mockColors}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Couleurs')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(
      <ColorSelect
        colors={mockColors}
        selected={[]}
        onChange={mockOnChange}
        label="Custom Label"
      />
    );

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('renders all color swatches', () => {
    render(
      <ColorSelect
        colors={mockColors}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    mockColors.forEach(color => {
      const swatch = screen.getByRole('button', { name: color.label });
      expect(swatch).toBeInTheDocument();
      expect(swatch.querySelector('span')).toHaveStyle({ backgroundColor: color.hex });
    });
  });

  it('shows tooltip on hover', async () => {
    render(
      <ColorSelect
        colors={mockColors}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    const firstSwatch = screen.getByRole('button', { name: mockColors[0].label });
    await userEvent.hover(firstSwatch);

    const tooltip = screen.getByText(mockColors[0].label);
    expect(tooltip).toBeInTheDocument();
  });

  it('toggles color selection correctly', async () => {
    render(
      <ColorSelect
        colors={mockColors}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    // Select first color
    await userEvent.click(screen.getByRole('button', { name: mockColors[0].label }));
    expect(mockOnChange).toHaveBeenCalledWith([mockColors[0].value]);

    // Select second color
    await userEvent.click(screen.getByRole('button', { name: mockColors[1].label }));
    expect(mockOnChange).toHaveBeenCalledWith([mockColors[0].value, mockColors[1].value]);

    // Deselect first color
    await userEvent.click(screen.getByRole('button', { name: mockColors[0].label }));
    expect(mockOnChange).toHaveBeenCalledWith([mockColors[1].value]);
  });

  it('applies selected styles to selected colors', () => {
    render(
      <ColorSelect
        colors={mockColors}
        selected={[mockColors[0].value]}
        onChange={mockOnChange}
      />
    );

    const selectedSwatch = screen.getByRole('button', { name: mockColors[0].label });
    const unselectedSwatch = screen.getByRole('button', { name: mockColors[1].label });

    expect(selectedSwatch).toHaveClass('ring-2 ring-blue-500');
    expect(unselectedSwatch).toHaveClass('ring-1 ring-gray-200');
  });
}); 