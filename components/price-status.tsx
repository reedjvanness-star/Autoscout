'use client';
import type {Listing} from '@/lib/domain';
import {money} from '@/lib/domain';
export function PriceStatus({car}:{car:Listing}){
  const r=car.priceReview;
  const fresh=r&&Date.now()-Date.parse(r.checkedAt)<24*3600000;
  return <div className="price-evidence"><strong>{car.priceWarning?'Price needs confirmation':fresh&&r&&(r.status==='matched'||r.status==='corrected')?'Source price checked':'Price not confirmed at source'}</strong>
    {r&&<><p>{r.note}</p>{r.status==='corrected'&&<small>Provider originally reported {money(r.reportedPrice)}.</small>}<small>Source check: {new Date(r.checkedAt).toLocaleString()}</small></>}
    {!r&&<p>This amount comes from an inventory feed. Check the seller’s full cash price before relying on it.</p>}
  </div>
}
export function PriceSummary({listings,onCheck,busy,progress}:{listings:Listing[];onCheck:()=>void;busy:boolean;progress:string}){
  if(!listings.length)return null;
  const checked=listings.filter(r=>r.priceReview&&Date.now()-Date.parse(r.priceReview.checkedAt)<24*3600000&&['matched','corrected'].includes(r.priceReview.status)).length;
  return <details className="price-audit-summary" aria-label="Price accuracy"><summary>About these prices</summary><p>Prices are reported by listing sources. {checked} of {listings.length} have been checked against the seller’s page. Confirm the full cash price, taxes and fees before buying. Known discounts and payment amounts are withheld.</p><button disabled={busy} onClick={onCheck}>Check prices with sellers’ pages</button>{progress&&<span role="status">{progress}</span>}</details>
}
