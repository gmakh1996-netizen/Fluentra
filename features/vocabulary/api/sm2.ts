/**
 * SM-2 spaced-repetition scheduler. Pure function, no I/O — easy to unit test.
 * Given the prior state and a recall grade (0–5), returns the next interval,
 * ease factor, repetition count, and due date.
 */
export interface Sm2State {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

export function scheduleSm2(prev: Sm2State, grade: number): Sm2State & { dueDate: string } {
  let { intervalDays, easeFactor, repetitions } = prev;

  if (grade < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
    );
  }

  const due = new Date();
  due.setUTCDate(due.getUTCDate() + intervalDays);
  return { intervalDays, easeFactor, repetitions, dueDate: due.toISOString().slice(0, 10) };
}
