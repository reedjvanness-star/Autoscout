import type {ReactNode} from 'react';
export function InfoPage({title,intro,children}:{title:string;intro:string;children:ReactNode}){
 return <main className="info-page"><a className="info-back" href="/">← Back to MotorScout</a><span className="heading-kicker">MOTORSCOUT · EARLY ACCESS</span><h1>{title}</h1><p className="info-intro">{intro}</p>{children}<nav aria-label="Help and policies"><a href="/help">Help</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></main>;
}
