import { describe, expect, it } from "vitest";

import { calculateReviewMetrics } from "../../src/lib/reviews";

describe("review helpers", () => {
  it("return zero metrics when there are no reviews", () => {
    expect(calculateReviewMetrics([])).toEqual({
      rating: 0,
      reviewCount: 0
    });
  });

  it("calculate average rating and count", () => {
    expect(
      calculateReviewMetrics([
        { rating: 5 },
        { rating: 4 },
        { rating: 4 }
      ])
    ).toEqual({
      rating: 4.3,
      reviewCount: 3
    });
  });
});
