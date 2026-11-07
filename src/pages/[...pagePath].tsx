// SSG: WP固定ページの親子階層を保持する。jaを日次ビルド、未生成パスはblocking。正常ページにrevalidateなし。
export { default, getStaticProps } from './[slug]';
export { nestedPageStaticPaths as getStaticPaths } from '@/libs/api/wordpress/staticPaths';
