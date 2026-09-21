import {config} from './server';
import {interpretSearch} from './search-assistant';
import type {Filters,Message} from './domain';
export function interpret(text:string,filters:Filters,messages:Message[],apiKey?:string){return interpretSearch(text,filters,messages,{apiKey:apiKey??config().OPENAI_API_KEY,model:config().OPENAI_MODEL||'gpt-4.1-mini'})}
