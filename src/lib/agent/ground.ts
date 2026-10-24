/**
 * Grounding filter enforcing Invariant 1:
 * "The LLM never emits a number that reaches the UI.
 * Every figure rendered comes from src/lib/model/ or a raw Qloo response.
 * Model narration may only cite fields present in the LineupReceipt."
 */

export interface GroundingResult {
  isGrounded: boolean;
  sanitizedText: string;
  unverifiedNumerals: string[];
}

export function groundNarration(
  text: string,
  receipt: Record<string, unknown>
): GroundingResult {
  // Extract all valid receipt numbers recursively
  const validNumbers = new Set<string>();

  function collectReceiptNumbers(obj: unknown) {
    if (typeof obj === "number") {
      validNumbers.add(obj.toString());
      validNumbers.add(Math.round(obj).toString());
      validNumbers.add(obj.toFixed(1));
      validNumbers.add(obj.toFixed(2));
      validNumbers.add((obj * 100).toFixed(0));
      validNumbers.add((obj * 100).toFixed(1));
    } else if (Array.isArray(obj)) {
      obj.forEach(collectReceiptNumbers);
    } else if (typeof obj === "object" && obj !== null) {
      Object.values(obj).forEach(collectReceiptNumbers);
    }
  }

  collectReceiptNumbers(receipt);

  // Allow standard small numbers (e.g. stage 1, stage 2, slot 1)
  for (let i = 1; i <= 20; i++) {
    validNumbers.add(i.toString());
  }

  // Regex to extract numerals (excluding dates/years like 2026 if needed)
  const numberRegex = /\b\d+(?:\.\d+)?\b/g;
  const matches = text.match(numberRegex) ?? [];

  const unverifiedNumerals: string[] = [];

  for (const match of matches) {
    // If not in receipt valid numbers
    if (!validNumbers.has(match)) {
      unverifiedNumerals.push(match);
    }
  }

  let sanitizedText = text;
  if (unverifiedNumerals.length > 0) {
    // Redact unverified numbers to maintain Invariant 1
    for (const num of unverifiedNumerals) {
      sanitizedText = sanitizedText.replace(new RegExp(`\\b${num}\\b`, "g"), "[est. omitted]");
    }
  }

  return {
    isGrounded: unverifiedNumerals.length === 0,
    sanitizedText,
    unverifiedNumerals,
  };
}
