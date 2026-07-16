import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA",
  description: "DMCA copyright notice and takedown procedures.",
};

export default function DMCAPage() {
  return (
    <main className="legal-document">
      <article className="max-w-3xl">
        <header className="mb-10">
          <p className="text-caption mb-2">Legal</p>
          <h1 className="text-h1">DMCA Notice</h1>
        </header>

        <div className="space-y-6 text-body text-secondary leading-relaxed">
          <section>
            <h2 className="text-h3 text-primary mb-3">Digital Millennium Copyright Act</h2>
            <p>
              This website is registered and protected under the Digital Millennium Copyright Act (DMCA). All content, including but not limited to photographs, videos, text, and graphics, is the exclusive intellectual property of the copyright owner.
            </p>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">Copyright Protection</h2>
            <p>
              All works displayed on this website are original creations protected by international copyright law. Unauthorized reproduction, distribution, modification, or use of any content is strictly prohibited and may result in:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Civil legal action</li>
              <li>Criminal prosecution</li>
              <li>Statutory damages up to $150,000 per work</li>
              <li>Recovery of attorney fees and costs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">Permitted Use</h2>
            <p>
              You may view and download content from this website for personal, non-commercial use only. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Reproduce or distribute content without permission</li>
              <li>Modify or create derivative works</li>
              <li>Use content for commercial purposes</li>
              <li>Remove copyright notices or watermarks</li>
              <li>Publicly display or perform the work</li>
            </ul>
          </section>

          <section>
            <h2 className="text-h3 text-primary mb-3">Takedown Procedures</h2>
            <p>
              If you believe your copyright has been infringed, or if you have information about copyright infringement on this site, please contact us immediately with:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>Your contact information</li>
              <li>Description of the copyrighted work</li>
              <li>URL of infringing content</li>
              <li>Statement that use is not authorized</li>
              <li>Your signature (physical or electronic)</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">
              © All rights reserved. ARCHI is an official digital archive registered for copyright protection.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
