import { useState } from 'react';

interface FilterSection {
  title: string;
  content: React.ReactNode;
}

interface FilterAccordionProps {
  sections: FilterSection[];
  defaultOpenSections?: number[];
}

export default function FilterAccordion({
  sections,
  defaultOpenSections = [0]
}: FilterAccordionProps) {
  const [openSections, setOpenSections] = useState<number[]>(defaultOpenSections);

  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="divide-y divide-gray-200">
      {sections.map((section, index) => (
        <div key={index} className="py-4">
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection(index)}
          >
            <span className="text-sm font-medium text-gray-900">
              {section.title}
            </span>
            <span className="ml-6 flex items-center">
              {openSections.includes(index) ? (
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </span>
          </button>
          {openSections.includes(index) && (
            <div className="mt-4">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 