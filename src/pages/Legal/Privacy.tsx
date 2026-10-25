import { Link } from 'react-router-dom';
import { siteUrl, usePageMeta } from '../../lib/seo';

const effectiveDate = 'October 25, 2026';

export function PrivacyPolicy() {
  usePageMeta({
    title: 'Privacy Policy | ATTIKID',
    description:
      'Learn how the ATTIKID website handles fan-mail submissions, site operations, third-party services, and information saved by browser-based creator tools.',
    canonical: '/privacy',
    type: 'article',
    keywords: ['ATTIKID privacy policy', 'privacy', 'fan mail', 'creator tools'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': siteUrl + '/privacy#webpage',
      name: 'Privacy Policy | ATTIKID',
      url: siteUrl + '/privacy',
      dateModified: '2026-10-25',
      isPartOf: { '@id': siteUrl + '/#website' },
      publisher: { '@id': siteUrl + '/#artist' },
    },
  });

  return (
    <article className="page legal-page">
      <header className="legal-page__header">
        <span className="portfolio-label">ATTIKID / SITE INFORMATION</span>
        <h1>Privacy Policy</h1>
        <p>How information is handled when you visit the official ATTIKID website or use its features.</p>
        <p className="legal-page__date">Effective date: <time dateTime="2026-10-25">{effectiveDate}</time></p>
      </header>

      <div className="legal-page__body">
        <section>
          <h2>1. About this policy</h2>
          <p>
            This policy applies to attikid.com, including its music catalog, lyrics archive,
            artist information, fan-mail form, and browser-based Studio tools. It explains the
            main categories of information that may be processed to operate those features.
          </p>
        </section>

        <section>
          <h2>2. Information you submit</h2>
          <p>
            When you send fan mail, the form asks for a message and may ask for your name and
            email address so the submission can be reviewed and, where appropriate, answered.
            Those details are sent to the site backend and stored for authorized site
            administration. Do not include passwords, financial account details, government
            identifiers, or other sensitive information in a message.
          </p>
          <p>
            The information you choose to submit is used to receive and manage the message,
            keep the website operating, and address relevant follow-up. Sending a message
            does not make it a confidential or privileged communication.
          </p>
        </section>

        <section>
          <h2>3. Site operations and service providers</h2>
          <p>
            The website uses Supabase for backend data services and may use its authentication
            features to support site functions. Website hosting and delivery are provided
            through Vercel. These providers may process technical information needed to deliver,
            secure, troubleshoot, and maintain their services under their own terms and privacy
            documentation.
          </p>
          <p>
            Links to services such as TikTok, Facebook, or X take you to third-party websites.
            Their operators control their own information practices; review their policies before
            using those services.
          </p>
        </section>

        <section>
          <h2>4. Browser storage and Studio tools</h2>
          <p>
            Some creator tools work locally in your browser. For example, the release checklist
            stores checklist state in your browser's local storage on that device. Other tools
            may keep a draft only while the page is open and let you export or copy it yourself.
            Tool-specific notices describe the behavior where relevant.
          </p>
          <p>
            Browser-local data is separate from information submitted through a server-backed
            form. Clearing browser storage or using another browser or device may remove or
            hide locally stored drafts.
          </p>
        </section>

        <section>
          <h2>5. Retention, security, and your choices</h2>
          <p>
            Submitted information is retained for as long as reasonably needed to handle the
            submission, administer the site, maintain security, resolve disputes, or meet
            applicable obligations. No website or transmission method can be guaranteed
            completely secure.
          </p>
          <p>
            You can ask a question about a submission or request that it be reviewed for
            deletion through the <Link to="/fan-mail">fan-mail page</Link>. Include enough
            information to help identify the relevant submission, but do not send additional
            sensitive data. A request may be subject to verification and to information that
            must be retained for legitimate operational or legal reasons.
          </p>
        </section>

        <section>
          <h2>6. Changes and contact</h2>
          <p>
            This policy may be updated when the website or its features change. The effective
            date at the top indicates when this version was published. Questions about this
            policy can be sent through <Link to="/fan-mail">Contact / Fan Mail</Link>.
          </p>
          <p>
            For the rules covering use of the website and its tools, read the
            {' '}<Link to="/terms">Terms of Use</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
