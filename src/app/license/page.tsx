import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "License Information" };

export default function LicensePage() {
  return (
    <main className="legal-document">
      <article>
        <header className="mb-8">
          <p className="text-caption mb-3">Legal</p>
          <h1 className="text-h1">License Information</h1>
        </header>
        <div className="space-y-6 text-body text-secondary leading-relaxed">
          <p>All works published in the {SITE.name} archive are available under the following license types:</p>

          <section>
            <h2 className="text-h3 text-primary mt-10 mb-4">Rights Managed</h2>
            <p>Usage rights are granted for a specific purpose, duration, and territory. Each use requires a separate license agreement. Pricing is determined based on the intended use.</p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mt-10 mb-4">Royalty Free</h2>
            <p>A one-time license fee grants broad usage rights without recurring royalties. The license is non-exclusive and does not transfer copyright ownership.</p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mt-10 mb-4">Editorial Use Only</h2>
            <p>Licensed exclusively for editorial purposes such as news reporting, commentary, and education. Commercial use is prohibited without a separate agreement.</p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mt-10 mb-4">Restrictions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>No sublicensing or transfer of rights without written permission</li>
              <li>No use in AI training datasets or machine learning models</li>
              <li>No modification that misrepresents the original work</li>
              <li>Credit must be given as specified in the license agreement</li>
            </ul>
          </section>

          <p className="mt-8">For licensing inquiries, please <a href="/contact" className="text-burnt-orange hover:underline">contact us</a>.</p>
        </div>
      </article>
    </main>
  );
}
