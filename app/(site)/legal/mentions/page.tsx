import { promises as fs } from 'fs';
import path from 'path';
import { marked } from 'marked';

async function getMarkdown() {
  const file = path.join(process.cwd(), 'data', 'legal', 'mentions.md');
  const raw = await fs.readFile(file, 'utf8');
  return marked.parse(raw);
}

export default async function Page() {
  const html = await getMarkdown();
  return (
    <main className="px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-serif tracking-wide text-3xl md:text-4xl font-semibold">Mentions légales</h1>
        <div className="h-0.5 w-12 bg-[var(--gold)]/60 rounded" />
        <article className="prose prose-zinc max-w-none">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: String(html) }} />
        </article>
      </div>
    </main>
  );
}
