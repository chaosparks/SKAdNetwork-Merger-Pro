import { type MergeResult } from '../types';

/**
 * robustly extracts SKAdNetwork strings from any text/xml block using Regex.
 * This is often more reliable than DOMParser for partial snippets users might paste.
 */
export const extractIds = (input: string): string[] => {
  // Regex to find patterns like >xxxx.skadnetwork< or "xxxx.skadnetwork"
  // It captures the ID part.
  const regex = /(?:>|")([a-zA-Z0-9]{10}\.skadnetwork)(?:<|")/gi;
  const matches = input.matchAll(regex);
  const ids = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      ids.add(match[1].toLowerCase());
    }
  }

  // Fallback: look for just the strings if they are paste as a raw list
  if (ids.size === 0) {
    const rawRegex = /([a-zA-Z0-9]{10}\.skadnetwork)/gi;
    const rawMatches = input.matchAll(rawRegex);
    for (const match of rawMatches) {
        if(match[1]) ids.add(match[1].toLowerCase());
    }
  }

  return Array.from(ids);
};

export const generateXmlBlock = (ids: string[]): string => {
  const items = ids.map(
    (id) => `  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>${id}</string>
  </dict>`
  ).join('\n');

  return `<key>SKAdNetworkItems</key>
<array>
${items}
</array>`;
};

export const mergeSkAdNetworks = (baseContent: string, newContent: string): MergeResult => {
  // 1. Extract IDs
  const baseIdsRaw = extractIds(baseContent);
  const newIdsRaw = extractIds(newContent);
  
  const baseIdsSet = new Set(baseIdsRaw);
  const idsToAdd: string[] = [];

  // 2. Identify strictly new IDs (not present in base)
  newIdsRaw.forEach(id => {
    if (!baseIdsSet.has(id)) {
      if (!idsToAdd.includes(id)) {
        idsToAdd.push(id);
      }
    }
  });

  // 3. Construct result by appending to the end of baseContent
  let mergedXml = baseContent;
  
  if (idsToAdd.length > 0) {
    // Check format of baseContent to decide how to append
    
    // Case 1: Standard Plist Array </array>
    if (baseContent.includes('</array>')) {
      const insertion = idsToAdd.map(id => `\t<dict>\n\t\t<key>SKAdNetworkIdentifier</key>\n\t\t<string>${id}</string>\n\t</dict>`).join('\n');
      const lastIndex = mergedXml.lastIndexOf('</array>');
      // Insert before the last </array> tag
      mergedXml = mergedXml.slice(0, lastIndex) + insertion + '\n' + mergedXml.slice(lastIndex);
    
    // Case 2: Simplified XML </SKAdNetworkItems>
    } else if (baseContent.includes('</SKAdNetworkItems>')) {
      const insertion = idsToAdd.map(id => `  <SKAdNetworkIdentifier>${id}</SKAdNetworkIdentifier>`).join('\n');
      const lastIndex = mergedXml.lastIndexOf('</SKAdNetworkItems>');
      // Insert before the last </SKAdNetworkItems> tag
      mergedXml = mergedXml.slice(0, lastIndex) + insertion + '\n' + mergedXml.slice(lastIndex);
      
    // Case 3: Fallback (just append to end)
    } else {
      const insertion = generateXmlBlock(idsToAdd);
      mergedXml = mergedXml + '\n\n<!-- Added New Items -->\n' + insertion;
    }
  }

  return {
    mergedXml,
    addedCount: idsToAdd.length,
    totalCount: baseIdsSet.size + idsToAdd.length,
    addedItems: idsToAdd,
  };
};
