import { Link } from 'react-router-dom';
import { siteUrl, usePageMeta } from '../../lib/seo';

const effectiveDate = 'October 25, 2026';

export function TermsOfUse() {
  usePageMeta({
    title: 'Terms of Use | ATTIKID',
    description:
      'Read the terms for using the ATTIKID website, listening to its music, accessing lyrics and media, submitting fan mail, and using browser-based creative tools.',
    canonical: '/terms',
    type: 'article',
    keywords: ['ATTIKID terms of use', 'terms of service', 'music website terms', 'creator tools'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': siteUrl + '/terms#webpage',
      name: 'Terms of Use | ATTIKID',
      url: siteUrl + '/terms',
      dateModified: '2026-10-25',
      isPartOf: { '@id': siteUrl + '/#website' },
      publisher: { '@id': siteUrl + '/#artist' },
    },
  });

  return (
    <article className="page legal-page">
      <header className="legal-page__header">
        <span className="portfolio-label">ATTIKID / SITE INFORMATION</span>
        <h1>Terms of Use</h1>
        <p>Basic rules for accessing the ATTIKID website, music archive, and creator tools.</p>
        <p className="legal-page__date">Effective date: <time dateTime="2026-10-25">{effectiveDate}</time></p>
      </header>

      <div className="legal-page__body">
        <section>
          <h2>1. Using this website</h2>
          <p>
            By accessing attikid.com, you agree to use the website lawfully and in a way that
            does not interfere with other visitors, damage the service, attempt unauthorized
            access, or disrupt its systems. Do not use the site to distribute malicious code,
            impersonate another person, or violate another person's rights.
          </p>
          <p>
            The site provides the ATTIKID music catalog, lyrics and media where published,
            artist information, fan-mail features, and tools intended to assist creative work.
            Features may change, be unavailable, or be removed as the project evolves.
          </p>
        </section>

        <section>
          <h2>2. Music, lyrics, artwork, and other content</h2>
          <p>
            Unless a page or credit states otherwise, ATTIKID names, original music, lyrics,
            artwork, visual assets, text, and other creative materials are owned by ATTIKID or
            their respective rights holders and are protected by applicable intellectual
            property laws. Accessing the site does not transfer ownership or grant permission
            to reproduce, distribute, publicly perform, sell, or commercially exploit protected
            material.
          </p>
          <p>
            You may link to public pages for personal discovery and sharing. For licensing,
            commercial use, press requests, or other permissions, use the
            {' '}<Link to="/fan-mail">Contact / Fan Mail page</Link> to make an inquiry.
            Third-party names, platforms, and services remain the property of their respective
            owners.
          </p>
        </section>

        <section>
          <h2>3. Submissions and messages</h2>
          <p>
            Submit only information and material you have the right to share. Do not send
            unlawful, threatening, deceptive, or abusive content, private information about
            another person without permission, or material that infringes intellectual property
            rights. Keep passwords and other secrets out of fan-mail messages.
          </p>
          <p>
            When you submit a message, you authorize the site to receive, store, review, and
            process it for the purpose of operating the submission feature and handling relevant
            follow-up. You retain any rights you already hold in your submission. Do not treat
            the fan-mail form as a confidential or privileged channel.
          </p>
        </section>

        <section>
          <h2>4. Browser-based creator tools</h2>
          <p>
            Studio tools are provided as practical aids for songwriting, planning, and release
            preparation. Outputs may be incomplete and should be checked before use. The tools
            do not provide legal, tax, financial, distribution, publishing, or other professional
            advice.
          </p>
          <p>
            In particular, a split-sheet draft, checklist, press-kit draft, or exported document
            is not a signed contract, a verification of ownership, or a substitute for review by
            all relevant contributors and qualified professionals. You are responsible for
            checking your entries, backups, exports, permissions, and final decisions.
          </p>
        </section>

        <section>
          <h2>5. Third-party services and availability</h2>
          <p>
            Parts of the website rely on third-party infrastructure or link to external
            platforms. ATTIKID does not control the content, policies, or availability of those
            external services. Links are provided for convenience and do not necessarily imply
            endorsement.
          </p>
          <p>
            The website and its content are provided on an “as available” basis to the extent
            permitted by law. To the extent permitted by law, ATTIKID disclaims warranties not
            expressly stated here and is not responsible for losses caused by interruptions,
            inaccurate entries supplied by visitors, or use of third-party services.
          </p>
        </section>

        <section>
          <h2>6. Changes and contact</h2>
          <p>
            These terms may be revised as features change. The effective date at the top
            identifies this version. Continued use after an updated version is published means
            you accept the updated terms to the extent permitted by law.
          </p>
          <p>
            Questions about these terms or permission to use creative material can be sent
            through <Link to="/fan-mail">Contact / Fan Mail</Link>. For information about
            handling of data, read the <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
