import { urlFor } from './sanity';

/**
 * Sponsor logos arrive with very different amounts of empty canvas baked in
 * (one wordmark is an 11:1 strip inside a 2:1 file). To show them at a
 * consistent visual weight we crop each one to its visible ink and size it by
 * that ink's proportions.
 *
 * The ink box is measured once per logo from a small thumbnail and cached for
 * the life of the server process. Any failure falls back to the full image.
 */

export interface LogoFrame {
  /** Crop rectangle in source pixels, or null to use the whole image */
  rect: { x: number; y: number; w: number; h: number } | null;
  /** Width / height of what will actually be shown */
  ratio: number;
}

const SAMPLE_WIDTH = 400;
const cache = new Map<string, Promise<LogoFrame>>();

function sourceSize(ref: string) {
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref);
  return match ? { w: Number(match[1]), h: Number(match[2]) } : null;
}

async function measure(logo: any, size: { w: number; h: number }): Promise<LogoFrame> {
  const whole: LogoFrame = { rect: null, ratio: size.w / size.h };

  try {
    const { default: sharp } = await import('sharp');
    const url = urlFor(logo.asset).width(SAMPLE_WIDTH).format('png').url();
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return whole;

    const buffer = Buffer.from(await res.arrayBuffer());
    const sample = await sharp(buffer).metadata();
    const { info } = await sharp(buffer)
      .flatten({ background: '#ffffff' })
      .trim({ threshold: 24 })
      .toBuffer({ resolveWithObject: true });

    if (!sample.width || info.trimOffsetLeft === undefined || info.trimOffsetTop === undefined) return whole;

    const scale = size.w / sample.width;
    // Keep a hair of breathing room so anti-aliased edges are not shaved off
    const pad = Math.round(Math.max(info.width, info.height) * scale * 0.02);
    const x = Math.max(0, Math.round(-info.trimOffsetLeft * scale) - pad);
    const y = Math.max(0, Math.round(-info.trimOffsetTop * scale) - pad);
    const w = Math.min(size.w - x, Math.round(info.width * scale) + pad * 2);
    const h = Math.min(size.h - y, Math.round(info.height * scale) + pad * 2);

    if (w < 8 || h < 8) return whole;
    return { rect: { x, y, w, h }, ratio: w / h };
  } catch {
    return whole;
  }
}

export function getLogoFrame(logo: any): Promise<LogoFrame> {
  const ref: string | undefined = logo?.asset?._ref;
  const size = ref ? sourceSize(ref) : null;
  if (!ref || !size) return Promise.resolve({ rect: null, ratio: 2 });

  // An editor's own crop in Sanity Studio wins over the automatic one
  if (logo.crop && Object.values(logo.crop).some((v) => typeof v === 'number' && v > 0)) {
    const c = logo.crop;
    const w = size.w * (1 - c.left - c.right);
    const h = size.h * (1 - c.top - c.bottom);
    return Promise.resolve({ rect: null, ratio: w / h });
  }

  if (!cache.has(ref)) cache.set(ref, measure(logo, size));
  return cache.get(ref)!;
}

export function logoUrl(logo: any, frame: LogoFrame, height: number) {
  const builder = frame.rect
    ? urlFor(logo.asset).rect(frame.rect.x, frame.rect.y, frame.rect.w, frame.rect.h)
    : urlFor(logo);
  return builder.height(height).fit('max').auto('format').url();
}
