/* ---------- street events ----------
 One event per level from level 4, two from level 8. Warned only by the event icon popping up ~4 s ahead (no text).
 Useful: rain, pension, neighbour. Annoying: blackout, burst pipe, roadwork. Separate type: traffic (taxi/truck runs). */
const EVENTS={
 rain:{good:1,dur:14,icon:'event-rain'},pension:{good:1,dur:3,icon:'event-pension'},neighbor:{good:1,dur:6,icon:'event-neighbor'},
 blackout:{dur:14,icon:'event-blackout'},pipe:{dur:16,icon:'event-pipe'},roadwork:{dur:30,icon:'event-roadwork'},
 traffic:{dur:24,icon:null}};
const EVENT_POOL=['rain','pension','neighbor','blackout','pipe','roadwork','traffic'];
function setupEvents(i){S.evPlan=[];S.ev=[];S.evWarn=null;if(i<3||S.surv)return;
 const R=rng(i*977+3),end=S.spawns.length?S.spawns[S.spawns.length-1].t:60,n=i>=7?2:1,pool=EVENT_POOL.filter(k=>k!='blackout'||S.lv.night||i>=6);
 for(let k=0;k<n;k++){const key=pool[Math.floor(R()*pool.length)];S.evPlan.push({t:end*(n==1?.5:.32+k*.38)+R()*6,key,r:Math.floor(R()*S.rows),c:Math.floor(R()*YC)})}}
function evOn(key){return S.ev&&S.ev.some(e=>e.key==key)}
function startEvent(p){const d=EVENTS[p.key],e={key:p.key,t:d.dur,max:d.dur,r:p.r,c:p.c};S.ev.push(e);
 if(p.key=='pension')for(let k=0;k<6;k++)dropCoin(FX(1+k*1.3),FY(0)-C*.2,FY(Math.min(S.rows-1,k%S.rows))+C*.8,k%3?10:25).life=12;
 if(p.key=='neighbor')S.enemies.forEach(en=>{if(en.x>YC&&en.state=='walk'&&!E[en.type].boss){en.food=6;en.eat=1}});
 if(p.key=='roadwork'){let tries=0;while(unitAt(e.r,e.c)&&tries++<20){e.c=(e.c+3)%YC;e.r=(e.r+1)%S.rows}}
 if(p.key=='traffic'){const cols=(S.lv.cross||[]).length?S.lv.cross:[YC+2+Math.floor(Math.random()*(COLS-YC-3))];e.col=cols[Math.floor(Math.random()*cols.length)];e.next=1;e.left=3}}
function updEvents(dt){if(!S.evPlan)return;
 const p=S.evPlan[0];if(S.phase=='play'&&p){if(!S.evWarn&&p.t-S.t<4)S.evWarn={key:p.key,t:0};if(p.t<=S.t){S.evPlan.shift();S.evWarn=null;startEvent(p)}}
 if(S.evWarn)S.evWarn.t+=dt;
 S.ev.forEach(e=>{e.t-=dt;
  if(e.key=='rain')S.enemies.forEach(en=>{if(!E[en.type].swim&&en.type!='ghost'){if(en.type=='robo')en.rust=Math.max(en.rust,1);else en.soak=Math.max(en.soak,.5)}});
  if(e.key=='traffic'&&e.left>0&&(e.next-=dt)<=0){e.left--;e.next=7;const k=Math.random()<.35?'truck':'taxi';S.cars.push({c:e.col,y:-1.6,k,hit:new Set(),event:1});SFX.horn(k);
   S.bowls=S.bowls.filter(b=>b.c!=e.col)}});
 S.ev=S.ev.filter(e=>e.t>0)}
// Pipe burst: balls die in the flooded stretch of that row.
function pipeBlocks(b){return S.ev&&S.ev.some(e=>e.key=='pipe'&&e.r==b.r&&b.x>YC+.2)}
function roadBlocked(r,c){return S.ev&&S.ev.some(e=>e.key=='roadwork'&&e.r==r&&e.c==c)}
function drawEventsWorld(){if(!S.ev)return;const t=S.t;
 S.ev.forEach(e=>{const a=Math.min(1,e.t,(e.max-e.t)*2);
  if(e.key=='pipe'){g.globalAlpha=a*.9;for(let c=YC;c<COLS;c+=1.4)comicFit(g,'puddle',FX(c+.7),FY(e.r)+C*.85,C*1.3,C*.6);g.globalAlpha=1}
  if(e.key=='roadwork'){comicFit(g,'roadwork-barrier',FX(e.c+.5),FY(e.r)+C*.9,C*.8,C*.7)}
  if(e.key=='rain'){g.globalAlpha=a*.55;for(let c=YC+1;c<COLS;c+=2.3)comicFit(g,'puddle',FX(c+(c%2)*.4),FY((c*7|0)%S.rows)+C*.8,C*.9,C*.4);g.globalAlpha=1}})}
function drawEventsOverlay(){if(!S.ev)return;
 S.ev.forEach(e=>{const a=Math.min(1,e.t,(e.max-e.t)*2);
  if(e.key=='rain'&&!RM){g.save();g.globalAlpha=.35*a;g.strokeStyle='#cfe6ff';g.lineWidth=1.5;g.beginPath();
   for(let i=0;i<140;i++){const x=camX+((i*97.3+S.t*60)%(VW+60))-30,y=camY+((i*53.7+S.t*520)%(VH+40))-20;g.moveTo(x,y);g.lineTo(x-4,y+14)}g.stroke();
   g.fillStyle='rgba(60,80,110,.12)';g.fillRect(camX,camY,VW,VH);g.restore()}
  if(e.key=='blackout'){g.save();g.globalAlpha=.78*a;g.fillStyle='#0d0f1c';g.fillRect(FX(YC),oy,WW,FH);g.globalAlpha=a;
   // Only the eyes stay visible on the dark street.
   S.enemies.forEach(en=>{if(en.x<YC)return;const x=FX(en.x),y=FY(en.y)+C*.88-C*.42;[-1,1].forEach(q=>el(g,x-C*.12+q*C*.06,y,C*.035,C*.03,'#c8ef7d'))});g.restore()}})}
function drawEventsHUD(){
 const w=S.evWarn;if(w){const k=EVENTS[w.key].icon||'truck',p=Math.min(1,w.t*4),pul=1+Math.sin(S.t*10)*.06,sz=74*p*pul;
  g.save();g.translate(UW/2,92);g.globalAlpha=Math.min(1,w.t*3);el(g,0,0,sz*.62,sz*.62,EVENTS[w.key].good?'rgba(80,140,60,.85)':'rgba(150,40,40,.85)');comicFit(g,k,0,sz*.42,sz*.8,sz*.8);g.restore()}
 (S.ev||[]).forEach((e,i)=>{const k=EVENTS[e.key].icon||'truck',x=UW-34-i*52,y=96;el(g,x,y,22,22,'rgba(26,18,11,.75)');comicFit(g,k,x,y+16,32,32);
  g.strokeStyle=EVENTS[e.key].good?'#9ccc65':'#ff7043';g.lineWidth=3;g.beginPath();g.arc(x,y,22,-Math.PI/2,-Math.PI/2+e.t/e.max*Math.PI*2);g.stroke()})}
