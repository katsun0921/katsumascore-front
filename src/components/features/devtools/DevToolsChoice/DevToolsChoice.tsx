import type { ChangeEvent } from 'react';

export type DevToolsChoiceOption<T extends string> = {
  value: T;
  label: string;
  /** 選ぶとどうなるか（選んでいる間、下に出す） */
  description?: string;
  /** true で選べない */
  disabled?: boolean;
  /** 選べない理由（選べないときだけ出す） */
  disabledReason?: string;
};

export type DevToolsChoiceProps<T extends string> = {
  legend: string;
  /** 同じ画面に複数置くときに区別する名前 */
  name: string;
  value: T;
  options: readonly DevToolsChoiceOption<T>[];
  onChange: (value: T) => void;
  /** radio＝ラジオボタン（選択肢が少ないとき）／select＝プルダウン（多いとき） */
  display?: 'radio' | 'select';
};

/** 開発者ツールの「選択肢から1つ選ぶ」部品。パネルの設定項目すべてで使い回す（サヨのデータ源、ABテストの案など） */
export const DevToolsChoice = <T extends string>({ legend, name, value, options, onChange, display = 'radio' }: DevToolsChoiceProps<T>) => {
  const current = options.find((o) => o.value === value);
  const pick = (candidate: string) => {
    const hit = options.find((o) => o.value === candidate);
    if (hit && !hit.disabled) onChange(hit.value);
  };
  return (
    <fieldset data-component='DevToolsChoice' className='devToolsChoice'>
      <legend className='devToolsChoice__legend'>{legend}</legend>
      {display === 'select' ? (
        <select className='devToolsChoice__select' name={name} value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => pick(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
      ) : (
        options.map((o) => (
          <label key={o.value} className={`devToolsChoice__option${o.disabled ? ' is-disabled' : ''}`}>
            <input type='radio' name={name} value={o.value} checked={o.value === value} disabled={o.disabled} onChange={(e) => pick(e.target.value)} />
            <span>
              {o.label}
              {o.disabled && o.disabledReason && <small className='devToolsChoice__reason'>{o.disabledReason}</small>}
            </span>
          </label>
        ))
      )}
      {current?.description && <p className='devToolsChoice__desc'>{current.description}</p>}
    </fieldset>
  );
};
