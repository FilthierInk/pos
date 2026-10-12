export const REGIMES = [
  ['601', '601 - General de Ley Personas Morales'],
  ['603', '603 - Personas Morales con Fines no Lucrativos'],
  ['605', '605 - Sueldos y Salarios'],
  ['606', '606 - Arrendamiento'],
  ['612', '612 - Personas Físicas con Actividades Empresariales'],
  ['616', '616 - Sin obligaciones fiscales'],
  ['621', '621 - Incorporación Fiscal'],
  ['626', '626 - RESICO'],
] as const

export const CFDI_USES = [
  ['G01', 'G01 - Adquisición de mercancías'],
  ['G03', 'G03 - Gastos en general'],
  ['S01', 'S01 - Sin efectos fiscales'],
  ['CP01', 'CP01 - Pagos'],
] as const

export const UNIT_KEYS = [
  ['H87', 'H87 - Pieza'],
  ['E48', 'E48 - Unidad de servicio'],
  ['KGM', 'KGM - Kilogramo'],
  ['LTR', 'LTR - Litro'],
  ['MTR', 'MTR - Metro'],
  ['XBX', 'XBX - Caja'],
] as const

export const IVA_RATES = ['16', '8', '0'] as const