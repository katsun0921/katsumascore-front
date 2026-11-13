/**
 * サヨ（AI映画店主）の立ち絵の場所。
 * 本番は ai-chat の `GET /api/chat/assets/sayo/{表情}.webp` へ差し替える予定（正式な立ち絵は受領待ち）。
 * いまは「仮」の画像1枚を public/images/sayo/ に置き、全表情で使う。
 */
import type { SayoExpression } from '@/types/sayo';

/** 顔のアイコン（丸く切り抜いて使う） */
export const SAYO_FACE_SRC = '/images/sayo/sayo-face.webp';

/** 立ち絵の元の大きさ（next/image の width / height に使う） */
export const SAYO_FULL_SIZE = { width: 900, height: 900 } as const;

/**
 * 表情ごとの立ち絵の場所を返す。
 * @param _expression 表情（正式な立ち絵が届くまでは同じ画像を返す）
 */
export const sayoFullSrc = (_expression: SayoExpression = 'default'): string => '/images/sayo/sayo-full.webp';
