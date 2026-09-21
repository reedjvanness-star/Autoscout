import {config} from '@/lib/server';
export function SupportContact(){
 const email=String(config().SUPPORT_EMAIL??'');
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?<p>Contact MotorScout at <a href={'mailto:'+email}>{email}</a>. For an account or privacy request, use the email associated with your account. Never send passwords or API keys.</p>:<p>A private support address is being set up. MotorScout is not yet open for a general public launch. For a non-sensitive bug, you can <a href="https://github.com/reedjvanness-star/motorscout/issues" target="_blank" rel="noopener noreferrer">open a GitHub issue</a>. Issues are public: do not include account details, API keys or private conversations.</p>;
}
