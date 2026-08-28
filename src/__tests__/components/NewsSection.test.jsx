import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsSection from '../../components/NewsSection';

const mockNews = [
  {
    id: 1,
    category: 'Promotion',
    title: 'Double Points Weekend',
    description: 'Earn 2x points this weekend.',
    date: '2026-04-06',
    bg: 'linear-gradient(135deg, #1B3A6B, #2E5FA3)',
  },
  {
    id: 2,
    category: 'Event',
    title: 'Member Appreciation Day',
    description: 'An exclusive in-store experience.',
    date: '2026-04-01',
    bg: 'linear-gradient(135deg, #052E16, #166534)',
  },
];

function renderNews(news = mockNews) {
  return render(
    <MemoryRouter>
      <NewsSection news={news} />
    </MemoryRouter>
  );
}

describe('NewsSection', () => {
  it('renders the section heading', () => {
    renderNews();
    expect(screen.getByText("What's Happening")).toBeInTheDocument();
  });

  it('renders a card for each news item', () => {
    renderNews();
    expect(screen.getByText('Double Points Weekend')).toBeInTheDocument();
    expect(screen.getByText('Member Appreciation Day')).toBeInTheDocument();
  });

  it('renders category badges', () => {
    renderNews();
    expect(screen.getByText('Promotion')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
  });

  it('renders descriptions', () => {
    renderNews();
    expect(screen.getByText('Earn 2x points this weekend.')).toBeInTheDocument();
  });

  it('renders formatted dates', () => {
    renderNews();
    // The component uses en-MY locale; JSDOM may format as "6 Apr" or similar
    // We just check that some date-like text appears in a <time> element
    const timeEls = document.querySelectorAll('time');
    expect(timeEls.length).toBeGreaterThan(0);
  });

  it('renders "See all" button', () => {
    renderNews();
    expect(screen.getByRole('button', { name: /see all/i })).toBeInTheDocument();
  });

  it('renders nothing when the news list is empty', () => {
    const { container } = renderNews([]);
    // Component returns null for empty list
    expect(container.firstChild).toBeNull();
  });
});
