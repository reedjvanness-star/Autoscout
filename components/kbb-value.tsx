import type {Listing} from '@/lib/domain';

export function KbbResultValue(){
 return <footer className="kbb-result-value"><strong>KBB value range</strong><span>Not available · KBB data not connected</span><a href="https://www.kbb.com/car-values/" target="_blank" rel="noopener noreferrer">Look up on KBB ↗</a></footer>;
}

export function KbbValue({car}:{car:Listing}){
 return <section className="kbb-value"><h3>Kelley Blue Book value</h3><p>Compare this seller’s price with KBB’s value for the same vehicle, mileage and condition.</p><p><strong>{[car.year,car.make,car.model,car.trim].filter(Boolean).join(' ')}</strong><br/>{car.miles===null?'Mileage not disclosed':`${car.miles.toLocaleString()} miles`} · {[car.city,car.state].filter(Boolean).join(', ')||'Location not disclosed'}</p><a className="primary-link" href="https://www.kbb.com/car-values/" target="_blank" rel="noopener noreferrer">Check Kelley Blue Book value ↗</a><p className="helper">Opens KBB. Select the vehicle, trim, ZIP code and condition there. A KBB valuation has not been retrieved for this listing.</p></section>;
}
