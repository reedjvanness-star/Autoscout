'use client';
import {useId} from 'react';
import {Input} from '@/components/ui/input';
import {Slider} from '@/components/ui/slider';

export function RangeChoice({label,value,onChange,min,max,step,format,presets}:{label:string;value:number|null;onChange:(n:number|null)=>void;min:number;max:number;step:number;format:(n:number)=>string;presets:number[]}){
 const id=useId(),upper=Math.max(max,value??max);
 return <div className="range-choice" role="group" aria-label={label}>
  <div className="range-heading"><label htmlFor={id}>{label}</label><strong>{value===null?'No maximum':format(value)}</strong></div>
  <Input id={id} className="range-exact" aria-label={`${label} amount`} type="number" inputMode="numeric" min={min} max={1000000} step={1} placeholder="No maximum" value={value??''} onChange={e=>{const raw=e.target.value;if(raw===''){onChange(null);return}const n=Number(raw);if(Number.isFinite(n)&&n>=0&&n<=1000000)onChange(Math.round(n))}} onBlur={()=>{if(value!==null&&value<min)onChange(min)}}/>
  <Slider aria-label={`${label} slider`} min={min} max={upper} step={step} value={[value??upper]} onValueChange={v=>onChange(v[0])}/>
  <div className="range-scale"><span>{format(min)}</span><button type="button" onClick={()=>onChange(null)} aria-pressed={value===null}>No maximum</button></div>
  <div className="range-presets">{presets.map(n=><button type="button" key={n} aria-pressed={value===n} onClick={()=>onChange(n)}>{format(n)}</button>)}</div>
 </div>;
}
