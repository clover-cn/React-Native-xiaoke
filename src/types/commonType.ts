// 计算操作类型
export type ComputeType = '+' | '-' | '*' | '/';

// 计算结果接口
export interface ComputeResult {
  /** 计算结果 */
  result: number | string;
  /**
   * 继续计算
   * @param nextType 继续计算方式
   * @param nextValue 继续计算的值 - 支持number、string类型
   */
  next(nextType: ComputeType, nextValue: number | string): ComputeResult;
}