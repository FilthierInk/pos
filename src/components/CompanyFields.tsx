import { CFDI_USES, REGIMES } from '../catalogs'
import type { CompanyData } from '../company'

export default function CompanyFields({
  value,
  onChange,
  legalNamePlaceholder,
}: {
  value: CompanyData
  onChange: (v: CompanyData) => void
  legalNamePlaceholder?: string
}) {
  const set = (patch: Partial<CompanyData>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Legal name (as in the Constancia)</label>
        <input
          className="input"
          placeholder={legalNamePlaceholder}
          value={value.legalName}
          onChange={(e) => set({ legalName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">RFC</label>
          <input
            className="input uppercase"
            maxLength={13}
            value={value.rfc}
            onChange={(e) => set({ rfc: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Fiscal postal code</label>
          <input
            className="input"
            maxLength={5}
            inputMode="numeric"
            value={value.zip}
            onChange={(e) => set({ zip: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="label">Tax regime</label>
        <select
          className="input"
          value={value.regime}
          onChange={(e) => set({ regime: e.target.value })}
        >
          <option value="">Select...</option>
          {REGIMES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">CFDI use</label>
        <select
          className="input"
          value={value.cfdiUse}
          onChange={(e) => set({ cfdiUse: e.target.value })}
        >
          <option value="">Select...</option>
          {CFDI_USES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  )
}