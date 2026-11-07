# ESLintプラグイン3件のセキュリティ・必要性調査

調査日: 2026年11月7日。対象環境: ESLint 10.13.0 / eslint-config-next 16.4.5 / TypeScript 6.0.3。

## 結論

ESLint 9までのpeer指定は、対応バージョンの宣言の問題であり、脆弱性の検出を意味しない。現在の解決済み依存ではnpm auditは全体で0件、OSVでも対象バージョン3件に該当する脆弱性の登録はなかった。既知の脆弱性を理由に直ちに3件すべてを撤去する根拠は確認できない。ただし、監査0件は未知の脆弱性や依存パッケージの将来の改ざんまで保証しない。

| プラグイン | バージョン | 現在の利用 | 判断 |
| --- | --- | --- | --- |
| eslint-plugin-import | 2.32.0 | `import/no-anonymous-default-export` のwarn 1ルール | 削除・置換候補。現在の役割は命名方針の補助で、必須のセキュリティ検査ではない。 |
| eslint-plugin-jsx-a11y | 6.10.2 | alt / ARIA / role関連のwarn 6ルール | 維持を推奨。TypeScriptや未使用import検査では代替できないアクセシビリティ検査。 |
| eslint-plugin-react | 7.37.5 | 現在は `react/*` が無効 | 維持し、有用なルールの再有効化を推奨。現在は実質的に検査を使っていないが、更新後のNext設定で復帰できることを確認。 |

ここでの維持・削除の判断は本プロジェクトの実効設定に基づく。プラグインが提供する全ルールを使っているという意味ではない。

## セキュリティの確認

- `npm audit --json`: info / low / moderate / high / criticalがすべて0件。プラグイン自身に加え、現在インストールされた間接依存も対象。
- [OSV API](https://google.github.io/osv.dev/post-v1-querybatch/): ecosystemをnpm、上記3つのパッケージ名・バージョンとして照合し、それぞれ `vulns` は空。
- GitHubの公開Security Advisoriesでは[import](https://github.com/import-js/eslint-plugin-import/security/advisories)、[jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/security/advisories)に公開アドバイザリなしの表示を確認。reactのadvisoriesページは取得できず、この経路の不在確認は断定せずnpm auditとOSVの結果で評価した。
- 対象3パッケージのmanifestにはpreinstall / install / postinstallスクリプトなし。ただしLint時にはNode.jsコードとして実行されるため、開発環境・CIに対する供給網リスクは通常の開発依存と同様に存在する。
- 依存経路はdevDependenciesの `eslint-config-next → 各プラグイン`。アプリケーションコードからの直接importは見つからず、調査時の `.next/static`、`.open-next/server-functions`、`.open-next/worker.js` にもパッケージ名の一致はなかった。公開ページの入力を処理するために導入しているものではない。文字列検索だけでビルド成果物への混入の完全な不在まで証明するものではない。
- これらはLint用プラグインであり、アプリケーション全体のセキュリティスキャンやHTMLのサニタイズを代替しない。

## eslint-plugin-import

[公式の役割](https://github.com/import-js/eslint-plugin-import)はimportの整合性・構造等の検査だが、本プロジェクトで有効なのは匿名default exportを警告する1ルールだけ。

- `import/no-unresolved`、`import/no-cycle` 等は現在有効ではない。
- TypeScriptと `unused-imports/no-unused-imports` が存在するが、匿名default exportという命名ルール自体は代替しない。
- 匿名default export禁止が必要なら、その1ルールを残すか、ESLintコアルールのASTセレクター・既存の独自プラグイン等で置き換える選択肢がある。移行する場合は対象構文と例外の同等性を別途検証する。
- 現状の検査範囲に対して依存の規模が大きく、3件の中では削除候補としての優先順位が高い。

参考: [no-anonymous-default-export](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-anonymous-default-export.md)。

## eslint-plugin-jsx-a11y

現在有効な6ルールは次のとおり。いずれもwarn。

- `jsx-a11y/alt-text`（Next Imageを含む設定）
- `jsx-a11y/aria-props`
- `jsx-a11y/aria-proptypes`
- `jsx-a11y/aria-unsupported-elements`
- `jsx-a11y/role-has-required-aria-props`
- `jsx-a11y/role-supports-aria-props`

画像代替テキスト、ARIA属性、roleの要件はTypeScriptだけで十分に検査できない。UIの品質を保つため残す価値がある。なお、全アクセシビリティルールを有効にしているわけではなく、クリックとキーボード操作の対応等をこの設定だけで保証することはできない。warnなので、通常の `npm run lint` では警告だけを理由にCIが失敗する設定にもなっていない。

参考: [公式README・ルール一覧](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)。

## eslint-plugin-react

`eslint.config.mjs` は旧API互換性への対処としてReactルールを一括でoffにしている。したがって現在の設定のままでは、このプラグインによる実効的な検査はない。

一方、更新済み `eslint-config-next` 16.4.5には `dist/rule-context.js` の互換処理があり、reactとimportのルールは `fixupPluginRules` を通して登録される。削除された `context.getFilename()` 等を補完するため、以前の「ESLint 10だから一律offが必要」という説明は、この更新後の環境には当てはまらない。

- 設定ファイルを書き換えず、ESLint Node APIのoverrideでNext標準のReactルールを一時的に復帰した。
- リポジトリの通常Lint対象全体を検査し、例外・エラー・警告は0件だった。
- `react/jsx-key` はTypeScriptで十分には代替できない。配列内JSXのkey欠落を、現在の設定では検出せず、復帰後は検出した。
- `react/no-danger-with-children` も復帰後に検出できた。このルールはchildrenとdangerouslySetInnerHTMLの併用を禁止するものであり、HTMLを安全に変換したりXSSを包括的に防いだりするものではない。
- `prop-types`、旧JSX変換向けのReactスコープ要件等はTypeScript・新JSX変換の構成では必要性が低い。Next標準でも無効なものを一律に有効化する方針にはしない。

判断は「現在offだから削除」より「有用なルールを戻して活用」を推奨する。peer指定自体がESLint 10に正式対応したわけではないため、npmの警告は引き続き残る。

参考: [公式README](https://github.com/jsx-eslint/eslint-plugin-react)、[jsx-key](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md)、[no-danger-with-children](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger-with-children.md)。互換処理の根拠はインストール済み `node_modules/eslint-config-next/dist/index.js` と `dist/rule-context.js`。

## 再現・検証結果

`ESLint.calculateConfigForFile` でTOP、HomeTemplate、Story、libsの代表4ファイルの実効ルールを取得した。続いて `lintText` に保存しない問題コードを渡して検出を確認した。

| 問題コード | 現在の設定で対象ルールが検出 | 対象ルールを有効にすると検出 |
| --- | --- | --- |
| 匿名default export | 1件 | 1件 |
| 画像altなし | 1件 | 1件 |
| 不正なARIA属性 | 1件 | 1件 |
| 配列内JSXのkeyなし | 0件 | 1件 |
| dangerouslySetInnerHTMLとchildrenの併用 | 0件 | 1件 |

上記はセキュリティ侵入試験ではなく、実効設定とルールの動作確認。

## 削除する場合の制約と推奨順序

3件はいずれも `eslint-config-next` がimportする間接依存なので、単に `npm uninstall` したり `rules: off` にしたりしても依存ツリーからは除去できない。実際に取り除くにはNextプリセットの構成を変え、Next固有・TypeScript・React Hooks等の必要な検査を維持する移行が必要。

1. ReactのNext標準ルールを再有効化する。更新後の環境では実行可能で、検査を失っている状態を改善できる。
2. jsx-a11yは維持する。
3. importの匿名default export検査を必要とするかを決める。不要、または代替実装を用意できるなら削除候補とする。
4. 依存パッケージそのものを減らす段階で、Nextプリセットを置き換えるコストと検査の維持を評価する。警告を隠すだけのpeer overrideは追加しない。

初回は調査のみとし、ESLint設定、アプリケーションコード、依存パッケージは変更しなかった。

## 追記: eslint-plugin-importの削除を実施

ユーザーの削除指示を受け、`eslint-plugin-import` を実際の依存ツリーから除去した。

- `eslint-config-next` は対象プラグインを必ずimportするため、このプリセットを削除。`@next/eslint-plugin-next`、typescript-eslint、React、React Hooks、jsx-a11y、globalsを直接依存として宣言し、必要なルールを `eslint.config.mjs` に構成した。
- `eslint-plugin-import`、`eslint-import-resolver-node`、`eslint-import-resolver-typescript` とそれらの不要な間接依存がlockfileからなくなった。
- 匿名default export禁止の警告は削除した。`unused-imports` による未使用importの検査は残す。
- Nextプリセットが提供していた旧API互換処理は、[公式の@eslint/compat](https://eslint.org/blog/2024/05/eslint-compatibility-utilities/) に置き換えた。React / jsx-a11yに `fixupPluginRules` を適用する。
- 残すReact / jsx-a11yを直接依存にすると、ESLint 10を含まないpeer指定により通常のnpm installがERESOLVEで失敗した。そこで、この2パッケージに限り `overrides` で `eslint: "$eslint"` を指定した。旧プリセット任せで警告を許容していた構成から、互換ユーティリティと検証を伴う明示的な暫定措置へ変更した。これはプラグイン自身のESLint 10正式対応を意味せず、上流対応後に撤去する。`--force` / `--legacy-peer-deps` は使用していない。
- Reactルールの既存off設定は今回の削除と分離し、そのままとした。Reactルールの再有効化は今後の変更対象。

検証:

- TOP、libs、Storybook設定、ESLint設定、独自ルール、Next設定の代表6ファイルで、変更前後の実効ルールを比較。差分は `import/no-anonymous-default-export` の削除のみ。
- `npm run lint`、`npm run typecheck` が成功。
- `npm run test:eslint-config` を追加し、依存・設定からの削除、Next / alt / ARIA / TypeScript / Hooks / 未使用importの実際の検出、ReactルールのESLint 10上での実行を検証。9件成功。
- `npm ci --ignore-scripts` によるクリーンインストールも成功し、監査0件を再現した。node-domexceptionの既知の非推奨通知は残るが、3プラグインについてのERESOLVE警告は出なくなった。
