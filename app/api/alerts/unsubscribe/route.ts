import {db} from '@/lib/server';
export async function GET(req:Request){
 const token=new URL(req.url).searchParams.get('token')??'';
 if(!/^[a-f0-9-]{36}$/.test(token))return new Response('Invalid unsubscribe link.',{status:400});
 return new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MotorScout email alerts</title><body style="font:18px system-ui;max-width:560px;margin:80px auto;padding:24px"><h1>Stop these email alerts?</h1><p>Your saved search and in-app notifications will stay in MotorScout.</p><form method="post"><button style="font:inherit;padding:12px">Unsubscribe from this search</button></form></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
export async function POST(req:Request){
 const token=new URL(req.url).searchParams.get('token')??'';
 if(!/^[a-f0-9-]{36}$/.test(token))return new Response('Invalid unsubscribe link.',{status:400});
 await db().prepare('UPDATE alert_settings SET email_enabled=0 WHERE unsubscribe_token=?').bind(token).run();
 return new Response('Email alerts for this search are off. You can manage your saved searches in MotorScout.',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}
