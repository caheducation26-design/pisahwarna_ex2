import { DetectionSettings, PageAnalysisResult, PageClassification } from '../types';

export const DEFAULT_DETECTION_SETTINGS: DetectionSettings = {
  colorDeltaThreshold: 22, // Delta RGB minimum (|max - min|) to consider a pixel colored
  minColorProportion: 0.08, // Minimum percentage of page pixels that must be colored (0.08% is ~300-500 pixels on 600px width)
  noiseTolerance: 18, // Max delta to ignore for light scanner/paper yellowing artifacts
  reviewToleranceRatio: 0.45, // Borderline factor below threshold that triggers 'review'
};

export interface CanvasAnalysisOutput {
  colorPixelCount: number;
  totalPixels: number;
  contentPixels: number;
  colorRatio: number;
  colorContentRatio: number;
  maxDelta: number;
  detectedClassification: PageClassification;
}

/**
 * Analyzes pixel data from a rendered page canvas to determine color presence.
 * Uses strict delta-RGB and scanner noise filtering.
 */
export function analyzeCanvasPixels(
  canvas: HTMLCanvasElement,
  settings: DetectionSettings = DEFAULT_DETECTION_SETTINGS
): CanvasAnalysisOutput {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Gagal mendapatkan 2D context dari canvas.');
  }

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  let totalPixels = 0;
  let contentPixels = 0;
  let coloredPixels = 0;
  let maxDelta = 0;

  // Step sampling for fast performance while ensuring dense coverage
  // A step of 1 analyzes every single pixel on canvas (600px width is ~450k pixels, very fast in JS)
  const step = 1;

  for (let i = 0; i < len; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent or semi-transparent background
    if (a < 30) continue;

    totalPixels++;

    // Calculate lightness (perceived average)
    const lightness = (r + g + b) / 3;

    // Check for pure or near-pure white paper background
    if (r >= 250 && g >= 250 && b >= 250) {
      continue;
    }

    contentPixels++;

    // Chromatic spread: difference between max and min color channels
    const maxCh = Math.max(r, g, b);
    const minCh = Math.min(r, g, b);
    const delta = maxCh - minCh;

    if (delta > maxDelta) {
      maxDelta = delta;
    }

    // Filter out scanner yellowing/paper aging:
    // Scanned documents often have warm paper backgrounds (e.g. R=242, G=238, B=224 => delta=18)
    if (lightness > 195 && delta <= settings.noiseTolerance) {
      continue;
    }

    // Filter out dark ink shadow / monochrome printer dither noise
    if (lightness < 45 && delta <= 14) {
      continue;
    }

    // Check if pixel exhibits significant color
    if (delta >= settings.colorDeltaThreshold) {
      coloredPixels++;
    }
  }

  const effectiveTotal = Math.max(1, totalPixels);
  const effectiveContent = Math.max(1, contentPixels);

  const colorRatio = (coloredPixels / effectiveTotal) * 100;
  const colorContentRatio = (coloredPixels / effectiveContent) * 100;

  // Classification decision tree:
  // 1. Color:
  //    - Ratio exceeds configured minColorProportion, OR
  //    - Sufficient cluster of high-delta colored pixels (e.g. official red/blue ink stamp or logo: >= 150 pixels with maxDelta >= 45)
  // 2. Review:
  //    - Near the threshold, or small faint color marks
  // 3. Black & White:
  //    - Truly monochrome, grayscale text, or below review boundary

  let detectedClassification: PageClassification = 'bw';

  const isClearColorProportion = colorRatio >= settings.minColorProportion;
  const isHighDeltaFocalColor = coloredPixels >= 150 && maxDelta >= 48;

  if (isClearColorProportion || isHighDeltaFocalColor) {
    detectedClassification = 'color';
  } else {
    // Check borderline review zone
    const reviewThresholdRatio = settings.minColorProportion * settings.reviewToleranceRatio;
    const isBorderlineRatio = colorRatio >= reviewThresholdRatio;
    const isBorderlineSmallCluster = coloredPixels >= 35 && maxDelta >= 28;

    if (isBorderlineRatio || isBorderlineSmallCluster) {
      detectedClassification = 'review';
    } else {
      detectedClassification = 'bw';
    }
  }

  return {
    colorPixelCount: coloredPixels,
    totalPixels: effectiveTotal,
    contentPixels: effectiveContent,
    colorRatio: Number(colorRatio.toFixed(3)),
    colorContentRatio: Number(colorContentRatio.toFixed(3)),
    maxDelta,
    detectedClassification,
  };
}

/**
 * Helper to compute effective classification given manual override
 */
export function getEffectiveClassification(
  detected: PageClassification,
  override: PageAnalysisResult['manualOverride']
): PageClassification {
  if (override === 'force_color') return 'color';
  if (override === 'force_bw') return 'bw';
  return detected;
}
