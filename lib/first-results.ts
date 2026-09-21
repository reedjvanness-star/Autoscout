import {firstCursor,type Filters,type SearchCursor} from './domain';
import {inventoryStatus,type InventoryKeys,type searchInventory} from './inventory';

// Return the first dealer/private feed without waiting for every secondary feed.
// The unchanged starting cursors let the next client batch check all other feeds.
export async function firstResults(filters:Filters,keys:InventoryKeys,search:typeof searchInventory){
 const slot=keys.autodev&&filters.seller!=='private'?'autodev':keys.marketcheck?(filters.seller==='private'?'private':'dealer'):null;
 if(!slot)return search(filters,keys);
 const start=firstCursor();
 const cursor:SearchCursor={dealer:null,private:null,auction:null,autodev:null,autotrader:null,retailers:null};
 if(slot==='autodev')cursor.autodev='1';else cursor[slot]=0;
 const result=await search(filters,keys,cursor);
 const next:SearchCursor={dealer:null,private:null,auction:null,autodev:null,autotrader:null,retailers:null,...result.nextCursor};
 const status=inventoryStatus(keys);
 const slots=['dealer','private','auction','autodev','autotrader','retailers'] as const;
 for(const [i,pending] of slots.entries()){
  if(pending===slot)continue;
  const eligible=pending==='autodev'?!!keys.autodev&&filters.seller!=='private':!!keys.marketcheck&&!(pending==='dealer'&&filters.seller==='private')&&!(pending==='private'&&filters.seller==='dealer')&&!(pending==='retailers'&&filters.seller==='private');
  if(pending==='autodev')next.autodev=eligible?start.autodev:null;
  else next[pending]=eligible?start[pending]??null:null;
  if(eligible)result.sources[i]={...status[i],detail:'Waiting for the next background batch. First results are shown while more sources are checked.'};
 }
 if(next.retailers!==null)for(let i=6;i<result.sources.length;i++)if(status[i].status==='ready')result.sources[i]=status[i];
 return {...result,nextCursor:Object.values(next).some(value=>value!==null)?next:null};
}
