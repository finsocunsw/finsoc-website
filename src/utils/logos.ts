import { urlFor } from './sanity';

/** A rectangle in the source image's own pixels */
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Logo {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

type LogoSource = { asset?: { _ref?: string } };

const PROBE = 400;

// Trimmed boxes by asset: each logo is measured once per server instance
const boxes = new Map<string, Promise<Box | null>>();

/**
 * Partner logos are uploaded on padded canvases, so the canvas says little
 * about the mark itself. Measure the drawn content: fetch a small copy, trim
 * everything that matches the background, and scale the box back up to
 * source pixels. Returns null when the image can't be read, and the caller
 * falls back to the full canvas.
 */
function contentBox(logo: LogoSource, ref: string, width: number, height: number) {
  if (!boxes.has(ref)) {
    boxes.set(
      ref,
      (async () => {
        try {
          const { default: sharp } = await import('sharp');
          const response = await fetch(urlFor(logo).width(PROBE).format('png').url());
          if (!response.ok) return null;
          const { info } = await sharp(Buffer.from(await response.arrayBuffer()))
            .flatten({ background: '#ffffff' })
            .trim({ threshold: 12 })
            .toBuffer({ resolveWithObject: true });
          const scale = width / PROBE;
          // A little air round the mark so its edges aren't shaved
          const pad = Math.round(Math.max(info.width, info.height) * scale * 0.03);
          const x = Math.max(0, Math.round(Math.abs(info.trimOffsetLeft ?? 0) * scale) - pad);
          const y = Math.max(0, Math.round(Math.abs(info.trimOffsetTop ?? 0) * scale) - pad);
          return {
            x,
            y,
            width: Math.min(width - x, Math.round(info.width * scale) + 2 * pad),
            height: Math.min(height - y, Math.round(info.height * scale) + 2 * pad),
          };
        } catch {
          return null;
        }
      })(),
    );
  }
  return boxes.get(ref)!;
}

/**
 * A partner logo cropped to its drawn content. Its width and height give the
 * trimmed aspect ratio, which the page uses to size every logo to the same
 * area. The asset reference carries the pixel size:
 * image-<id>-<width>x<height>-<format>.
 */
export async function partnerLogo(logo: LogoSource | undefined): Promise<Logo | null> {
  const ref = logo?.asset?._ref;
  if (!logo || !ref) return null;
  const [, width = 2, height = 1] = ref.match(/-(\d+)x(\d+)-/)?.map(Number) ?? [];
  const box = await contentBox(logo, ref, width, height);
  const ratio = box ? box.width / box.height : width / height;

  const url = (w: number) => {
    const image = urlFor(logo);
    return (box ? image.rect(box.x, box.y, box.width, box.height) : image)
      .width(w)
      .auto('format')
      .quality(85)
      .url();
  };

  return {
    src: url(480),
    srcset: [240, 480, 720, 960].map((w) => `${url(w)} ${w}w`).join(', '),
    width: 480,
    height: Math.round(480 / ratio),
  };
}
