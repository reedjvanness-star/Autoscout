import {marketValue} from '@/lib/market-value';
import {money,type Listing} from '@/lib/domain';

export function MarketValue({car,pool,expanded=false,onOpen}:{car:Listing;pool:Listing[];expanded?:boolean;onOpen?:(car:Listing)=>void}){
 const value=marketValue(car,pool);
 if(!value.available)return <section className={`market-value market-empty ${expanded?'':'market-compact'}`} aria-label="MotorScout price check: not enough data"><div className="market-brand">MOTORSCOUT <span>PRICE CHECK</span></div><strong>Not enough data to rate</strong><div className="market-gauge market-gauge-unrated" role="img" aria-label="Green means below the comparable range, yellow means within it, red means above it. This car has no rating yet."><div className="market-band"><i/><i/><i/></div><div className="market-legend"><span>Lower</span><span>Typical</span><span>Higher</span></div></div><p>{value.reason}</p><small>Independent asking-price comparison · Not KBB</small></section>;
 const label=value.rating==='below'?'Below market range':value.rating==='above'?'Above market range':'Within market range';
 const span=Math.max(value.high-value.low,value.median*.1),min=value.low-span,max=value.high+span;
 const marker=Math.max(3,Math.min(97,(car.price-min)/(max-min)*100));
 return <section className={`market-value market-${value.rating} ${expanded?'':'market-compact'}`} aria-label={`MotorScout price check: ${label}`}>
  <div className="market-brand">MOTORSCOUT <span>PRICE CHECK</span>{value.rating==='below'&&<span className="highlighted-deal">Highlighted deal</span>}</div>
  <div className="market-range"><div><small>Typical asking-price range</small><strong>{money(value.low)} – {money(value.high)}</strong></div><span className="market-rating">{label}</span></div>
  <div className="market-gauge" role="img" aria-label={`Asking price ${money(car.price)}. ${label}. Typical range ${money(value.low)} to ${money(value.high)}.`}><div className="market-marker" style={{left:`${marker}%`}}><span>▼</span></div><div className="market-band"><i style={{flex:span}}/><i style={{flex:value.high-value.low||1}}/><i style={{flex:span}}/></div><div className="market-legend"><span>Below</span><span>Typical</span><span>Above</span></div></div>
  <p className="market-difference">{money(Math.abs(value.difference))} {value.difference<0?'below':value.difference>0?'above':'from'} the median <span>({Math.abs(value.percent).toFixed(1)}%)</span></p>
  <div className="market-meta"><span>{value.count} comparable cars</span><span>{value.confidence} confidence</span></div>
  <small className="market-disclosure">{value.regional?`${car.state} listings`:'Nationwide comparison'} · Asking prices, not sale values. Not KBB.</small>
  {expanded&&<><details className="market-method"><summary>How we compare prices</summary><p>The middle 50% of asking prices for unique cars in your current search: same make, model, trim and seller type, within one model year and 20,000 miles. We prefer your car’s state when at least five matches exist. Unusual prices and listings older than 30 days are excluded.</p><p>Your search filters can narrow or bias this sample. We do not adjust for unknown condition, accident history, equipment, regional differences, taxes or fees. A green rating means a lower asking price, not a verified good deal. This is not a trade-in, private-party appraisal or official Kelley Blue Book value.</p></details><h3>Similar cars used for this estimate</h3><div className="market-comps">{value.comparables.map(c=><button key={c.id} type="button" onClick={()=>onOpen?.(c)} disabled={!onOpen}><span>{c.title}<small>{c.miles?.toLocaleString()} mi · {[c.city,c.state].filter(Boolean).join(', ')}</small></span><strong>{money(c.price)}</strong></button>)}</div></>}
 </section>;
}
