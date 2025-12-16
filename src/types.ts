export interface SKAdNetworkItem {
  identifier: string;
}

export interface MergeResult {
  mergedXml: string;
  addedCount: number;
  totalCount: number;
  addedItems: string[];
}

export const TabOption = {
  MERGE: 'MERGE',
  AI_ANALYSIS: 'AI_ANALYSIS'
} as const;

export type TabOption = typeof TabOption[keyof typeof TabOption];