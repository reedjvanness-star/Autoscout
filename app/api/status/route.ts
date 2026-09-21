import {config} from '@/lib/server';
import {sourceStatus} from '@/lib/sources';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({ai:!!config().OPENAI_API_KEY,sources:sourceStatus(),dailyLimit:500,inventoryPageLimit:5000},{headers:{'Cache-Control':'no-store'}})}
