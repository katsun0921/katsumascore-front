import { useCallback, useSyncExternalStore } from 'react';
import { readSayoConsent, saveSayoConsent, subscribeSayoConsent } from '@/libs/sayoConsent';

export type SayoConsentState = {
  /** 同意済みか。サーバー描画・読み込み前は null（まだ分からない） */
  agreed: boolean | null;
  /** 同意を保存する */
  agree: () => void;
};

/** サーバー描画では「まだ分からない」とする（localStorage はブラウザにしかない） */
const getServerSnapshot = (): boolean | null => null;

/**
 * サヨの利用規約に同意済みかを読む。保存先は localStorage（libs/sayoConsent）。
 * 別のタブで同意したときも追従する。
 */
export const useSayoConsent = (): SayoConsentState => {
  const agreed = useSyncExternalStore<boolean | null>(subscribeSayoConsent, () => readSayoConsent(), getServerSnapshot);
  const agree = useCallback(() => saveSayoConsent(), []);
  return { agreed, agree };
};
