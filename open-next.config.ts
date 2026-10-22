import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';

// SSGの生成済みページとblocking生成を永続化し、一覧の時限ISRも同じストアで維持する。
export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache, queue: doQueue });
