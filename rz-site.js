// rz-site.js - the game on its own site, Jewish Island (GitHub Pages): what claude.ai gave it there, given here.
// - the installable app: a service worker keeps the game and its pictures on this computer (sw.js);
// - the way in: nothing of the game starts before a Google account the island's keeper approved is signed in (2026-10-31, the user:
//   "אני לא רוצה שיהיה ניתן להיכנס לאי ללא חשבון גוגל (לא רק לבנק), אני רוצה שרק חשבונות גוגל ספציפיים שאני יאשר יוכלו להיכנס"). Its
//   screen stands over the page from the first moment and the game's boot waits for SITE.gate() (mk-site.js); an account not on the
//   list leaves a request, which the keeper approves on admin.html. Once approved on this computer it also opens offline;
// - the game itself is locked (2026-10-31, the user: "כן, תנעל גם את קבצי המשחק"): the public site is only the door (index.html,
//   data-page="door") - once in, the worker (sw.js) brings game.html and its pictures from the private store with the account's own
//   pass, handed to it from here; the game's page (data-page="game") sends anyone not let in back to the door;
// - the family's world: each family opens its own world (Rosentalia, Weissland...) and invites its people with a link; what a world
//   keeps (the bank) is seen and changed only by its approved members - the database's own rules (אתר\supabase-setup.sql);
// - the database (Supabase) with the same small interface the game used on claude.ai (doc / collection / add / set / update /
//   delete / onSnapshot): the bank's code is unchanged, its documents are the current world's; the stall recorder (diag) writes
//   without signing in. Built into the site by mk-site.js, which fills in the settings below.
(()=>{
const CFG={url:"https://qwzscebdchcgqmhdnrnk.supabase.co",key:"sb_publishable_s1h7hO7Ckik_1be0fgaaeA_JlM85c0M"};
// ---- the installable app ----
if('serviceWorker' in navigator)addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
const SITE=window.RZ_SITE={db:false,state:()=>'off',gate:()=>Promise.resolve()};
if(!CFG.url||CFG.url.indexOf('__')===0||!window.supabase)return;   // no database set up yet: the bank says so
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;};
const call=(f,v)=>{try{f(v);}catch(e){console.error(e);}};
const url=q=>location.pathname+(q&&q.toString()?'?'+q:'')+location.hash;
const PAGE=document.documentElement.dataset.page==='door'?'door':'game',sleep=ms=>new Promise(r=>setTimeout(r,ms));
// (an invitation link, ?join=<code>: kept until he is in, then used once - and the game lands him at the cash machine, where it shows)
const Q=new URLSearchParams(location.search);
// (sent back to the door by game.html's public stand-in: the worker was not there to bring the game - say so instead of going round)
const bounced=Q.get('from')==='game';if(bounced){Q.delete('from');history.replaceState(history.state,'',url(Q));}
if(Q.get('join')){ls('ji-join',Q.get('join'));Q.delete('join');if(!location.hash)ls('ji-hash','#bank');history.replaceState(history.state,'',url(Q));}
// (back from Google's sign-in: the place the page was opened at - a #ship-…, #bank link - comes back with it)
const back=Q.has('code')||Q.has('error');
if(back&&ls('ji-hash')&&!location.hash)history.replaceState(history.state,'',url(Q)+ls('ji-hash'));
if(back)ls('ji-hash',null);
const sb=window.supabase.createClient(CFG.url,CFG.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'ji-auth'}});
SITE.db=true;

// ---- the gate: before the globe, the island's entrance (signed in with Google, and on the keeper's list) ----
const GLOGO='<svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const H=document.documentElement;H.classList.add('ji-lock');
{const st=document.createElement('style');st.textContent='html.ji-lock{background:#06101f}html.ji-lock body{visibility:hidden}'+
  '#ji-gate{visibility:visible;position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;direction:rtl;'+
  'background:#06101f radial-gradient(ellipse at 50% 18%,rgba(237,187,69,.16),transparent 60%);color:#FBF1DA;font:16px/1.55 Rubik,system-ui,sans-serif}'+
  '#ji-gate .g{width:min(400px,100%);text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px}'+
  '#ji-gate img{width:112px;height:112px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.45)}'+
  '#ji-gate h1{margin:4px 0 0;font:400 40px/1.1 "Suez One",Georgia,serif;color:#FFE58A;text-shadow:0 3px 0 #6b3a10;direction:ltr}'+
  '#ji-gate .s{margin:0;color:#d9e6ef;font-size:15px}#ji-gate .m{margin:0;font-size:16px}#ji-gate .e{color:#FFB3B3;font-size:14px;min-height:1.2em;margin:0}'+
  '#ji-gate .who{font-size:13px;opacity:.75;direction:ltr}'+
  '#ji-gate .google{display:inline-flex;align-items:center;gap:12px;background:#fff;color:#1f1f1f;border:1px solid #dadce0;border-radius:999px;padding:11px 26px;font:500 16px Rubik,system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)}'+
  '#ji-gate .google:hover{background:#f6f8fc}#ji-gate .link{background:none;border:1px solid rgba(237,187,69,.6);color:#FBF1DA;border-radius:999px;padding:7px 18px;font:500 14px Rubik,sans-serif;cursor:pointer}'+
  '#ji-gate .spin{width:34px;height:34px;border-radius:50%;border:4px solid rgba(255,229,138,.25);border-top-color:#FFE58A;animation:jiS 1s linear infinite}@keyframes jiS{to{transform:rotate(360deg)}}'+
  '#ji-gate button:focus-visible{outline:3px solid #fff;outline-offset:2px}';(document.head||H).appendChild(st);}
let state='loading',user=null,worlds=[],world=null,note='';
let gateEl=null,gstate='loading',opened=false,gateR;const gateP=new Promise(r=>{gateR=r;});
let access=null;   // {approved, role, request, pending} as the database last said
SITE.gate=()=>gateP;SITE.gateState=()=>opened&&PAGE==='game'?'open':gstate;SITE.admin=()=>!!(access&&access.role==='admin');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function gateDraw(){if(opened&&gstate!=='entering')return;if(!gateEl){if(!document.body){addEventListener('DOMContentLoaded',gateDraw,{once:true});return;}
    gateEl=document.createElement('div');gateEl.id='ji-gate';gateEl.setAttribute('role','dialog');gateEl.setAttribute('aria-label','Jewish Island');document.body.appendChild(gateEl);
    // (the game's keys stay quiet while the gate stands)
    for(const t of ['keydown','keyup','keypress'])gateEl.addEventListener(t,e=>e.stopPropagation());
    gateEl.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;const a=b.dataset.g;
      if(a==='in')SITE.signIn();else if(a==='out')SITE.signOut();else if(a==='retry')gateCheck(true);});}
  const u=user,m=(u&&u.user_metadata)||{},first=String(m.full_name||m.name||'').split(' ')[0],mail=u&&u.email?'<p class="who">'+esc(u.email)+'</p>':'';
  const head='<img src="icons/isle-192.png" alt=""><h1>Jewish Island</h1>',err='<p class="e" role="alert">'+esc(note)+'</p>';
  let body;
  if(gstate==='loading')body='<div class="spin" aria-label="רגע"></div>';
  else if(gstate==='entering')body='<div class="spin" aria-hidden="true"></div><p class="s">נכנסים לאי…</p>';
  else if(gstate==='out')body='<p class="s">האי פתוח רק למי שהוזמן</p>'+err+'<button type="button" class="google" data-g="in">'+GLOGO+'כניסה עם Google</button>';
  else if(gstate==='pending')body='<p class="m">שלום'+(first?' '+esc(first):'')+'! הבקשה שלך להיכנס לאי נשלחה.</p><p class="s">ברגע שתאושר, האי ייפתח כאן מעצמו.</p>'+mail+'<button type="button" class="link" data-g="out">החלפת חשבון</button>';
  else if(gstate==='rejected')body='<p class="m">החשבון הזה לא אושר להיכנס לאי.</p>'+mail+'<button type="button" class="link" data-g="out">החלפת חשבון</button>';
  else body='<p class="m">אין חיבור לאינטרנט.</p>'+err+'<button type="button" class="link" data-g="retry">לנסות שוב</button>';
  gateEl.innerHTML='<div class="g">'+head+body+'</div>';}
function gateOpen(){if(opened)return;opened=true;
  if(PAGE==='door'){gstate='entering';gateDraw();toGame();return;}   // (the door: on to the game, which the worker brings)
  H.classList.remove('ji-lock');if(gateEl){gateEl.remove();gateEl=null;}gateR();adminNote();}
// (on the game's page the gate only waits: out, waiting, turned down or cut off - its words are the door's)
function gateSet(s){gstate=s;if(PAGE==='game'&&s!=='loading'){location.replace('./'+location.hash);return;}gateDraw();}
// ---- the worker's pass: the signed-in account's own, every fresh one (none once signed out); true once it has it ----
let swTok=null;
function swToken(t){swTok=t||null;const sw='serviceWorker' in navigator?navigator.serviceWorker:null;if(!sw)return Promise.resolve(false);
  return Promise.race([sw.ready.then(reg=>new Promise(res=>{const w=sw.controller||reg.active;if(!w){res(false);return;}
    const ch=new MessageChannel();ch.port1.onmessage=()=>res(true);w.postMessage({type:'token',token:swTok},[ch.port2]);})),sleep(4000).then(()=>false)]);}
// (the door, once in: the worker set up and holding the pass, then the game. Without a worker the public stand-in would only send
// him back here - after that once, it says so)
async function toGame(){const sw='serviceWorker' in navigator?navigator.serviceWorker:null;let ok=false;
  if(sw){try{await Promise.race([sw.register('sw.js').then(()=>sw.ready),sleep(8000)]);
      if(!sw.controller)await Promise.race([new Promise(r=>sw.addEventListener('controllerchange',r,{once:true})),sleep(6000)]);
      ok=!!sw.controller&&await swToken(swTok);}catch(e){}}
  if(!ok&&bounced){note='המשחק לא נפתח בדפדפן הזה. נסו לרענן את הדף, או לפתוח אותו ב־Chrome.';gstate='error';opened=false;gateDraw();return;}
  location.replace('game.html'+location.hash);}
gateDraw();

// ---- who is here: signed in with Google (the gate above), and in which world ----
// the bank's view: 'loading' -> 'pick' (in, no world chosen: none yet, or several) -> 'in'; 'out' (signed out); 'error': no connection
const subs=new Set(),changed=()=>{for(const f of subs)call(f);};
Object.assign(SITE,{state:()=>state,user:()=>user,worlds:()=>worlds,world:()=>world,note:()=>note,invited:()=>!!ls('ji-join'),
  onChange:f=>{subs.add(f);return()=>subs.delete(f);}});
let waitR=null,waitP=null;
const whenWorld=()=>world?Promise.resolve():(waitP||(waitP=new Promise(r=>{waitR=r;})));
function enter(w){
  if(world&&world.id!==w.id){ls('ji-world',w.id);try{sessionStorage.removeItem('rz-me');}catch(e){}history.replaceState(history.state,'',location.pathname+'#bank');location.reload();return;}   // (another world: the bank starts over)
  world=w;ls('ji-world',w.id);state='in';if(waitR){const r=waitR;waitR=waitP=null;r();}changed();}
async function load(){
  if(!user){worlds=[];state='out';changed();return;}
  const j=ls('ji-join');
  if(j){ls('ji-join',null);const r=await sb.rpc('join_world',{p_code:j});
    if(r.error)note=/fetch|network/i.test(String(r.error.message))?'אין חיבור לאינטרנט, נסו שוב':'קישור ההזמנה כבר לא בתוקף. בקשו קישור חדש ממי ששלח אותו.';else{ls('ji-world',r.data);note='';}}
  const r=await sb.from('members').select('role,world_id,worlds(name)').eq('user_id',user.id);
  if(r.error){state='error';changed();return;}
  worlds=r.data.map(m=>({id:m.world_id,name:(m.worlds&&m.worlds.name)||'',role:m.role})).sort((a,b)=>a.name.localeCompare(b.name,'he'));
  const w=worlds.find(x=>x.id===ls('ji-world'))||(worlds.length===1?worlds[0]:null);
  if(w)enter(w);else{state='pick';changed();}}
const reload=()=>load().catch(()=>{state='error';changed();});
// (where the signed-in account stands: on the list - the gate opens and his worlds load; not - his request, and the gate stays.
// Approved on this computer before: in at once while the database is asked, and in without the internet too)
let pollT=0,noted=false;
async function gateCheck(force){if(!user){ls('ji-ok',null);gateSet('out');return;}
  const known=ls('ji-ok')===user.id;if(known&&!force)gateOpen();
  let r;try{r=await sb.rpc('my_access');}catch(e){r={error:e};}
  if(r.error){if(known){gateOpen();return;}note=/fetch|network|failed/i.test(String(r.error.message||r.error))?'':'משהו השתבש, נסו שוב בעוד רגע';gateSet('error');return;}
  access=r.data||{};
  if(access.approved){ls('ji-ok',user.id);gateOpen();adminNote();return;}
  ls('ji-ok',null);if(opened){location.reload();return;}   // (taken off the list: the island closes)
  if(!access.request){const m=user.user_metadata||{},q=await sb.rpc('request_access',{p_name:m.full_name||m.name||''});access.request=q.data||'pending';}
  gateSet(access.request==='rejected'?'rejected':'pending');
  clearTimeout(pollT);if(access.request!=='rejected')pollT=setTimeout(()=>{if(!opened&&gstate==='pending')gateCheck(true);},20000);}
// (the keeper, on his way in: requests are waiting - a note for a few seconds, its link to the admin page)
function adminNote(){if(PAGE!=='game'||noted||!opened||!access||access.role!=='admin'||!(access.pending>0)||!document.body)return;noted=true;
  const a=document.createElement('a');a.href='admin.html';a.target='_blank';a.rel='noopener';a.dir='rtl';
  a.textContent='🔔 '+(access.pending===1?'בקשת כניסה אחת ממתינה':access.pending+' בקשות כניסה ממתינות')+' · לאישור';
  a.style.cssText='position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);left:50%;transform:translateX(-50%);z-index:2147483000;font:600 15px Rubik,sans-serif;color:#2a1a0e;background:#fbf1da;border:2px solid #d9825b;border-radius:999px;padding:7px 16px;box-shadow:0 3px 0 #b0603e;text-decoration:none;white-space:nowrap';
  document.body.appendChild(a);setTimeout(()=>a.remove(),15000);}
let uid;
sb.auth.onAuthStateChange((ev,s)=>{const t=(s&&s.access_token)||null;if(t!==swTok)setTimeout(()=>swToken(t),0);   // (the worker's pass kept fresh)
  const u=(s&&s.user)||null;if(uid!==undefined&&(u&&u.id)===uid)return;
  if(opened&&!u){location.replace('./');return;}   // (signed out elsewhere: the island closes)
  uid=u&&u.id;user=u;setTimeout(()=>gateCheck(false),0);});
if(PAGE==='game')gateP.then(()=>setTimeout(reload,0));
// (the sign-in's marks taken off the address once it was read)
sb.auth.getSession().finally(()=>{const q=new URLSearchParams(location.search);if(q.get('error')){note='הכניסה עם Google לא הושלמה. אפשר לנסות שוב.';gateDraw();}
  let k=false;for(const n of ['code','error','error_code','error_description'])if(q.has(n)){q.delete(n);k=true;}
  if(k){history.replaceState(history.state,'',url(q));changed();}});
SITE.signIn=after=>{note='';ls('ji-hash',after==='bank'?'#bank':(location.hash||ls('ji-hash')||null));   // (an invitation's #bank kept)
  const bad=()=>{ls('ji-hash',null);note='אין חיבור לאינטרנט, נסו שוב';gateDraw();changed();};
  sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}})
    .then(r=>{if(r.error)bad();},bad);};
SITE.signOut=async()=>{try{await sb.auth.signOut({scope:'local'});}catch(e){}for(const k of ['ji-world','ji-ok'])ls(k,null);try{sessionStorage.removeItem('rz-me');}catch(e){}
  await swToken(null);if(PAGE==='door')location.reload();else location.replace('./'+location.hash);};   // (to the door - the place he was at kept for whoever comes in next)
SITE.retry=reload;
SITE.pickWorld=id=>{const w=worlds.find(x=>x.id===id);if(w)enter(w);};
// (a family opens its world: '' when it is open, else what to tell them)
SITE.newWorld=async name=>{const r=await sb.rpc('new_world',{p_name:name});
  if(r.error)return r.error.code==='54000'?'אפשר לפתוח עד שלושה עולמות':r.error.code==='22023'?'שם העולם: עד 40 אותיות':'אין חיבור לאינטרנט, נסו שוב';
  ls('ji-world',r.data);await reload();return '';};
// (the owner's invitation link for the family: two weeks, ten people)
SITE.invite=async()=>{if(!world||world.role!=='owner')return null;const r=await sb.rpc('new_invite',{p_world:world.id});
  return r.error?null:new URL('./',location.href).href+'?join='+encodeURIComponent(r.data);};   // (to the door, never to game.html)

// ---- the database: the world's documents (docs: world_id, coll, id, data), the same calls as on claude.ai ----
const open=c=>c==='diag',gate=c=>open(c)?Promise.resolve():whenWorld();
const tbl=c=>sb.from(open(c)?'diag':'docs'),key=c=>open(c)?{}:{world_id:world.id,coll:c};
const sel=c=>{const q=tbl(c).select('id,data');return open(c)?q:q.eq('world_id',world.id).eq('coll',c);};
const split=p=>{const i=p.indexOf('/');return i<0?[p,'']:[p.slice(0,i),p.slice(i+1)];};
const chk=r=>{if(r.error)throw r.error;return r.data;};
const snapDoc=(id,row)=>({id,exists:!!row,data:()=>row?row.data:undefined});
const newId=()=>{const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',b=crypto.getRandomValues(new Uint8Array(20));let s='';for(const x of b)s+=A[x%62];return s;};
// (what is watched is kept live by the world's change feed; a write here is shown at once, before the feed brings it back)
const W=new Map();
const colSnap=w=>{const docs=[...w.rows.keys()].sort().map(id=>snapDoc(id,w.rows.get(id)));return {docs,size:docs.length,empty:!docs.length,forEach:f=>docs.forEach(f)};};
function emit(c,id){const w=W.get(c);if(!w||!w.loaded)return;for(const f of w.col)call(f,colSnap(w));
  if(id==null){for(const [k,set] of w.doc)for(const f of set)call(f,snapDoc(k,w.rows.get(k)));}else{const set=w.doc.get(id);if(set)for(const f of set)call(f,snapDoc(id,w.rows.get(id)));}}
let feed=null;
function feedOn(){if(feed||!world)return;const wid=world.id;
  feed=sb.channel('docs:'+wid).on('postgres_changes',{event:'*',schema:'public',table:'docs',filter:'world_id=eq.'+wid},p=>{
    const del=p.eventType==='DELETE',r=del?p.old:p.new;if(!r||!r.coll||(r.world_id&&r.world_id!==wid))return;
    const w=W.get(r.coll);if(!w||!w.loaded)return;
    if(del){w.rows.delete(r.id);emit(r.coll,r.id);}
    else if(r.data===undefined)w.load().catch(()=>{});   // (a record too big for the feed comes without its data: read again)
    else{w.rows.set(r.id,{id:r.id,data:r.data});emit(r.coll,r.id);}})
  .subscribe(st=>{if(st==='SUBSCRIBED')for(const w of W.values())if(w.loaded)w.load().catch(()=>{});});}
function watch(c){let w=W.get(c);if(w)return w;w={rows:new Map(),doc:new Map(),col:new Set(),loaded:false,errs:new Set()};W.set(c,w);
  w.load=async()=>{const rows=chk(await sel(c));w.rows=new Map(rows.map(r=>[r.id,r]));w.loaded=true;emit(c);};
  gate(c).then(()=>{if(!open(c))feedOn();return w.load();}).catch(e=>{for(const f of w.errs)call(f,e);});
  return w;}
function local(c,id,data){const w=W.get(c);if(!w||!w.loaded)return;if(data===undefined)w.rows.delete(id);else w.rows.set(id,{id,data});emit(c,id);}
function docRef(path){const [c,id]=split(path);const d={id,path,
  async get(){await gate(c);return snapDoc(id,chk(await sel(c).eq('id',id).maybeSingle()));},
  async set(data){await gate(c);chk(await tbl(c).upsert({...key(c),id,data,updated_at:new Date().toISOString()}));local(c,id,data);},
  async update(patch){await gate(c);
    if(open(c)){const s=await d.get();return d.set(Object.assign({},s.exists?s.data():{},patch));}
    chk(await sb.rpc('doc_merge',{p_world:world.id,p_coll:c,p_id:id,p_patch:patch}));const w=W.get(c),r=w&&w.rows.get(id);if(r)local(c,id,Object.assign({},r.data,patch));},
  async delete(){await gate(c);let q=tbl(c).delete().eq('id',id);if(!open(c))q=q.eq('world_id',world.id).eq('coll',c);chk(await q);local(c,id,undefined);},
  onSnapshot(cb,err){const w=watch(c);let set=w.doc.get(id);if(!set)w.doc.set(id,set=new Set());set.add(cb);if(err)w.errs.add(err);
    if(w.loaded)call(cb,snapDoc(id,w.rows.get(id)));return()=>{set.delete(cb);};}};return d;}
function colRef(c){return {id:c,doc:id=>docRef(c+'/'+(id==null?newId():id)),
  async add(data){await gate(c);const id=newId();chk(await tbl(c).insert({...key(c),id,data}));local(c,id,data);return docRef(c+'/'+id);},
  async get(){await gate(c);const rows=chk(await sel(c));return colSnap({rows:new Map(rows.map(r=>[r.id,r]))});},
  onSnapshot(cb,err){const w=watch(c);w.col.add(cb);if(err)w.errs.add(err);if(w.loaded)call(cb,colSnap(w));return()=>{w.col.delete(cb);};}};}
const DB={doc:docRef,collection:colRef};
window.claude=window.claude||{};window.claude.use=async n=>n==='db'?DB:null;
})();
