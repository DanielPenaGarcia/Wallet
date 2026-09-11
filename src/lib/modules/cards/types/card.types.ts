export type CardKind = 'debit' | 'credit';

/** Color hexadecimal utilizado para identificar una tarjeta en la interfaz. */
export type CardColor = `#${string}`;

/** Los importes se guardan en la unidad menor de la moneda, por ejemplo centavos. */
export type MoneyInMinorUnits = number;
