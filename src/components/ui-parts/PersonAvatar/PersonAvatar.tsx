export type TPersonAvatarVariant = 'actor' | 'actress' | 'director' | 'voiceActor'

export type TPersonRole = 'actor' | 'actress' | 'director' | 'voice_actor'

export type TPersonAvatarProps = {
  roles: TPersonRole[]
  name: string
  className?: string
}

const variantLabels: Record<TPersonAvatarVariant, string> = {
  actor: '俳優',
  actress: '女優',
  director: '監督',
  voiceActor: '声優',
};

/** WordPress側で登録された roles（俳優/女優/監督/声優）を表示バリアントへ直接紐づけるMap。 */
const roleVariantMap = new Map<TPersonRole, TPersonAvatarVariant>([
  ['voice_actor', 'voiceActor'],
  ['director', 'director'],
  ['actress', 'actress'],
  ['actor', 'actor'],
]);

/** roles からプレースホルダーのバリアントを判定する。複数ロールを持つ場合はMapの登録順を優先度として先勝ちで決定する。 */
export const resolvePersonAvatarVariant = (roles: TPersonRole[]): TPersonAvatarVariant => {
  for (const [role, variant] of roleVariantMap) {
    if (roles.includes(role)) return variant;
  }
  return 'actor';
};

const Silhouette = ({ withHair }: { withHair: boolean }) => (
  <>
    {withHair && (
      <path
        d='M62,58 C58,28 78,12 100,12 C122,12 142,28 138,58 C146,66 146,84 136,92 L134,72 C124,80 76,80 66,72 L64,92 C54,84 54,66 62,58 Z'
        fill='currentColor'
        opacity={0.85}
      />
    )}
    <circle cx='100' cy='72' r='34' fill='currentColor' />
    <path d='M40,200 C40,142 66,112 100,112 C134,112 160,142 160,200 Z' fill='currentColor' />
  </>
);

const Badge = ({ variant }: { variant: TPersonAvatarVariant }) => {
  if (variant === 'director') {
    return (
      <g transform='translate(138,146)'>
        <circle cx='26' cy='26' r='26' className='fill-[var(--color-primary)]' />
        <rect x='12' y='16' width='28' height='18' rx='2' fill='#fff' />
        <path d='M12,16 L16,10 L22,10 L19,16 Z M24,16 L28,10 L34,10 L31,16 Z' fill='#fff' />
      </g>
    );
  }
  if (variant === 'voiceActor') {
    return (
      <g transform='translate(138,146)'>
        <circle cx='26' cy='26' r='26' className='fill-[var(--color-accent)]' />
        <rect x='21' y='12' width='10' height='18' rx='5' fill='#fff' />
        <path d='M16,26 a10,10 0 0 0 20,0' stroke='#fff' strokeWidth='3' fill='none' />
        <line x1='26' y1='36' x2='26' y2='42' stroke='#fff' strokeWidth='3' />
      </g>
    );
  }
  return null;
};

/** サムネイル未登録時に職業（俳優/女優/監督/声優）別に出し分けるオリジナルプレースホルダー画像。 */
export const PersonAvatar = ({ roles, name, className }: TPersonAvatarProps) => {
  const variant = resolvePersonAvatarVariant(roles);

  return (
    <div
      role='img'
      aria-label={`${name}（${variantLabels[variant]}）のプレースホルダー画像`}
      className={`flex items-center justify-center overflow-hidden text-[var(--color-border)] ${className ?? ''}`}
    >
      <svg viewBox='0 0 200 200' className='h-full w-full'>
        <Silhouette withHair={variant === 'actress'} />
        <Badge variant={variant} />
      </svg>
    </div>
  );
};
