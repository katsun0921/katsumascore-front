/** ビルド中のWP応答を本文のバイト数に上限を設けて共有する。ストリームは保持しない。 */
export type BufferedWpResponse = {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: ArrayBuffer;
};

/**
 * 既定256MiB以内の成功応答だけを保持するキャッシュを作る。
 * 上限超過分は取得中だけ共有し、失敗は保存しない。URLや本文をディスクに書き出さない。
 */
export const createWpResponseCache = (maxBytes = 256 * 1024 * 1024) => {
  const entries = new Map<string, Promise<BufferedWpResponse>>();
  let cachedBytes = 0;

  /** 同じキーの取得中・取得済み応答を共有し、未取得ならloaderを一度だけ呼び出す。 */
  const getOrFetch = (key: string, loader: () => Promise<BufferedWpResponse>): Promise<BufferedWpResponse> => {
    const cached = entries.get(key);
    if (cached) return cached;
    const pending = Promise.resolve().then(loader).then((response) => {
      if (cachedBytes + response.body.byteLength <= maxBytes) cachedBytes += response.body.byteLength;
      else entries.delete(key);
      return response;
    }).catch((error: unknown) => {
      entries.delete(key);
      throw error;
    });
    entries.set(key, pending);
    return pending;
  };

  return { getOrFetch };
};
