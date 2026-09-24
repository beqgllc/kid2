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
      <img
        className="catalog-hero__image"
        src="/images/hero/attikid-hero.webp"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
      <div className="catalog-hero__scrim" aria-hidden="true" />
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
