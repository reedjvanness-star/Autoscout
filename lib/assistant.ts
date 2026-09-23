import {config,db} from './server';
import {budgetedAiRequest,SHARED_AI_MODEL} from './shared-ai-budget';
import {interpretSearch} from './search-assistant';
import type {Filters,Message} from './domain';
export function interpret(text:string,filters:Filters,messages:Message[],apiKey?:string){const shared=!!config().SHARED_OPENAI_OWNER_ID;return interpretSearch(text,filters,messages,{apiKey:apiKey??config().OPENAI_API_KEY,model:shared?SHARED_AI_MODEL:config().OPENAI_MODEL||'gpt-4.1-mini',request:shared?budgetedAiRequest(db()):undefined})}
