// Export service — snapshots each card DOM node to PNG at its true native
// resolution. Temporarily resets zoom to 1.0 so the scale transform doesn't
// interfere with html-to-image. Single-card exports download the PNG
// directly; multi-card exports bundle into a ZIP.

import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import type { DesignProject } from './types';
import { useDesignStore } from './store';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function waitFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
  }
}

export async function exportProject(project: DesignProject): Promise<{ count: number }> {
  const store = useDesignStore.getState();
  const prevZoom = store.zoom;

  // Reset zoom so cards render at native resolution before capture
  store.setZoom(1);
  await waitFrames(2);

  try {
    const cardEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-card-export]'),
    );

    const pngs: { name: string; blob: Blob }[] = [];

    for (const el of cardEls) {
      const cardId = el.dataset.cardExport;
      const card = project.cards.find((c) => c.id === cardId);
      if (!card) continue;

      const dataUrl = await toPng(el, {
        pixelRatio: 1,
        cacheBust: true,
        width: card.width,
        height: card.height,
        style: { transform: 'none' },
      });

      const blob = await (await fetch(dataUrl)).blob();
      const filename = `${slugify(project.name)}-${slugify(card.name)}.png`;
      pngs.push({ name: filename, blob });
    }

    if (pngs.length === 0) {
      return { count: 0 };
    }

    if (pngs.length === 1) {
      triggerDownload(pngs[0].blob, pngs[0].name);
      return { count: 1 };
    }

    // Multi-card → ZIP
    const zip = new JSZip();
    pngs.forEach((p) => zip.file(p.name, p.blob));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, `${slugify(project.name)}.zip`);

    return { count: pngs.length };
  } finally {
    store.setZoom(prevZoom);
  }
}
