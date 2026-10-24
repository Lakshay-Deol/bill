/**
 * Invariant 6: It is tasteOverlap, never "audience overlap".
 * Affinity is cosine similarity of embeddings, not measured ticket-buyer intersection.
 */

export function getTasteOverlap(
  actAId: string,
  actBId: string,
  matrix: Record<string, Record<string, number>>
): number {
  if (actAId === actBId) return 1.0;

  const rowA = matrix[actAId];
  if (rowA && rowA[actBId] !== undefined) {
    return rowA[actBId]!;
  }

  const rowB = matrix[actBId];
  if (rowB && rowB[actAId] !== undefined) {
    return rowB[actAId]!;
  }

  return 0.0;
}
