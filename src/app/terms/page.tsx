import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for the digital archive.",
};

export default function TermsPage() {
  return (
    <main className="legal-document">
      <article className="max-w-3xl">
        <header className="mb-10">
          <p className="text-caption mb-2">Legal</p>
          <h1 className="text-h1">Terms of Service</h1>
        </header>

        <div className="space-y-6 text-body text-secondary leading-relaxed">
          <section>
            <h2 className="text-h3 text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or &ldquo;mirroring&rdquo; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">3. Disclaimer</h2>
            <p>
              The materials on this website are provided on an &lsquo;as is&rsquo; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">4. Limitations</h2>
            <p>
              In no event shall the archive or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on this website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on this website are accurate, complete, or current. We may make changes to the materials contained on this website at any time without notice.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">
              For questions about these terms, please contact us.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
