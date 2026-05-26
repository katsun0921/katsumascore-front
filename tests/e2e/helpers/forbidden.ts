/**
 * レンダリング後 HTML に含まれてはならない URL パターン。
 * CMS オリジンや内部ホストが外部に露出していないかを検査する。
 * 1 件でもヒットしたら URL 漏れとして fail する。
 */
export const FORBIDDEN_PATTERNS: RegExp[] = [
  /https?:\/\/wp\.katsumascore\.blog/i,
  /https?:\/\/[^/]*\.wp\.katsumascore\.blog/i,
  /https?:\/\/[a-z0-9-]+\.conoha\.io/i,
  /(?<!katsumascore\.blog)\/wp-content\/uploads\//i,
]
