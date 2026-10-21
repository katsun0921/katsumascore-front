# log/

障害・緊急対応の記録を残すディレクトリ。設計ドキュメント（`docs/`）とは分け、**何が起きて、何を判断し、何をしたか**を時系列で残す。

## 2026-10-21 PHP 重大脆弱性に伴う緊急対応

| ファイル | 内容 |
|---|---|
| [2026-10-21_php-vulnerability.md](2026-10-21_php-vulnerability.md) | PHP の問題（発端・影響・判断） |
| [2026-10-21_wp-request-problem.md](2026-10-21_wp-request-problem.md) | WP へのリクエスト問題（実行時に WP へ依存していた箇所と対策） |
| [2026-10-21_image-problem.md](2026-10-21_image-problem.md) | 画像問題（WP 画像の扱いとダミー画像への差し替え） |
| [2026-10-21_emergency-ssg.md](2026-10-21_emergency-ssg.md) | 緊急対応としての SSG（実装・検証・デプロイ・復旧・残課題） |

関連ドキュメント: [`docs/ssg-freeze-inventory.md`](../docs/ssg-freeze-inventory.md)（事前調査）/ [`docs/ssg-freeze-deploy.md`](../docs/ssg-freeze-deploy.md)（ビルド・デプロイ・復旧手順）
