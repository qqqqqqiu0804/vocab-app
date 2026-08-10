/**
 * SM-2 遗忘曲线算法（Anki 同款）。
 * 每个单词维护一个调度状态，根据每次回忆质量更新。
 */

export interface SchedulingState {
  /** 难度因子，初始 2.5 */
  ef: number;
  /** 当前复习间隔（天） */
  interval: number;
  /** 连续答对次数 */
  repetitions: number;
  /** 下次应复习的时间戳（ms） */
  due: number;
}

export function initialScheduling(): SchedulingState {
  return { ef: 2.5, interval: 0, repetitions: 0, due: Date.now() };
}

/**
 * @param quality 回忆质量 0~5
 *   5 = 认识（轻松想起）  3 = 模糊  0 = 不认识
 */
export function review(state: SchedulingState, quality: number): SchedulingState {
  let { ef, interval, repetitions } = state;

  if (quality < 3) {
    // 没记住：重置连击，进入当日重学队列
    repetitions = 0;
    interval = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * ef);
  }

  // 更新难度因子，下限 1.3
  ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  const due = Date.now() + interval * 86_400_000;
  return { ef, interval, repetitions, due };
}

export function isDue(state: SchedulingState, now = Date.now()): boolean {
  return state.repetitions > 0 && state.due <= now;
}
