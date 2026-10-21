import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import freezeIncrementalCache from "./open-next.freeze-cache";

// SSG 凍結ブランチ専用: ビルド時に事前生成した HTML / データを静的アセットから読み出す（読み取り専用）。
// 未設定（dummy）だと実行時にページを再生成し、WordPress へ取りにいってしまう。
// `process.env` による切り替えは Worker へバンドルされると実行時式になり dummy へ戻るため、無条件に設定している。
// main には持ち込まないこと（docs/ssg-freeze-deploy.md）。
export default defineCloudflareConfig({ incrementalCache: freezeIncrementalCache });
