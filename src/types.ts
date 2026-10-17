export type PageClassification = 'color' | 'bw' | 'review';

export type ManualOverride = 'auto' | 'force_color' | 'force_bw';

export interface PageAnalysisResult {
  pageNumber: number; // 1-indexed
  classification: PageClassification; // Final effective classification
  detectedClassification: PageClassification; // Original algorithmic classification
  manualOverride: ManualOverride;
  colorPixelCount: number;
  totalPixels: number;
  contentPixels: number;
  colorRatio: number; // Percentage 0 - 100%
  colorContentRatio: number; // Percentage of non-white pixels
  maxDelta: number; // Maximum RGB deviation found
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface DetectionSettings {
  colorDeltaThreshold: number; // 10 - 60 (default 22) - delta max(R,G,B) - min(R,G,B)
  minColorProportion: number; // 0.01 - 2.0% (default 0.10%) - % of page pixels
  noiseTolerance: number; // 5 - 35 (default 18) - tolerance for scanner background tint
  reviewToleranceRatio: number; // 0.2 - 0.8 (default 0.5) - borderline factor for 'review'
}

export interface PrintPricing {
  colorPerPage: number;
  bwPerPage: number;
  duplexMode: 'simplex' | 'duplex';
}

export type ProcessingStatus =
  | 'idle'
  | 'loading_pdf'
  | 'scanning'
  | 'completed'
  | 'exporting'
  | 'error';

export interface ScanProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  statusText: string;
}
