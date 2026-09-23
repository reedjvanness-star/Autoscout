import {money,type Workspace,type Listing} from './domain';
import {workspaceCars,restoreComparisons} from './shortlist';

// Rank collected inventory, never a provider's first three results or invented cars.
export function prepareChatComparison(w:Workspace,text:string){
 const cars=workspaceCars(w);
 const selected=w.compare.map(id=>cars.find(car=>car.id===id)).filter((car):car is Listing=>!!car);
 const byPrice=/\bcheapest\b|\blowest[ -](?:price|priced|cost|subtotal)\b|\bleast expensive\b/i.test(text);
 const selectedOnly=/\bselected\b|\bchosen\b|\bpicked\b/i.test(text);
 const count=/\b(?:two|2)\b/.test(text)?2:3;
 let list:Listing[];
 if(byPrice){
  const currentIds=new Set(w.listings.map(car=>car.id));
  list=(selectedOnly?selected:cars.filter(car=>currentIds.has(car.id)))
   .filter(car=>!car.priceWarning&&Number.isFinite(car.price)&&car.price>0&&Number.isFinite(car.total)&&car.total>0)
   .sort((a,b)=>a.total-b.total).slice(0,count);
 }else list=(selectedOnly?selected:selected.length?selected:cars.filter(car=>w.listings.some(row=>row.id===car.id))).slice(0,count);
 if(!list.length)return {text:selectedOnly&&!selected.length?'Choose Compare on two or three car cards first, or ask me to compare the cheapest cars in your results.':byPrice?'There are no cars with usable full prices to rank in these results. Check the asking prices or try another search.':'Search for cars first, then ask me to compare them.'};
 w.compare=list.map(car=>car.id);w.comparisonCars=list;restoreComparisons(w);
 const cheapest=[...list].filter(car=>!car.priceWarning&&Number.isFinite(car.total)&&car.total>0&&car.price>0).sort((a,b)=>a.total-b.total)[0];
 const intro=byPrice?`Added ${list.length} ${list.length===1?'car':'cars'} with the lowest known subtotals from ${selectedOnly?'your selected cars':'your current results'} to Compare.`:`Opened ${list.length} ${list.length===1?'car':'cars'} in Compare.`;
 const detail=list.length===1?' Add another car for a side-by-side comparison.':cheapest?` ${cheapest.title} has the lowest known subtotal at ${money(cheapest.total)}. Includes disclosed fees and your shipping reserve; taxes and unknown costs may be extra. Lowest price does not establish best overall value.`:' These prices need seller confirmation before comparing value.';
 return {text:intro+detail,ids:w.compare,target:'compare' as const};
}
