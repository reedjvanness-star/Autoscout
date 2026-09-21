// Large result sets are compressed in the existing workspace row. Old JSON rows
// remain readable, and no credentials are stored in this payload.
export async function encodeWorkspace(value:unknown){
 const json=JSON.stringify(value);
 if(json.length<100000)return json;
 const stream=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
 const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return 'gzip:'+btoa(binary);
}
export async function decodeWorkspace(value:string){
 if(!value.startsWith('gzip:'))return JSON.parse(value);
 const bytes=Uint8Array.from(atob(value.slice(5)),c=>c.charCodeAt(0));
 return JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
}
