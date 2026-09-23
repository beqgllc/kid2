import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type PortfolioHeaderLink = {
  to: string;
  label: string;
  active?: boolean;
};

type PortfolioPageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  links?: PortfolioHeaderLink[];
  className?: string;
};

export function PortfolioPageHeader({
  eyebrow,
  title,
  description,
  links = [],
  className = '',
}: PortfolioPageHeaderProps) {
  return (
    <header className={`catalog-hero ${className}`.trim()}>
      <div className="catalog-hero__inner">
        <span className="portfolio-label">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {links.length > 0 && (
          <nav className="music-page-links" aria-label="Section navigation">
            {links.map((link) => (
              <Link key={link.to} className={link.active ? 'active' : undefined} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
