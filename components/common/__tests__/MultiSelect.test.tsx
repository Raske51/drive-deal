import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiSelect from '../MultiSelect';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('MultiSelect', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default placeholder', () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Sélectionner...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        placeholder="Custom placeholder"
      />
    );

    expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('displays options when clicked', async () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('selects and deselects options correctly', async () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Select first option
    await userEvent.click(screen.getByText(mockOptions[0].label));
    expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0].value]);

    // Select second option
    await userEvent.click(screen.getByText(mockOptions[1].label));
    expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0].value, mockOptions[1].value]);

    // Deselect first option
    await userEvent.click(screen.getByText(mockOptions[0].label));
    expect(mockOnChange).toHaveBeenCalledWith([mockOptions[1].value]);
  });

  it('displays correct number of selected items', () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={['option1', 'option2']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('2 sélectionnés')).toBeInTheDocument();
  });

  it('displays single selected item label', () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={['option1']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <MultiSelect
        options={mockOptions}
        selected={[]}
        onChange={mockOnChange}
      />
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    // Options should be visible
    expect(screen.getByText(mockOptions[0].label)).toBeVisible();

    // Click outside
    fireEvent.mouseDown(document.body);

    // Options should not be visible
    expect(screen.queryByText(mockOptions[0].label)).not.toBeVisible();
  });
}); 