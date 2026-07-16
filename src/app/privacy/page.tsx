import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the digital archive.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-document">
      <article className="max-w-3xl">
        <header className="mb-10">
          <p className="text-caption mb-2">Legal</p>
          <h1 className="text-h1">Privacy Policy</h1>
        </header>

        <div className="space-y-6 text-body text-secondary leading-relaxed">
          <section>
            <h2 className="text-h3 text-primary mb-3">1. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways when you interact with this website. The information we collect may include:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Your IP address and browser information</li>
              <li>Pages you visit and time spent on the website</li>
              <li>Referral sources and links clicked</li>
              <li>Any information you voluntarily provide through contact forms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">2. Use of Information</h2>
            <p>
              The information we collect is used to understand your needs and provide a better service. We use the information to:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Improve our website and services</li>
              <li>Personalize your experience</li>
              <li>Respond to your inquiries</li>
              <li>Monitor and analyze website traffic</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">3. Data Protection</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">4. Third-Party Services</h2>
            <p>
              This website may contain links to third-party websites. We are not responsible for the privacy practices or content of external sites. We encourage you to review the privacy policies of any third-party sites before providing personal information.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">5. Your Rights</h2>
            <p>
              You have the right to request access to, correction of, or deletion of any personal information we hold about you. To exercise these rights, please contact us with your request.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">
              This privacy policy is effective as of the date last updated. We reserve the right to modify this policy at any time.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
