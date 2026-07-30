import Image from 'next/image';

export type TPersonAvatarVariant = 'actor' | 'actress' | 'director' | 'voiceActor'

export type TPersonRole = 'actor' | 'actress' | 'director' | 'voice_actor'

export type TPersonAvatarProps = {
  roles: TPersonRole[]
  name: string
  className?: string
}

const variantLabels: Record<TPersonAvatarVariant, string> = {
  actor: '俳優',
  actress: '俳優',
  director: '監督',
  voiceActor: '声優',
};

const variantImageMap: Record<TPersonAvatarVariant, string> = {
  actor: '/images/person/actor-illustration.webp',
  actress: '/images/person/actress-illustration.webp',
  director: '/images/person/director-illustration.webp',
  voiceActor: '/images/person/voice-actor-illustration.webp',
};

/**
 * WordPress側で登録された roles（俳優/女優/監督/声優）を表示バリアントへ直接紐づけるMap。
 * 登録順が複数ロール保持時の優先度（監督＞俳優＞女優＞声優）になる。
 */
const roleVariantMap = new Map<TPersonRole, TPersonAvatarVariant>([
  ['director', 'director'],
  ['actor', 'actor'],
  ['actress', 'actress'],
  ['voice_actor', 'voiceActor'],
]);

/** roles からプレースホルダーのバリアントを判定する。複数ロールを持つ場合はMapの登録順を優先度として先勝ちで決定する。 */
export const resolvePersonAvatarVariant = (roles: TPersonRole[]): TPersonAvatarVariant => {
  for (const [role, variant] of roleVariantMap) {
    if (roles.includes(role)) return variant;
  }
  return 'actor';
};

/** サムネイル未登録時に職業（俳優/女優/監督/声優）別に出し分けるオリジナルプレースホルダー画像。 */
export const PersonAvatar = ({ roles, name, className }: TPersonAvatarProps) => {
  const variant = resolvePersonAvatarVariant(roles);

  return (
    <div
      data-component='PersonAvatar'
      role='img'
      aria-label={`${name}（${variantLabels[variant]}）のプレースホルダー画像`}
      className={`relative overflow-hidden ${className ?? ''}`}
    >
      <Image src={variantImageMap[variant]} alt='' fill className='object-contain' />
    </div>
  );
};
