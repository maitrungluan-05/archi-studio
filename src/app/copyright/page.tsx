import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright",
  description: "Copyright information, licensing, and asset protection.",
};

export default function CopyrightPage() {
  return (
    <main className="legal-document">
      <article className="max-w-3xl">
        <header className="mb-10">
          <p className="text-caption mb-2">Legal</p>
          <h1 className="text-h1">Copyright & Licensing</h1>
        </header>

        <div className="space-y-6 text-body text-secondary leading-relaxed">
          <section>
            <h2 className="text-h3 text-primary mb-3">Verified Original & Protected Copyright</h2>
            <p>
              All works published on ARCHI are original creations with verified ownership. Every asset in this archive is permanently protected by international copyright laws. ARCHI serves as the official digital archive and permanent record of ownership.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">Ownership & Rights</h2>
            <p>
              All works in this archive are original creations owned and controlled by the copyright holder. Full rights are retained including reproduction, distribution, display, and derivative rights. Copyright ownership is verified and permanently recorded.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">License Types</h2>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-primary mb-1">Rights Managed</dt>
                <dd>Customized licensing for specific use cases with negotiated terms.</dd>
              </div>
              <div>
                <dt className="font-semibold text-primary mb-1">Royalty Free</dt>
                <dd>One-time fee provides broad usage rights for multiple uses.</dd>
              </div>
              <div>
                <dt className="font-semibold text-primary mb-1">Editorial</dt>
                <dd>Limited to editorial use only; not for commercial application.</dd>
              </div>
              <div>
                <dt className="font-semibold text-primary mb-1">Personal</dt>
                <dd>For personal, non-commercial use only.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">Usage Restrictions</h2>
            <p>
              Unless otherwise licensed, use of these works is strictly prohibited. Do not:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Reproduce, copy, or print the works</li>
              <li>Distribute, share, or republish the works</li>
              <li>Create derivative works or modifications</li>
              <li>Use for commercial or promotional purposes without license</li>
              <li>Remove, alter, or obscure copyright notices</li>
              <li>Collect works for AI dataset training or machine learning</li>
              <li>Scrape or automate downloading of works</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">DMCA Protection</h2>
            <p>
              All works published on ARCHI are protected under the Digital Millennium Copyright Act (DMCA). Unauthorized reproduction, distribution, or circumvention of access controls is prohibited and subject to civil and criminal penalties.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">Licensing Inquiries</h2>
            <p>
              For licensing questions, permissions, or to obtain commercial usage rights, please contact the copyright holder directly. Each licensing request is considered individually and may require a formal licensing agreement.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
