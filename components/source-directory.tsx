import type {Source} from '@/lib/domain';

export function SourceDirectory({sources}:{sources:Source[]}){
 const used=[...new Set(sources.filter(s=>s.status==='searched'&&(s.count??0)>0).map(s=>s.name.split(' · ')[0]))];
 if(!used.length)return null;
 return <div className="source-badges" aria-label="Sources used">{used.map(name=><span className="source-name" key={name}>{name}</span>)}</div>;
}
