// sw.js - the installable app's worker. The public site is only the island's door (2026-10-31, the user: "כן, תנעל גם את קבצי המשחק"):
// the game's page (game.html) and its pictures live in the private store in Supabase, which lets only approved accounts read them.
// The door hands this worker the signed-in account's own pass (rz-site.js, message 'token'); with it, the game and its pictures are
// brought from the store and kept on this computer, so the next visit starts from here and it also opens without the internet (the
// bank needs the internet). Built by mk-site.js: 37f71a42ab8a changes with every build of the door, f40faae4474e only when the pictures
// change, so a new version does not fetch the 26 MB of pictures again; __SB_URL__/__SB_KEY__ are the store's address and public key.
const APP='rz-app-37f71a42ab8a',TEX='rz-tex-f40faae4474e',GAME='rz-game',AUTH='rz-auth',CDN='rz-cdn-1',CORE=["./","index.html","rz-site.js","js/supabase.umd.js","manifest.webmanifest","icons/isle-192.png","icons/isle-512.png","icons/isle-maskable-512.png"],CDNS=["https://fonts.googleapis.com/css2?family=Suez+One&family=Rubik:wght@400;500;700&family=Silkscreen&family=Fredoka:wght@400;500;600;700&family=Varela+Round&display=swap","https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Water.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Sky.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/BufferGeometryUtils.js"],
  SCOPE=new URL('./',location).pathname,SB="https://qwzscebdchcgqmhdnrnk.supabase.co",KEY="sb_publishable_s1h7hO7Ckik_1be0fgaaeA_JlM85c0M";
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const a=await caches.open(APP);await a.addAll(CORE);
  // (three.js and the fonts' list from their servers kept at once: the page that installed the worker fetched them before it was there)
  const c=await caches.open(CDN);for(const u of CDNS){try{if(!(await c.match(u)))await c.add(new Request(u,{mode:'cors',credentials:'omit'}));}catch(x){}}
  await self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if((k.startsWith('rz-app-')&&k!==APP)||(k.startsWith('rz-tex-')&&k!==TEX))await caches.delete(k);
  await self.clients.claim();})());});

// ---- the pass: kept here (and in a cache, for when the worker wakes up again); none once signed out ----
let TOKEN;
self.addEventListener('message',e=>{const d=e.data||{};if(d.type!=='token')return;TOKEN=d.token||null;
  e.waitUntil(caches.open(AUTH).then(c=>TOKEN?c.put('token',new Response(TOKEN)):c.delete('token')).then(()=>{if(e.ports&&e.ports[0])e.ports[0].postMessage('ok');}));});
async function pass(){if(TOKEN!==undefined)return TOKEN;const m=await (await caches.open(AUTH)).match('token');TOKEN=m?await m.text():null;return TOKEN;}
// (a file of the locked game from the store, as this account; answered as if it were the site's own - same address, its own type)
async function fromStore(p,type){const t=await pass();if(!t||!SB||SB.indexOf('__')===0)throw new Error('no pass');
  const res=await fetch(SB+'/storage/v1/object/authenticated/game/'+p.split('/').map(encodeURIComponent).join('/'),{headers:{Authorization:'Bearer '+t,apikey:KEY},cache:'no-store'});
  if(!res.ok)throw new Error('store '+res.status);return new Response(await res.blob(),{headers:{'content-type':type||res.headers.get('content-type')||'application/octet-stream'}});}
// (the game's page: the newest from the store when it can be had, else the one kept here, else back to the door - which lets in, and
// hands over a fresh pass)
async function gamePage(){const g=await caches.open(GAME);
  try{const page=await fromStore('game.html','text/html; charset=utf-8');await g.put('game.html',page.clone());return page;}
  catch(e){return (await g.match('game.html'))||Response.redirect(new URL('./',location).href,302);}}
// (a picture: kept, fetched once - from the store)
async function picture(r,u){const tc=await caches.open(TEX),hit=await tc.match(r,{ignoreSearch:true});if(hit)return hit;
  try{const res=await fromStore(decodeURIComponent(u.pathname.slice(SCOPE.length)));await tc.put(r,res.clone());return res;}
  catch(e){return new Response('',{status:404});}}

self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // (the database and the store: always live, never kept here)
  if(/\.supabase\.co$/.test(u.hostname))return;
  if(u.origin===location.origin){
    if(r.mode==='navigate'&&u.pathname===SCOPE+'game.html'){e.respondWith(gamePage());return;}
    if(u.pathname.startsWith(SCOPE+'textures/')){e.respondWith(picture(r,u));return;}
    // (the door and its other pages: the newest when online, asked of the server each time ("no-cache": GitHub Pages lets browsers keep
    // a file 10 minutes, and a new version must not wait), the kept ones when not. Only the door itself is kept as the door)
    if(r.mode==='navigate'){const door=u.pathname===SCOPE||u.pathname===SCOPE+'index.html';
      e.respondWith(fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{if(res.ok&&door){const c=res.clone();caches.open(APP).then(a=>a.put('index.html',c));}return res;})
        .catch(()=>caches.match(door?'index.html':r,{ignoreSearch:true}).then(m=>m||caches.match('index.html',{ignoreSearch:true}))));return;}
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(APP).then(x=>x.put(r,c));}return res;}).catch(()=>caches.match(r,{ignoreSearch:true})));return;}
  // (three.js and the fonts from their servers: kept, refreshed in the background)
  if(/(^|\.)cdnjs\.cloudflare\.com$|(^|\.)cdn\.jsdelivr\.net$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(u.hostname)){
    e.respondWith(caches.open(CDN).then(async c=>{const m=await c.match(r);const n=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res;}).catch(()=>m);return m||n;}));}
});
