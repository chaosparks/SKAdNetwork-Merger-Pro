export interface SKAdNetworkItem {
  identifier: string;
}

export interface MergeResult {
  mergedXml: string;
  addedCount: number;
  totalCount: number;
  addedItems: string[];
}

export enum TabOption {
  MERGE = 'MERGE',
  AI_ANALYSIS = 'AI_ANALYSIS'
}
