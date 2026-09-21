import {Info} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {Source} from '@/lib/domain';
export function SearchCoverage({sources,onDetails}:{sources:Source[];onDetails:()=>void}){
 const errors=sources.filter(source=>source.status==='error');
 if(!errors.length)return null;
 const limited=errors.some(source=>/quota|rate.*limit|allowance|429/i.test(source.detail));
 return <div className="search-coverage" role="status"><Info size={18}/><div><strong>{limited?'Some sources have reached a search limit':'Some sources couldn’t be checked'}</strong><p>Your matches are still here, but this search may be incomplete. Your requirements haven’t changed.</p></div><Button variant="ghost" size="sm" onClick={onDetails}>See source status</Button></div>;
}
