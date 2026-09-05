'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import s from './TimeInput.module.css';

export type TimeInputProps = {
  /** Raw text as typed; parsing into seconds happens in the domain, not here. */
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  name?: string;
};

type Fields = { m: string; s: string; h: string };

const EMPTY_FIELDS: Fields = { m: '', s: '', h: '' };

const FIELD_ORDER: readonly (keyof Fields)[] = ['m', 's', 'h'];

/** The three fields and their captions, in the order they print: minutes, seconds, hundredths. */
const FIELD_META: Record<keyof Fields, { label: string; placeholder: string }> = {
  m: { label: 'м', placeholder: '0' },
  s: { label: 'с', placeholder: '00' },
  h: { label: 'сот', placeholder: '00' },
};

/** Digits and the three marks a swim time is written with. Nothing else gets into the quick field. */
const QUICK_ALLOWED = /^[0-9:.,]*$/;

const sanitizeQuick = (raw: string): string => raw.replace(/[^0-9:.,]/g, '');

const sanitizeField = (raw: string): string => raw.replace(/\D/g, '').slice(0, 2);

/** The three fields as one printed time, zeros where a field is blank; empty when all three are. */
const composeFields = ({ m, s, h }: Fields): string =>
  m === '' && s === '' && h === '' ? '' : `${m || '0'}:${s.padStart(2, '0')}.${h.padEnd(2, '0')}`;

/** Enter has nothing to submit: it only puts the keyboard away. */
const blurOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') event.currentTarget.blur();
};

/**
 * Two ways to type a time, both always in view, the way fina.borozdov.ru does it: three
 * fields `м : с . сот` that hand the caret on after two digits, and one quick line for
 * any notation. Whichever was typed last wins and clears the other.
 */
export function TimeInput({ value, onChange, invalid = false, name }: TimeInputProps) {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [quick, setQuick] = useState('');
  const refs = useRef<Record<keyof Fields, HTMLInputElement | null>>({ m: null, s: null, h: null });
  const emitted = useRef(value);

  // A value that did not come from here, a link's query for one, lands in the quick line.
  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    setQuick(value);
    setFields(EMPTY_FIELDS);
  }, [value]);

  const emit = (next: string) => {
    emitted.current = next;
    onChange(next);
  };

  const handleField = (key: keyof Fields, raw: string) => {
    const digits = sanitizeField(raw);
    const next = { ...fields, [key]: digits };
    setFields(next);
    setQuick('');
    emit(composeFields(next));
    const following = FIELD_ORDER[FIELD_ORDER.indexOf(key) + 1];
    if (digits.length === 2 && following !== undefined) {
      const target = refs.current[following];
      target?.focus();
      target?.select();
    }
  };

  const handleQuick = (raw: string) => {
    const next = sanitizeQuick(raw);
    setQuick(next);
    setFields(EMPTY_FIELDS);
    emit(next);
  };

  // Block the keystroke rather than clean up after it, so the caret never jumps.
  const handleQuickBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const native = event.nativeEvent;
    if (!(native instanceof InputEvent) || native.data === null) return;
    if (!QUICK_ALLOWED.test(native.data)) event.preventDefault();
  };

  const handleQuickPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    handleQuick(event.clipboardData.getData('text'));
  };

  return (
    <div className={s.root}>
      <div className={s.row}>
        {FIELD_ORDER.map((key, index) => (
          <div key={key} className={s.field} data-sep={index === 0 ? undefined : ''}>
            {index === 0 ? null : (
              <span className={s.sep} aria-hidden="true">
                {index === 1 ? ':' : '.'}
              </span>
            )}
            <div className={s.cell}>
              <label className={s.fieldLabel} htmlFor={`${id}-${key}`}>
                {FIELD_META[key].label}
              </label>
              <input
                ref={(element) => {
                  refs.current[key] = element;
                }}
                id={`${id}-${key}`}
                className={s.fieldInput}
                type="text"
                inputMode="numeric"
                enterKeyHint="done"
                maxLength={2}
                placeholder={FIELD_META[key].placeholder}
                value={fields[key]}
                onChange={(event) => handleField(key, event.target.value)}
                onKeyUp={blurOnEnter}
                autoComplete="off"
              />
            </div>
          </div>
        ))}
      </div>
      <input
        id={`${id}-quick`}
        name={name}
        className={s.quick}
        type="text"
        inputMode="decimal"
        enterKeyHint="done"
        pattern="[0-9:.,]*"
        placeholder="или: 1:05.32 / 65.32 / 10532"
        aria-label="Время"
        aria-invalid={invalid}
        value={quick}
        onChange={(event) => handleQuick(event.target.value)}
        onBeforeInput={handleQuickBeforeInput}
        onPaste={handleQuickPaste}
        onKeyUp={blurOnEnter}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}
