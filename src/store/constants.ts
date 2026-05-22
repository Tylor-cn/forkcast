// 权重范围
export const WEIGHT_MIN = 0.2
export const WEIGHT_MAX = 3.0

// 标签反馈系数
export const REJECT_SHORT_PENALTY = 0.35
export const REJECT_LONG_PENALTY = 0.75
export const REJECT_ASSOCIATION_PENALTY = 0.35
export const PICK_SHORT_BOOST = 1.5
export const PICK_LONG_BOOST = 1.1
export const BACKUP_SHORT_BOOST = 1.2
export const BACKUP_LONG_BOOST = 1.05

// 连续拒绝升级系数
export const CONSECUTIVE_REJECT_FACTOR = 0.12
export const MAX_CONSECUTIVE_PENALTY = 0.6

// 选择免疫窗口（24小时内选过的菜不传播关联惩罚）
export const PICK_IMMUNITY_MS = 24 * 60 * 60 * 1000

// 菜系反馈系数
export const CUISINE_REJECT_SHORT_PENALTY = 0.5
export const CUISINE_REJECT_LONG_PENALTY = 0.75
export const CUISINE_PICK_SHORT_BOOST = 1.3
export const CUISINE_PICK_LONG_BOOST = 1.05
export const CUISINE_BACKUP_SHORT_BOOST = 1.15
export const CUISINE_BACKUP_LONG_BOOST = 1.03

// 时间衰减常数（tau）
export const DISH_DECAY_TAU = 2 * 24 * 60 * 60 * 1000
export const CUISINE_DECAY_TAU = 7 * 24 * 60 * 60 * 1000

// 上下文加成
export const CONTEXT_BONUS_TIME = 1.3
export const CONTEXT_BONUS_SEASON = 1.15

// 已展示惩罚值
export type ShownResult = 'shown' | 'backup' | 'reject' | 'pick'

export const SHOWN_PENALTY_VALUES: Record<ShownResult, number> = {
  pick: 1.0,
  backup: 0.85,
  reject: 0.3,
  shown: 0.5,
}
