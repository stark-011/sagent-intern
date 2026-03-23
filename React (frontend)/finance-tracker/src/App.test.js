import { calculateGoalProgress } from "./utils/finance";

test("calculateGoalProgress returns 0 when target is 0", () => {
  expect(calculateGoalProgress(100, 0)).toBe(0);
});

test("calculateGoalProgress caps at 100", () => {
  expect(calculateGoalProgress(500, 200)).toBe(100);
});
