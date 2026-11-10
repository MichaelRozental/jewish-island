// sw.js - the installable app's worker. The public site is only the island's door (2026-10-31, the user: "כן, תנעל גם את קבצי המשחק"):
// the game's page (game.html) and its pictures live in the private store in Supabase, which lets only approved accounts read them.
// The door hands this worker the signed-in account's own pass (rz-site.js, message 'token'); with it, the game and its pictures are
// brought from the store and kept on this computer, so the next visit starts from here and it also opens without the internet (the
// bank needs the internet). Built by mk-site.js: b7a3c3c18e41 changes with every build of the door, b2002b48c6a0 only when the pictures
// change, so a new version does not fetch the 26 MB of pictures again; __SB_URL__/__SB_KEY__ are the store's address and public key.
const APP='rz-app-b7a3c3c18e41',TEX='rz-tex-b2002b48c6a0',GAME='rz-game',AUTH='rz-auth',CDN='rz-cdn-1',CORE=["./","index.html","rz-site.js","js/supabase.umd.js","manifest.webmanifest","icons/isle-192.png","icons/isle-512.png","icons/isle-maskable-512.png"],CDNS=["https://fonts.googleapis.com/css2?family=Suez+One&family=Rubik:wght@400;500;700&family=Silkscreen&family=Fredoka:wght@400;500;600;700&family=Varela+Round&family=Cinzel:wght@700&display=swap","https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Water.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/objects/Sky.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js","https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/utils/BufferGeometryUtils.js"],
  SCOPE=new URL('./',location).pathname,SB="https://qwzscebdchcgqmhdnrnk.supabase.co",KEY="sb_publishable_s1h7hO7Ckik_1be0fgaaeA_JlM85c0M",
  // (2026-11-08) each picture's own mark - its content's hash and its size - so a new set of pictures keeps those that did not change
  TEXH={"aerial_grass_rock_diff_1k.jpg":["2e6308b3a8ab",666655],"aerial_grass_rock_nor_gl_1k.jpg":["88590d895081",904956],"american_walnut_veneer_diff_1k.jpg":["339a57fb03e3",579182],"american_walnut_veneer_nor_gl_1k.jpg":["badd855c33a6",414945],"brick_wall_02_diff_1k.jpg":["a8baa0d49f45",1032279],"brick_wall_02_nor_gl_1k.jpg":["e683a1fe7c1a",1121130],"brown_leather_diff_1k.jpg":["1938b34364ee",503348],"brown_leather_nor_gl_1k.jpg":["b1668f9eff40",863280],"coast_sand_01_diff_1k.jpg":["9ce4b0e84e95",960614],"coast_sand_01_nor_gl_1k.jpg":["22c5742f12d0",1146826],"dark_wood_diff_1k.jpg":["976c33ffa4d6",754754],"dark_wood_nor_gl_1k.jpg":["4906e6f1395a",344338],"entrance_hall_env.png":["f280ac2fa0de",980061],"fabric_leather_02_diff_1k.jpg":["0e8230132afd",663390],"fabric_leather_02_nor_gl_1k.jpg":["90c00e06909a",170918],"floor_tiles_06_diff_1k.jpg":["cd6d91b54b8e",356257],"floor_tiles_06_nor_gl_1k.jpg":["f7650d069c3b",121299],"hero2-body-k.jpg":["a2644a24ab1d",418984],"hero2-body-n.jpg":["34f8ee3ea2e2",73658],"hero2-body.jpg":["be2cd771bed0",362754],"hero2-hair-a.jpg":["77619844ff48",161387],"hero2-hair-k.jpg":["8c5696619d87",105855],"hero2-hair.jpg":["50602918ff2a",108228],"hero2-moto.jpg":["bc249562c6e0",17274],"hero2-ski.jpg":["9dd525295757",157842],"hero2-suit.jpg":["eed7362509ff",47849],"hero2-wear.jpg":["825ccbca6cec",218698],"herringbone_parquet_diff_1k.jpg":["e5717a4f5caa",829046],"herringbone_parquet_nor_gl_1k.jpg":["b930bc62ed15",373438],"kid-body-n.jpg":["70aee5f576a9",2349],"kid-hair-a.jpg":["04de79f65d26",162642],"kid11-body.jpg":["208a72d95f8a",232895],"kid11-hair.jpg":["7f8c27e4df2a",133289],"kid11-wear.jpg":["cdf8478da687",417352],"kid2-body.jpg":["28faddb338b6",194057],"kid2-wear.jpg":["83aea841aed3",660937],"kid45-body.jpg":["e348f063fcfd",185314],"kid45-hair.jpg":["3a97736c0287",166000],"kid45-wear.jpg":["4ae48e51e3e2",542696],"kid9-body.jpg":["9127824c4e65",232041],"kid9-hair.jpg":["c932fdc66c20",69586],"kid9-wear.jpg":["ebc99be62d94",529956],"marble_01_diff_1k.jpg":["9e775ebc4ca8",305029],"marble_01_nor_gl_1k.jpg":["3842f406510e",110230],"metal_plate_diff_1k.jpg":["f38a3cd0ae1f",692234],"metal_plate_nor_gl_1k.jpg":["dfae371669a9",770307],"oak_veneer_01_nor_gl_1k.jpg":["ef5518cb4011",484844],"plastered_wall_04_diff_1k.jpg":["7e7c360158e0",299230],"plastered_wall_04_nor_gl_1k.jpg":["a39315f66df0",427268],"quatrefoil_jacquard_fabric_nor_gl_1k.jpg":["a0737a8e5638",919702],"rock_face_03_diff_1k.jpg":["0741c581d042",927082],"rock_face_03_nor_gl_1k.jpg":["6cbfdd9595a4",1146788],"rock_wall_10_diff_1k.jpg":["0cedcffaac12",788124],"rock_wall_10_nor_gl_1k.jpg":["2d00d1823f47",1319118],"rough_linen_diff_1k.jpg":["09f143e16695",835801],"rough_linen_nor_gl_1k.jpg":["0e101e43cdc1",916843],"rz-emblem.png":["f4cc9adf5a06",270197],"rz-flag.jpg":["293f232b385e",107679],"talia-body-n.jpg":["96defa0b9c69",77864],"talia-body.jpg":["17f5ed36539c",406472],"velour_velvet_nor_gl_1k.jpg":["893a895e98e8",695985],"white_plaster_02_diff_1k.jpg":["15b9536b9134",527219],"white_plaster_02_nor_gl_1k.jpg":["3c74edad7224",652310],"woman-body-n.jpg":["a166828a5035",70873],"woman-body.jpg":["dbb0ed977d41",135825],"woman-hair-a.jpg":["8da3899ae7ba",116197],"woman-hair.jpg":["988da8e0bb59",75878],"woman-wear.jpg":["06ad291c22cc",52092],"wood_floor_deck_diff_1k.jpg":["8928eb4baad3",925789],"wood_floor_deck_nor_gl_1k.jpg":["b31631166ffe",665094],"wooden_planks_diff_1k.jpg":["82e33466daa4",489587],"wooden_planks_nor_gl_1k.jpg":["d0784607d88b",705118]};
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const a=await caches.open(APP);await a.addAll(CORE);
  // (three.js and the fonts' list from their servers kept at once: the page that installed the worker fetched them before it was there)
  const c=await caches.open(CDN);for(const u of CDNS){try{if(!(await c.match(u)))await c.add(new Request(u,{mode:'cors',credentials:'omit'}));}catch(x){}}
  await self.skipWaiting();})());});
// (2026-11-08, "המון זמן אני בגלובוס": a new set of pictures - one of them changed or added - dropped all of them, 26 MB fetched again
// at the globe. Now the old set's pictures that did not change are carried into the new one first: by their mark, or - kept before the
// marks - by their name and size; only the new and the changed are fetched)
const texName=rq=>decodeURIComponent(new URL(rq.url).pathname.slice(SCOPE.length)).replace(/^textures\//,'');
const texKeep=(b,type,h)=>new Response(b,{headers:{'content-type':type||'application/octet-stream','x-rz-h':h}});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys(),nt=await caches.open(TEX);
  for(const k of keys){if(!k.startsWith('rz-tex-')||k===TEX)continue;
    try{const oc=await caches.open(k);for(const rq of await oc.keys()){const h=TEXH[texName(rq)];if(!h||(await nt.match(rq,{ignoreSearch:true})))continue;
      const res=await oc.match(rq);if(!res)continue;const mk=res.headers.get('x-rz-h'),b=await res.blob();if(mk?mk===h[0]:b.size===h[1])await nt.put(rq,texKeep(b,res.headers.get('content-type'),h[0]));}}catch(x){}
    await caches.delete(k);}
  for(const k of keys)if(k.startsWith('rz-app-')&&k!==APP)await caches.delete(k);
  await self.clients.claim();})());});

// ---- the pass: kept here (and in a cache, for when the worker wakes up again); none once signed out ----
let TOKEN,STALE=false,FRESH=0,FRP=null;
// (2026-11-08, "קיבלת את גרסה 250": the pass lives an hour; opened straight on the game's page with one past its time, the store turned
// it away and the kept older version was given - and the page renews the pass only once it is up. Now a pass past its time is not tried
// at all (the kept page at once), and when a fresh one comes in, the newest is brought behind it: if it is not the kept one, the page
// is told, and while it is still at the globe it reloads into it, once - given from here)
self.addEventListener('message',e=>{const d=e.data||{};if(d.type!=='token')return;TOKEN=d.token||null;
  e.waitUntil(caches.open(AUTH).then(c=>TOKEN?c.put('token',new Response(TOKEN)):c.delete('token')).then(()=>{if(e.ports&&e.ports[0])e.ports[0].postMessage('ok');return TOKEN?freshen():null;}));});
async function pass(){if(TOKEN!==undefined)return TOKEN;const m=await (await caches.open(AUTH)).match('token');TOKEN=m?await m.text():null;return TOKEN;}
const jwtExp=t=>{try{const s=t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return +JSON.parse(atob(s+'==='.slice((s.length+3)%4))).exp||0;}catch(e){return 0;}};
// (a file of the locked game from the store, as this account; answered as if it were the site's own - same address, its own type)
async function fromStore(p,type){const t=await pass();if(!t||!SB||SB.indexOf('__')===0)throw new Error('no pass');
  const ex=jwtExp(t);if(ex&&ex*1000<Date.now()+15000)throw new Error('pass expired');
  const res=await fetch(SB+'/storage/v1/object/authenticated/game/'+p.split('/').map(encodeURIComponent).join('/'),{headers:{Authorization:'Bearer '+t,apikey:KEY},cache:'no-store'});
  if(!res.ok)throw new Error('store '+res.status);return new Response(await res.blob(),{headers:{'content-type':type||res.headers.get('content-type')||'application/octet-stream'}});}
// (the game's page: the newest from the store when it can be had, else the one kept here, else back to the door - which lets in, and
// hands over a fresh pass)
async function gamePage(){const g=await caches.open(GAME);
  if(FRESH&&Date.now()-FRESH<60000){const m=await g.match('game.html');FRESH=0;if(m)return m;}
  try{const page=await fromStore('game.html','text/html; charset=utf-8');await g.put('game.html',page.clone());STALE=false;return page;}
  catch(e){const m=await g.match('game.html');if(m){STALE=true;return m;}return Response.redirect(new URL('./',location).href,302);}}
// (the kept page was given for want of a pass: once a fresh one is here, the newest brought; if it is not the kept one, kept instead,
// and the game's pages told)
function freshen(){if(!STALE||FRP)return FRP;FRP=(async()=>{try{const g=await caches.open(GAME),page=await fromStore('game.html','text/html; charset=utf-8'),txt=await page.clone().text(),old=await g.match('game.html');STALE=false;
    if(!old||(await old.text())!==txt){await g.put('game.html',page);FRESH=Date.now();for(const c of await self.clients.matchAll({type:'window'}))if(new URL(c.url).pathname===SCOPE+'game.html')c.postMessage({type:'stale'});}}
  catch(e){}finally{FRP=null;}})();return FRP;}
// (a picture: kept with its mark, fetched once - from the store)
async function picture(r,u){const tc=await caches.open(TEX),hit=await tc.match(r,{ignoreSearch:true});if(hit)return hit;
  try{const res=await fromStore(decodeURIComponent(u.pathname.slice(SCOPE.length))),h=TEXH[texName(r)];
    if(h){const b=await res.blob(),ty=res.headers.get('content-type');await tc.put(r,texKeep(b,ty,h[0]));return texKeep(b,ty,h[0]);}
    await tc.put(r,res.clone());return res;}
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
