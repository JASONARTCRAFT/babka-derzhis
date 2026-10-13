/* ---------- game state & layout ---------- */
const cv=$('#cv'),g=cv.getContext('2d'),bar=$('#bar');
let S=null,VW=0,VH=0,dpr=1,C=64,TOPH=48,BOTH=48,X0=120,oy=0,FH=0,WW=0,camX=0,cvTop=88;
const FX=c=>X0+c*C,FY=r=>oy+TOPH+r*C,maxCam=()=>Math.max(0,WW-VW),okR=r=>!!S&&r>=0&&r<S.rows;
function layout(){cvTop=bar.getBoundingClientRect().bottom;VW=innerWidth;VH=Math.max(200,innerHeight-cvTop);const rows=S?S.rows:5;
 C=clamp((VH-40)/(rows+1.5),40,92);TOPH=BOTH=C*.75;X0=C*2.5;dpr=Math.min(2,devicePixelRatio||1);
 cv.style.top=cvTop+'px';cv.width=VW*dpr;cv.height=VH*dpr;cv.style.width=VW+'px';cv.style.height=VH+'px';
 WW=X0+COLS*C+C*.3;FH=TOPH+rows*C+BOTH;oy=Math.max(0,(VH-34-FH)/2);camX=clamp(camX,0,maxCam())}
addEventListener('resize',()=>{if(S)layout()});

function beginLevel(i){const lv=L[i];$('#ov').hidden=true;
 S={i,lv,rows:lv.rows,en:lv.start+(save.shop.cash?50:0)+(save.perks&&save.perks.start75?75:0),t:0,phase:'pre',speed:1,paused:false,units:[],enemies:[],balls:[],parts:[],bolts:[],wglow:[],coins:[],fountains:[],zaps:[],wires:[],cars:[],bowls:[],
  corpses:[],runners:[],sucked:[],rings:[],toasts:[],cool:{},spawns:[],bigs:[],doorOpen:{},grp:{},gid:1,id:1,spawned:0,mowUsed:0,shake:0,banner:null,trophy:null,last:null,collected:0,hints:[],sndGap:0,groundT:0};
 const R=rng(i*1013+11);
 lv.w.forEach((w,wi)=>{const[t,types,dl,big]=w,ts=types.split(','),di=dl||[0,1];if(big)S.bigs.push({t,last:wi==lv.w.length-1});
  ts.forEach((ty,k)=>{const d=di[(k+wi)%di.length],tt=t+k*(big?1.1:1.7),r=ty=='boss'?Math.floor(lv.rows/2):R()*lv.rows|0;
   if(ty=='swarm'){const[a,b]=lv.swarm,n=a+(R()*(b-a+1)|0);for(let j=0;j<n;j++)S.spawns.push({t:tt+j*.35,type:'kit',d,r:clamp(r+[0,1,-1,0,1][j],0,lv.rows-1)})}
   else S.spawns.push({t:tt,type:ty,d,r})})});
 S.spawns.sort((a,b)=>a.t-b.t);S.total=S.spawns.length;
 S.mowers=i>=1?Array.from({length:lv.rows},()=>({x:-.32,go:0,gone:0})):[];
 S.houses=genHouses(i,lv);S.roofs=genRoofs(i,lv);
 S.types=[...new Set(S.spawns.map(s=>s.type))];if(S.types.includes('mom')&&!S.types.includes('kit'))S.types.push('kit');
 S.preview=S.types.filter(t=>t!='kit').map((t,k)=>({type:t,x:COLS-1.4-(k%4)*1.15,r:k%lv.rows,ph:k}));
 const avail=[...lv.cards,...(save.shop.mine?['mine']:[])];S.avail=avail;
 S.deck=avail.length<=lv.slots?avail:(save.deck||avail).filter(k=>avail.includes(k)).slice(0,lv.slots);
 if(S.deck.length<Math.min(lv.slots,avail.length))avail.forEach(k=>{if(S.deck.length<lv.slots&&!S.deck.includes(k))S.deck.push(k)});
 S.bon=gBonus();setupHints(i);show('game');buildBar();layout();camX=0;MUS.force=null;MUS.I=.05;MUS.target=.03;music(lv.boss?'night':lv.night?'night':'day');
 const unseen=S.types.filter(t=>!save.seen[t]),me=S;
 const next=()=>{if(S!==me)return;if(!unseen.length){if(i>=3)preBattle(go);else go();return}const t=unseen.shift();save.seen[t]=1;persist();SFX.ominous();
  overlay(`<div class="tag warn">Новый враг на улице</div><h2>${E[t].n}</h2><canvas class="big dark" width="300" height="260" data-k="${t}"></canvas><p>${E[t].d}</p>`,[['Понятно',next]])};
 const go=()=>{if(S!==me)return;buildBar();S.phase='intro';S.it=0};
 next()}
function genHouses(i,lv){const R=rng(i*77+5),hs=[],cr=lv.cross||[];let c=YC;
 const signs=['АПТЕКА','ХЛЕБ','ПОЧТА','РЫБА','ЦВЕТЫ','',''];
 while(c<COLS){if(cr.includes(c)){c++;continue}let w=2+(R()*2|0);while(w>1&&cr.some(x=>x>=c&&x<c+w))w--;if(c+w>COLS)w=COLS-c;
  hs.push({c0:c,w,col:['#e8a87c','#a8d5a2','#9fc5e8','#f4d06f','#d7a9d0','#f7b2a1'][R()*6|0],roof:['#8d3b2b','#4a5d7a','#6a3d6a','#7a5a2a'][R()*4|0],sign:pick(signs),awn:R()<.5,lit:R()});c+=w}return hs}
function genRoofs(i,lv){const R=rng(i*91+3),out=[],cr=lv.cross||[],gaps=new Set(lv.doors.filter(d=>d.s=='b').map(d=>d.c));let c=YC;
 while(c<COLS){if(cr.includes(c)||gaps.has(c)){c++;continue}let w=1+(R()*3|0);for(let k=1;k<w;k++)if(cr.includes(c+k)||gaps.has(c+k)){w=k;break}if(c+w>COLS)w=COLS-c;
  out.push({c0:c,w,col:['#a1453a','#5d6f8f','#7a5a8a','#8a6a3a','#4f7d5b'][R()*5|0],chim:R()<.6});c+=w}return out}
function newCards(i){if(i==0)return[];const p=L[i-1],n=L[i];return[...n.cards.filter(k=>!p.cards.includes(k)),...n.ab.filter(k=>!p.ab.includes(k)),...(n.shovel&&!p.shovel?['shovel']:[])]}
function setupHints(i){const H=S.hints;
 if(i==0){H.push({txt:'Перетащи карточку «Колесо Мурзика» на газон. Можно и так: нажми карточку, потом клетку.',until:()=>S.units.some(u=>u.t=='wheel')},
  {txt:'Мурзик бегает в колесе. Скоро выпадет серебряная монетка: кликни по ней, пока не пропала.',until:()=>S.collected>0},
  {txt:'Теперь поставь «Мячемёт». Он стреляет вправо по своему ряду.',until:()=>S.units.some(u=>u.t=='ball')},
  {txt:'Коты выходят из домов справа. Внизу карта всей улицы: рамка показывает, что ты видишь. Листай колесом мыши, перетаскиванием или кликом по карте.',until:()=>S.t>48},
  {txt:'Колёс много не бывает, но газон не резиновый, а убрать поставленное пока нельзя.',until:()=>S.t>68})}
 else{newCards(i).forEach(k=>{const d=cardDef(k);H.push({txt:`Новое: ${d.n}. ${d.s}`,until:()=>S.t>16})});
  if(i==3)H.push({txt:'Секрет: поставь Шокер прямо за Брызгалкой, и ток побежит по струе воды.',until:()=>S.t>40});
  if(i==4)H.push({txt:'Теперь можно улучшать: перетащи ту же карточку на уже стоящую защиту. Золотое колесо даёт по 25.',until:()=>S.t>40});
  if(i==5)H.push({txt:'Миску ставят на улице, далеко от газона. Пролистай вправо и задержи котов, пока строишься.',until:()=>S.t>40})}}

/* ---------- bar ---------- */
function buildBar(){bar.innerHTML='';const m=document.createElement('div');m.className='money';m.id='money';m.innerHTML='<canvas width="60" height="60"></canvas><b id="mon">0</b>';bar.append(m);
 drawCoin(m.querySelector('canvas').getContext('2d'),30,30,24,true);
 const keys=[...S.deck,...S.lv.ab,...(S.lv.shovel?['shovel']:[])];
 keys.forEach(k=>{const d=cardDef(k),c=document.createElement('div');c.className='card'+(A[k]?' ab':k=='shovel'?' sh':'');c.dataset.k=k;c.title=d.n+': '+d.s;
  c.innerHTML=`<canvas width="92" height="76"></canvas><span class="nm">${d.n}</span><span class="co">${k=='shovel'?'&nbsp;':d.cost}</span><i class="cdv"></i>`;
  renderIcon(c.querySelector('canvas'),iconKind(k),k);c.addEventListener('pointerdown',ev=>cardDown(ev,k,c));bar.append(c)});
 const sp=document.createElement('div');sp.className='sp';bar.append(sp);
 [['x1',b=>{S.speed=S.speed==1?2:1;b.textContent='x'+S.speed},'Скорость'],['❚❚',b=>{S.paused=!S.paused;b.textContent=S.paused?'▶':'❚❚'},'Пауза'],
  ['♪',()=>openSettings(),'Настройки'],['☰',()=>toMenu(),'Меню']].forEach(([t,f,ti])=>{const b=document.createElement('button');b.className='ib';b.textContent=t;b.title=ti;b.setAttribute('aria-label',ti);b.onclick=()=>{SFX.click();f(b)};bar.append(b)})}
function updBar(){const mon=$('#mon');if(!mon)return;mon.textContent=S.en;
 bar.querySelectorAll('.card').forEach(c=>{const k=c.dataset.k,d=cardDef(k),cd=S.cool[k]||0;c.querySelector('.cdv').style.height=(d.cd?cd/d.cd*100:0)+'%';
  c.classList.toggle('poor',S.en<d.cost);c.classList.toggle('sel',sel===k||(drag&&drag.k===k))})}

/* ---------- input ---------- */
let ptr={x:-1,y:-1,in:false,mouse:false},drag=null,pan=null,sel=null,mmDrag=false;
function usable(k){const d=cardDef(k);return S&&S.phase=='play'&&S.en>=d.cost&&!(S.cool[k]>0)}
function cardDown(ev,k,c){ev.preventDefault();if(!usable(k)){c.classList.remove('no');void c.offsetWidth;c.classList.add('no');SFX.bad();return}
 drag={k,x0:ev.clientX,y0:ev.clientY,moved:0};ptr.mouse=ev.pointerType=='mouse'}
addEventListener('pointermove',e=>{if(!drag)return;ptr.x=e.clientX;ptr.y=e.clientY-cvTop;ptr.in=ptr.y>0;if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>8)drag.moved=1});
addEventListener('pointerup',()=>{pan=null;mmDrag=false;if(!drag)return;const k=drag.k;
 if(drag.moved){if(ptr.y>0)tryPlace(k,ptr.x+camX,ptr.y);sel=null}else sel=sel===k?null:k;drag=null});
function mmRect(){const w=Math.max(120,Math.min(VW-270,560));return{x:12,y:VH-30,w,h:22}}
function mmJump(px){const m=mmRect();camX=clamp((px-m.x)/m.w*WW-VW/2,0,maxCam())}
cv.addEventListener('pointermove',e=>{ptr.x=e.clientX;ptr.y=e.clientY-cvTop;ptr.in=true;ptr.mouse=e.pointerType=='mouse';
 if(mmDrag){mmJump(ptr.x);return}
 if(pan){camX=clamp(pan.c0-(e.clientX-pan.x0),0,maxCam());grabCoin(ptr.x+camX,ptr.y)}});
cv.addEventListener('pointerleave',()=>{if(!drag)ptr.in=false});
cv.addEventListener('pointerdown',e=>{if(!S)return;ptr.x=e.clientX;ptr.y=e.clientY-cvTop;ptr.in=true;ptr.mouse=e.pointerType=='mouse';
 if(S.phase=='intro'){S.it=Math.max(S.it,5.8);return}
 const m=mmRect();if(ptr.x>=m.x&&ptr.x<=m.x+m.w&&ptr.y>=m.y-4&&ptr.y<=m.y+m.h+4){mmDrag=true;mmJump(ptr.x);try{cv.setPointerCapture(e.pointerId)}catch(_){}return}
 const wx=ptr.x+camX,wy=ptr.y;
 if(S.trophy&&Math.hypot(wx-S.trophy.x,wy-S.trophy.y)<C*.75){openReveal();return}
 if(grabCoin(wx,wy))return;
 if(sel&&S.phase=='play'){tryPlace(sel,wx,wy);sel=null;return}
 pan={x0:e.clientX,c0:camX};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('wheel',e=>{e.preventDefault();camX=clamp(camX+(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY),0,maxCam())},{passive:false});
addEventListener('keydown',e=>{if(!S||$('#game').hidden)return;if(e.key=='ArrowRight')camX=clamp(camX+C*2,0,maxCam());if(e.key=='ArrowLeft')camX=clamp(camX-C*2,0,maxCam());
 if(e.key==' '&&S.phase=='play'){S.paused=!S.paused;e.preventDefault()}});
function grabCoin(wx,wy,c){c=c||S.coins.find(c=>!c.fly&&Math.hypot(wx-c.x,wy-c.y)<C*.45);if(!c)return false;
 c.fly=1;c.t=0;c.sx=c.x-camX;c.sy=c.y;const r=$('#money').getBoundingClientRect();c.tx=r.left+r.width/2;c.ty=r.top+r.height/2-cvTop;SFX.coin(c.gold);S.collected++;return true}
const cellAt=(wx,wy)=>({c:Math.floor((wx-X0)/C),r:Math.floor((wy-oy-TOPH)/C)});
const unitAt=(r,c)=>S.units.find(u=>u.r===r&&u.c===c&&!u.dead);
function check(k,c,r){if(k=='shovel'){const u=unitAt(r,c);return u?{ok:1,u}:{ok:0}}
 if(k=='bowl')return{ok:okR(r)&&c>=YC&&c<COLS&&!S.bowls.some(b=>b.r==r&&b.c==c)};
 if(k=='pipe')return{ok:!!(S.lv.pipes||[]).find(p=>p[0]==r&&p[1]==c)};
 if(k=='pole')return{ok:!!(S.lv.poles||[]).find(p=>p[0]==r&&p[1]==c)};
 if(A[k])return{ok:(S.lv.cross||[]).includes(c)&&r>=-1&&r<=S.rows};
 if(!okR(r)||c<0||c>=YC)return{ok:0};const u=unitAt(r,c);if(!u)return{ok:1};
 if(u.t===k&&u.lv<maxLv(k,S.i))return{ok:1,up:u};return{ok:0}}
function tryPlace(k,wx,wy){if(!usable(k)){SFX.bad();return}const{c,r}=cellAt(wx,wy),ch=check(k,c,r),d=cardDef(k);
 if(!ch.ok){SFX.bad();return}
 S.en-=d.cost;S.cool[k]=(d.cd||0)*(S.bon.chili?.9:1)*(k=='cuc'&&save.perks&&save.perks.cucfast?.5:1);const px=FX(c+.5),py=FY(r)+C*.85;
 if(k=='shovel'){ch.u.dead=1;burst(px,py,'#b8975f',8);SFX.crunch();return}
 if(k=='bowl'){S.bowls.push({r,c,food:3,t:0});SFX.place();burst(px,py,'#8d6e63',6);return}
 if(k=='pipe'){S.fountains.push({r,c,t:8});SFX.splash();return}
 if(k=='pole'){const ft=S.fountains.find(f=>f.r==r&&Math.abs(f.c-c)<=2);let cells=[[r,c]];
  if(ft)for(let q=-1;q<=1;q++)cells.push([ft.r,ft.c+q]);
  const src={x:FX(c+.8)+C*.25,y:FY(r)+C*.9-C*1.12};S.zaps.push({cells,left:3,cd:.45,src});S.wires.push({x1:src.x,y1:src.y,x2:FX(c+.5),y2:FY(r)+C*.7,life:3});SFX.zap(2);return}
 if(A[k]){S.cars.push({c,y:-1.6,k,hit:new Set()});SFX.horn(k);return}
 SFX.place();burst(px,py,'#c9a66b',10);
 if(ch.up){ch.up.lv++;ch.up.hp=ch.up.max;for(let i=0;i<16;i++)P({x:px,y:py-C*.4,vx:(Math.random()-.5)*C*3,vy:-C*(1+Math.random()*2),g:C*5,life:.8,size:C*.06,col:'#ffd54f'});
  P({k:'txt',txt:'Улучшено!',x:px,y:py-C*.9,vy:-C*.5,life:1.2,col:'#ffcf3f'});SFX.reveal();return}
 const hp=U[k].hp*(k=='fence'?(save.shop.lux?1.6:1)*(save.perks&&save.perks.fence?1.5:1):1);
 S.units.push({t:k,r,c,lv:1,hp,max:hp,cd:k=='wheel'?(S.bon.catnip?.4:3):0,ph:Math.random()*5,fire:0,charges:8,arm:k=='mine'?8:0,id:S.id++})}

/* ---------- simulation ---------- */
function P(o){S.parts.push(Object.assign({k:'dot',vx:0,vy:0,g:0,life:.8,size:4,col:'#fff'},o,{max:o.life||.8}))}
function burst(x,y,col,n,sp=1){for(let i=0;i<n;i++)P({x,y,vx:(Math.random()-.5)*C*3*sp,vy:-C*Math.random()*2.5*sp,g:C*7,life:.6,size:C*.05,col})}
function txt(e,s,col){P({k:'txt',txt:s,x:FX(e.x),y:FY(e.y)+C*.1,vy:-C*.5,life:1.1,col})}
const onRow=(e,r)=>Math.abs(e.r-r)<=(e.span||0);
const inCells=(r,a,b)=>S.enemies.filter(e=>e.state=='walk'&&!e.dead&&!e.flee&&!e.jf&&onRow(e,r)&&e.x>=a&&e.x<b).sort((p,q)=>p.x-q.x);
function mk(type,r,x,y){const d=E[type],hm=S.lv.hpm||1,e={id:S.id++,type,r,x,y:y??r,hp:d.hp*hm,max:d.hp*hm,span:d.boss?1:0,arm:d.arm?1:0,armHp:d.arm||0,sp:d.sp,ph:Math.random()*6,t:0,soak:0,boost:0,hit:0,stun:0,rust:0,mt:0,vt:0,state:'walk',sndT:2+Math.random()*8};S.enemies.push(e);return e}
function spawn(s){const d=S.lv.doors[s.d],e=mk(s.type,s.r,d.c+.5,d.s=='t'?-.9:S.rows-.1);e.state='enter';S.doorOpen[s.d]=1.3;S.spawned++;
 if(SPECIAL.has(s.type)){S.toasts.push({type:s.type,txt:`${E[s.type].n} выходит ${d.s=='t'?'из дома':'из подворотни'} №${d.c}`,life:5});SFX.sting();
  setTimeout(()=>voice(s.type,1,1),500);if(s.type=='boss'){music('boss');banner('Король Пылесосов!')}}}
function dropCoin(x,y,ground,val){S.coins.push({x,y,vx:(Math.random()-.5)*C*.8,vy:-C*3.2,ground,life:9,val,gold:val>=25,auto:save.shop.magnet?2:0})}
function enemyVoice(e){if(S.sndGap>0||!AU.ctx)return;const sx=FX(e.x)-camX,on=sx>-50&&sx<VW+50;voice(e.type,clamp(sx/VW*2-1,-1,1),on?1:.4);S.sndGap=1.4}
function hit(e,dmg,k){if(e.dead)return 0;const t=e.type;
 if(e.state=='enter'&&k!='car'&&k!='z')return 0;
 if(t=='ghost'&&k!='e'&&k!='z')return 0;
 if(t=='robo'&&(k=='e'||k=='z')){if(Math.random()<.25)txt(e,'Заземлён!','#cfd8dc');return 0}
 if(t=='box'&&k=='b')dmg*=.4;
 if(t=='robo'&&k=='b'&&e.rust>0)dmg*=2;
 if(t=='ath'&&(k=='e'||k=='z'))dmg*=2;
 if(e.arm>0){const m=k=='b'?.25:(k=='e'||k=='z')?2:k=='w'?0:1,a=dmg*m;e.armHp-=a;e.arm=e.armHp/E[t].arm;e.hit=.08;if(k=='b'&&Math.random()<.4)SFX.clang(0);if(e.armHp<=0)dropBasin(e);return a}
 if(k=='w'&&t!='box')return 0;
 e.hp-=dmg;e.hit=.1;if(t=='vac'&&!e.off&&e.hp<e.max*.5)crashVac(e);
 if(e.hp<=0)kill(e);return dmg}
function dropBasin(e){e.arm=0;e.armHp=0;P({k:'basin',x:FX(e.x),y:FY(e.y)+C*.3,vx:C*1.5,vy:-C*3,g:C*9,life:.9,size:C*.3});txt(e,'Дзынь!','#eceff1');SFX.clang(0)}
function crashVac(e){e.off=1;e.sp=E.cat.sp;burst(FX(e.x),FY(e.y)+C*.8,'#78909c',12);txt(e,'Бах!','#eceff1');SFX.crunch()}
function kill(e){if(e.dead)return;e.dead=1;save.kills++;const x=FX(e.x),y=FY(e.y)+C*.88,t=e.type;S.last={x,y};
 if(t=='box'){const q=Math.random(),n=q<.5?1:q<.85?2:3,s=[e.r-1,e.r+1].filter(okR),rs=[e.r];
  if(n>1)rs.push(s.length?pick(s):e.r);if(n>2)rs.push(s.find(v=>!rs.includes(v))??e.r);const gid=S.gid++;S.grp[gid]=rs.length;
  rs.forEach((r,i)=>{const c=mk(i==0?'cat':'kit',r,e.x+i*.25,e.y);c.grp=gid;c.hit=.2;c.hop=.35});
  for(let i=0;i<10;i++)P({x,y:y-C*.3,vx:(Math.random()-.5)*C*3,vy:-C*(1+Math.random()*2),g:C*7,life:.8,size:C*.08,col:'#c8955a'});
  P({k:'txt',txt:n==1?'Там кот!':`Там ${n} кота!`,x,y:y-C*.6,vy:-C*.5,life:1.4,col:'#ffe0b2'});SFX.crunch();return}
 if(t=='owner'){S.runners.push({x:e.x,y:e.y,ph:0});const c=mk('cat',e.r,e.x-.15,e.y);c.hop=.45;txt(e,'Где я?!','#ffccbc');dropCoin(x,y-C*.6,y-C*.05,25);SFX.die();return}
 if(t=='robo'){for(let i=0;i<12;i++)P({x,y:y-C*.4,vx:(Math.random()-.5)*C*4,vy:-C*(1+Math.random()*2.5),g:C*8,life:.9,size:C*.06,col:pick(['#90a4ae','#ffca28','#546e7a'])});SFX.boom()}
 else if(t=='ghost'){for(let i=0;i<10;i++)P({x,y:y-C*.5,vx:(Math.random()-.5)*C,vy:-C*(1+Math.random()),life:1,size:C*.08,col:'#bfefff'});voice('ghost',0,.6)}
 else{SFX.die();for(let i=0;i<4;i++)P({k:'star',x,y:y-C*.7,vx:(Math.random()-.5)*C*1.5,vy:-C*(.6+Math.random()),life:.9,size:C*.07,col:'#fff59d'})}
 S.corpses.push({type:t,x:e.x,y:e.y,t:0,flip:!!e.flee,ph:e.ph,off:e.off,arm:0});
 if(E[t].gold)dropCoin(x,y-C*.6,y-C*.05,t=='boss'?25:25);
 if(t=='boss')for(let i=0;i<5;i++)dropCoin(x+(i-2)*C*.4,y-C*.8,y-C*.05,25);
 if(e.grp){S.grp[e.grp]--;if(S.grp[e.grp]<=0)dropCoin(x,y-C*.6,y-C*.05,25)}}
function breakUnit(u){u.dead=1;burst(FX(u.c+.5),FY(u.r)+C*.7,'#8d6e63',12);SFX.crunch()}
function upU(u,dt){u.ph+=dt;u.cd-=dt;if(u.fire>0)u.fire-=dt;if(u.hurt>0)u.hurt-=dt;
 const s=C/72,cx=FX(u.c+.5),fy=FY(u.r)+C*.88;
 if(u.t=='wheel'){if(u.cd<=0){const gold=u.lv>1;u.cd=gold?8:5;dropCoin(cx,fy-C*.7,FY(u.r)+C*.82,gold?25:save.perks&&save.perks.wheel15?15:10)}}
 else if(u.t=='ball'){if(u.cd<=0&&S.enemies.some(e=>e.state=='walk'&&!e.flee&&e.type!='ghost'&&onRow(e,u.r)&&e.x>u.c+.4&&e.x<YC+1.5)){u.cd=1.5*(save.perks&&save.perks.rate?.85:1);u.fire=.18;for(let i=0;i<u.lv;i++)S.balls.push({x:u.c+.9-i*.42,r:u.r,lv:u.lv});SFX.pop()}}
 else if(u.t=='spr'){const n=u.lv>1?3:2;if(u.cd<=0){const es=inCells(u.r,u.c+1,u.c+1+n).filter(e=>e.type!='ghost');if(es.length){u.cd=1;u.fire=.9;
  es.forEach(e=>{if(e.type=='robo'){if(e.rust<=0)txt(e,'Ржавеет!','#ffab91');e.rust=6}else if(!E[e.type].swim)e.soak=3;if(e.type=='box')hit(e,10,'w');
   for(let i=0;i<3;i++)P({x:FX(e.x),y:FY(e.y)+C*.35,vx:(Math.random()-.5)*C*1.2,vy:-C*(1+Math.random()),g:C*6,life:.5,size:C*.045,col:'#8fd0ff'})});SFX.splash()}}}
 else if(u.t=='shock'){if(u.cd<=0){const sp=unitAt(u.r,u.c+1),via=sp&&sp.t=='spr',pk=save.perks&&save.perks.shock2?1:0,n=via?(sp.lv>1?3:2)+pk:0,cells=via?Array.from({length:n},(_,k)=>u.c+2+k):pk?[u.c+1,u.c+2]:[u.c+1];
  const es=[];cells.forEach(c=>inCells(u.r,c,c+1).forEach(e=>{if(!es.includes(e))es.push(e)}));
  if(es.length){u.cd=u.lv>1?1.6:2;u.fire=.3;const dmg=(u.lv>1?40:25)*(S.bon.volt?1.15:1),px=cx+28*s,py=fy-34*s;
   if(via){const nx=FX(sp.c+.5)+(sp.lv>1?26:18)*s,ny=FY(u.r)+C*.88-(sp.lv>1?44:38)*s;sp.fire=Math.max(sp.fire,.6);
    S.bolts.push({x1:px,y1:py,x2:nx,y2:ny,life:.22,lv:u.lv});S.wglow.push({r:u.r,c0:cells[0],c1:cells[cells.length-1]+1,life:.35,lv:u.lv});
    es.forEach(e=>S.bolts.push({x1:nx+(FX(e.x)-nx)*.5,y1:FY(u.r)+C*.5,x2:FX(e.x),y2:FY(e.y)+C*.45,life:.22,lv:u.lv}))}
   else es.forEach(e=>S.bolts.push({x1:px,y1:py,x2:FX(e.x),y2:FY(e.y)+C*.45,life:.22,lv:u.lv}));
   es.forEach(e=>{if(hit(e,dmg,'e')&&e.type!='boss')e.stun=.5});SFX.zap(u.lv)}}}
 else if(u.t=='cuc'){const e=inCells(u.r,u.c,u.c+2).find(e=>e.type!='ghost'&&e.type!='boss');if(e){e.flee=Math.min(COLS-.5,e.x+4);e.play=null;e.scared=1.6;u.dead=1;
  P({k:'cuke',x:cx,y:fy-C*.6,vx:(FX(e.x)-cx)/.4,vy:-C*2,g:C*10,life:.4,size:C*.12});txt(e,'Огурец!!','#7cd65a');voice(e.type,0,1);SFX.pop()}}
 else if(u.t=='laser'){if(u.dot){u.dot.t+=dt;if(u.dot.t>1.3)u.dot=null}
  if(u.cd<=0&&u.charges>0){const e=inCells(u.r,u.c+1,u.c+2.3).find(e=>!E[e.type].lazy&&e.type!='ghost'&&e.lz!==u.id);
   if(e){const o=[u.r-1,u.r+1].filter(okR);u.flip=(u.flip||0)+1;const nr=o[u.flip%o.length];u.dot={x:e.x-.3,y:u.r,tx:e.x-.95,ty:nr,t:0};e.r=nr;e.lz=u.id;e.play=null;u.charges--;u.cd=1.2}}
  if(u.charges<=0&&!u.dot){u.dead=1;burst(cx,fy-C*.3,'#eceff1',8);P({k:'txt',txt:'Батарейка всё',x:cx,y:fy-C,vy:-C*.4,life:1.2,col:'#eceff1'})}}
 else if(u.t=='yarn'){if(!u.on){const got=[];[u.r-1,u.r,u.r+1].filter(okR).forEach(r=>{const e=S.enemies.find(e=>e.state=='walk'&&!e.dead&&e.r===r&&!E[e.type].lazy&&e.type!='ghost'&&e.type!='robo'&&!e.flee&&!e.play&&!e.jf&&e.x>=u.c+.3&&e.x<u.c+2.6);if(e)got.push(e)});
   if(got.length){u.on=5;got.forEach((e,i)=>{e.r=u.r;e.play=u;e.pi=i});P({k:'txt',txt:'Играем!',x:cx,y:fy-C,vy:-C*.4,life:1,col:'#ff80ab'})}}
  else{u.on-=dt;if(u.on<=0){u.dead=1;S.enemies.forEach(e=>{if(e.play===u)e.play=null})}}}
 else if(u.t=='mine'){if(u.arm>0){u.arm-=dt;if(u.arm<=0)P({k:'txt',txt:'Взведено!',x:cx,y:fy-C*.6,vy:-C*.4,life:1,col:'#ffab91'})}
  else{const e=S.enemies.find(e=>e.state=='walk'&&!e.dead&&e.type!='ghost'&&onRow(e,u.r)&&e.x-(e.span?.9:.32)>=u.c&&e.x-(e.span?.9:.32)<u.c+1);
   if(e){u.dead=1;S.enemies.forEach(o=>{if(!o.dead&&o.state=='walk'&&onRow(o,u.r)&&Math.abs(o.x-(u.c+.5))<1.1)hit(o,o.type=='boss'?400:900,'mine')});
    for(let i=0;i<26;i++)P({x:cx,y:fy-C*.3,vx:(Math.random()-.5)*C*6,vy:-C*(1+Math.random()*4),g:C*8,life:.9,size:C*(.04+Math.random()*.08),col:pick(['#ff7043','#ffca28','#e53935','#cfd8dc'])});
    P({k:'ring',x:cx,y:fy-C*.3,life:.5,size:C*1.4,col:'#ffca28'});S.shake=.5;SFX.boom();P({k:'txt',txt:'БАБАХ!',x:cx,y:fy-C,vy:-C*.6,life:1.2,col:'#ffca28'})}}}}
function upE(e,dt){const d=E[e.type],t=e.type;e.ph+=dt*(e.eat?6:e.sp*22+(e.x>YC?2:0));e.eat=0;
 for(const k of['hit','soak','boost','scared','stun','rust'])if(e[k]>0)e[k]-=dt;
 if((e.sndT-=dt)<=0){e.sndT=7+Math.random()*9;enemyVoice(e)}
 if(e.state=='enter'){const dy=e.r-e.y,st=1.4*dt;if(Math.abs(dy)<=st){e.y=e.r;e.state='walk'}else e.y+=Math.sign(dy)*st;return}
 e.y+=(e.r-e.y)*Math.min(1,dt*5);
 if(e.hop>0){e.hop-=dt;return}
 if(e.jf){e.jf.t+=dt/.55;e.x=lerp(e.jf.from,e.jf.to,Math.min(1,e.jf.t));if(e.jf.t>=1)e.jf=null;return}
 if(e.flee){e.x+=1.7*dt;if(e.x>=e.flee)e.flee=0;return}
 if(e.play){if(e.play.dead)e.play=null;else{const tx=e.play.c+1.35+(e.pi||0)*.22;if(e.x>tx+.02)e.x-=Math.min(e.x-tx,1.3*dt);else e.eat=1;return}}
 if(e.food>0){e.food-=dt;e.eat=1;return}
 if(e.stun>0)return;
 e.t+=dt;
 if(t=='lead'){e.mt+=dt;e.raise=e.mt>5;if(e.mt>6){e.mt=0;e.raise=0;S.enemies.forEach(o=>{if(Math.abs(o.x-e.x)<2.5&&Math.abs(o.r-e.r)<=1)o.boost=3});S.rings.push({x:FX(e.x),y:FY(e.y)+C*.2,t:0});voice('lead',clamp((FX(e.x)-camX)/VW*2-1,-1,1),1)}}
 if(t=='mom'&&!e.split&&e.x<YC-.2){e.split=1;const s=[e.r-1,e.r+1].filter(okR),all=[e.r,...s],rs=[e.r,s.length?pick(s):e.r,pick(all)];
  rs.forEach((r,i)=>mk('kit',r,e.x+.55+i*.35,e.y));txt(e,'Детки, вперёд!','#ff80ab');voice('mom',0,1)}
 if(t=='boss'){e.suck=(e.suck||0)+dt;e.kitT=(e.kitT||0)+dt;
  if(e.suck>6){const tg=S.units.filter(u=>!u.dead&&Math.abs(u.r-e.r)<=2&&u.c<e.x&&u.c>e.x-3.6).sort((a,b)=>b.c-a.c)[0];
   if(tg){e.suck=0;tg.dead=1;S.sucked.push({u:tg,x0:FX(tg.c+.5),y0:FY(tg.r)+C*.88,e,t:0});SFX.suck();txt(e,'Шлюрп!','#d1c4e9')}else e.suck=5.5}
  if(e.kitT>10){e.kitT=0;[e.r-1,e.r+1].filter(okR).forEach(r=>{const k=mk('kit',r,e.x+.9,e.y);k.hop=.3})}}
 const f=e.x-(e.span?.9:.32);
 if(!e.fed&&t!='ghost'&&t!='robo'&&t!='boss'&&t!='owner'){const bw=S.bowls.find(b=>b.r===e.r&&b.food>0&&f>=b.c&&f<b.c+1);if(bw){bw.food--;e.food=t=='fat'?8:5;e.fed=1;e.eat=1;txt(e,'Ням!','#ffcc80');return}}
 const u=e.x<YC+1.6?S.units.find(u=>!u.dead&&onRow(e,u.r)&&f>=u.c&&f<u.c+1&&!(u.t=='mine'&&!(u.arm>0)&&t!='ghost')):null;
 if(u){
  if(t=='ath'&&u.t=='fence'){e.jf={from:e.x,to:u.c-.12,t:0};return}
  if(t=='vac'&&!e.off){e.vt++;if(u.t=='fence'&&!(e.bonk||[]).includes(u.id)){u.hp-=u.max*.75;(e.bonk=e.bonk||[]).push(u.id);S.shake=.35;burst(FX(u.c+.5),FY(u.r)+C*.5,'#a77be0',10);SFX.crunch();if(u.hp<=0)breakUnit(u)}
   if(e.vt>2){crashVac(e);return}const o=[e.r-1,e.r+1].filter(okR).sort((a,b)=>!!unitAt(a,u.c)-!!unitAt(b,u.c));e.r=o[0];e.x=u.c+1.33;return}
  if(t=='skate'&&!e.off){e.off=1;e.sp=.28;txt(e,'Хрусь!','#ff7043');burst(FX(e.x),FY(e.y)+C*.8,'#ff7043',8);SFX.crunch()}
  if(t=='basin'&&e.arm>0&&u.t=='fence'){dropBasin(e);e.scratch=1;txt(e,'Когти!','#ffe0b2')}
  if(u.t=='laser'&&d.lazy){breakUnit(u);txt(e,'Хрясь!','#fff');return}
  e.eat=1;let m=1;if(u.t=='spr'&&(t=='ath'||d.swim))m=3;if(e.scratch&&u.t=='fence')m=1.6;
  u.hp-=d.dmg*dt*m;u.hurt=.12;if(Math.random()<dt*3)burst(FX(u.c+.85),FY(u.r)+C*.5,'#d7c4a0',2);if(u.hp<=0)breakUnit(u);return}
 let sp=e.sp*(e.boost>0?1.8:1)*(e.x>YC?1.5:1);
 if(e.soak>0&&!d.swim)sp*=.5;if(t=='robo'&&e.rust>0)sp*=.45;
 e.x-=sp*dt;
 if(e.x<-.08){const m=S.mowers[e.r];if(m&&!m.go&&!m.gone){m.go=1;S.mowUsed++;SFX.mower()}else if(e.x<-.5&&!(m&&m.go&&!m.gone))lose()}}
function lose(){if(S.phase!='play')return;S.phase='lost';stopMusic();SFX.lose();
 setTimeout(()=>overlay(`<div class="tag">Уровень ${S.i+1}</div><h2>Зомби-коты прорвались в дом!</h2><canvas class="big" width="300" height="260" data-g="shock"></canvas><p>Бабка отбилась тапком, но это было близко. Попробуй расставить защиту иначе.</p>`,[['Ещё раз',()=>beginLevel(S.i)],['Уровни',()=>{toMenu();openLevels()},'alt']]),1100)}
function banner(t){S.banner={t,life:2.6}}
const THREAT={kit:.4,fat:2.5,box:1.5,basin:2.5,ath:1.2,vac:1.5,mom:1.5,lead:3,skate:1,swim:1.2,ghost:2,robo:3,owner:3,boss:8};
function musicMood(){let th=0;S.enemies.forEach(e=>{th+=(THREAT[e.type]||1)*(e.x<YC?1.6:1)});const big=S.bigs.some(b=>b.shown&&S.t-b.t<25),boss=S.enemies.some(e=>e.type=='boss');
 setMusicIntensity(.05+S.i*.025+th/14+(big?.25:0)+(boss?.3:0))}
function step(dt){S.t+=dt;if(S.phase=='play')musicMood();if(S.shake>0)S.shake-=dt*2;if(S.sndGap>0)S.sndGap-=dt;
 for(const k in S.cool)S.cool[k]=Math.max(0,S.cool[k]-dt);for(const k in S.doorOpen)S.doorOpen[k]-=dt;
 if(S.phase=='play'){S.bigs.forEach(b=>{if(!b.shown&&S.t>=b.t-4){b.shown=1;banner(b.last?'Последняя волна!':'Огромная волна котов!');SFX.siren()}});
  while(S.spawns.length&&S.spawns[0].t<=S.t)spawn(S.spawns.shift())}
 S.units.forEach(u=>upU(u,dt));S.units=S.units.filter(u=>!u.dead&&u.hp>0);
 S.balls.forEach(b=>{b.x+=6*dt;const e=S.enemies.find(e=>!e.dead&&e.state=='walk'&&e.type!='ghost'&&onRow(e,b.r)&&Math.abs(e.x-b.x)<(e.span?.7:.32));
  if(e){hit(e,b.lv==3?24:20,'b');b.x=99;burst(FX(e.x),FY(e.r)+C*.45,'#d7ef3a',4);SFX.thwack()}});S.balls=S.balls.filter(b=>b.x<YC+3);
 S.enemies.forEach(e=>e.dead||upE(e,dt));
 S.fountains.forEach(f=>{f.t-=dt;S.enemies.forEach(e=>{if(!e.dead&&e.state=='walk'&&onRow(e,f.r)&&Math.abs(e.x-(f.c+.5))<1.5&&e.type!='ghost'){if(e.type=='robo')e.rust=6;else if(!E[e.type].swim)e.soak=3;if(e.type=='box')hit(e,8*dt,'w')}});
  if(Math.random()<.8)P({x:FX(f.c+.5),y:FY(f.r)+C*.7,vx:(Math.random()-.5)*C*2.4,vy:-C*(2.5+Math.random()*2),g:C*8,life:.8,size:C*.05,col:'#8fd0ff'})});
 S.fountains=S.fountains.filter(f=>f.t>0);
 S.cars.forEach(c=>{c.y+=(c.k=='truck'?3.6:5)*dt;S.enemies.forEach(e=>{if(!e.dead&&!c.hit.has(e)&&e.type!='ghost'&&Math.abs(e.x-c.c-.5)<(c.k=='truck'?1:.75)&&Math.abs(e.y-c.y)<.75+(e.span||0)){c.hit.add(e);hit(e,c.k=='truck'?(e.type=='boss'?600:99999):e.max*.5,'car');if(c.k=='truck')S.shake=.3}})});
 S.cars=S.cars.filter(c=>c.y<S.rows+1.8);
 S.zaps.forEach(z=>{if(z.left>0&&(z.cd-=dt)<=0){z.cd=.8;z.left--;z.cells.forEach(([r,c])=>{S.bolts.push({x1:z.src.x,y1:z.src.y,x2:FX(c+.5),y2:FY(r)+C*.6,life:.25,lv:2});S.wglow.push({r,c0:c,c1:c+1,life:.3,lv:2});inCells(r,c,c+1).forEach(e=>{if(hit(e,45,'z'))e.stun=.5})});SFX.zap(2)}});
 S.zaps=S.zaps.filter(z=>z.left>0);
 S.mowers.forEach((m,r)=>{if(!m.go||m.gone)return;m.x+=6*dt;m.ph=(m.ph||0)+dt;
  S.enemies.forEach(e=>{if(e.dead||e.state!='walk'||!onRow(e,r)||e.x>m.x+.5||e.x<m.x-.9)return;
   if(e.type=='boss'){hit(e,800,'mow');m.gone=1;burst(FX(m.x),FY(r)+C*.6,'#d32f2f',16);S.shake=.5;SFX.boom();return}
   if(e.arm>0)dropBasin(e);e.hp=0;kill(e);P({x:FX(e.x),y:FY(r)+C*.5,vx:C*2,vy:-C*3,g:C*8,life:.6,size:C*.06,col:'#7cb342'})});
  if(Math.random()<.5)P({x:FX(m.x)-C*.3,y:FY(r)+C*.8,vx:-C*(1+Math.random()),vy:-C*Math.random()*1.5,g:C*5,life:.5,size:C*.04,col:'#8bc34a'});
  if(m.x>COLS+1)m.gone=1});
 S.coins.forEach(c=>{if(c.fly){c.t+=dt*2.4;if(c.t>=1){c.done=1;S.en+=c.val;const m=$('#money');m.classList.remove('pulse');void m.offsetWidth;m.classList.add('pulse')}return}
  c.vy+=C*9*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;if(c.y>=c.ground){c.y=c.ground;c.vy=-c.vy*.3;c.vx*=.5;if(Math.abs(c.vy)<C*.3)c.vy=0}
  if(c.auto>0){c.auto-=dt;if(c.auto<=0){grabCoin(0,0,c);return}}c.life-=dt;if(c.life<=0)c.done=1});
 S.coins=S.coins.filter(c=>!c.done);
 S.bowls.forEach(b=>{if(b.food<=0)b.t+=dt});S.bowls=S.bowls.filter(b=>b.t<3);
 S.enemies=S.enemies.filter(e=>!e.dead);
 S.corpses.forEach(c=>c.t+=dt);S.corpses=S.corpses.filter(c=>c.t<1);
 S.runners.forEach(r=>{r.x+=3*dt;r.ph+=dt*16});S.runners=S.runners.filter(r=>r.x<COLS+1);
 S.sucked.forEach(s=>s.t+=dt*1.6);S.sucked=S.sucked.filter(s=>s.t<1);
 S.parts.forEach(p=>{p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});S.parts=S.parts.filter(p=>p.life>0);
 for(const a of[S.bolts,S.wglow,S.wires])a.forEach(b=>b.life-=dt);S.bolts=S.bolts.filter(b=>b.life>0);S.wglow=S.wglow.filter(b=>b.life>0);S.wires=S.wires.filter(b=>b.life>0);
 S.rings.forEach(r=>r.t+=dt);S.rings=S.rings.filter(r=>r.t<.8);S.toasts.forEach(t=>t.life-=dt);S.toasts=S.toasts.filter(t=>t.life>0);
 if(S.banner&&(S.banner.life-=dt)<=0)S.banner=null;
 while(S.hints.length&&S.hints[0].until())S.hints.shift();
 if(S.phase=='play'&&!S.spawns.length&&!S.enemies.length){S.phase='won';stopMusic();SFX.fanfare();banner('Улица отбита!');
  const p=S.last||{x:FX(5),y:FY(0)+C};S.trophy={x:p.x,y:p.y-C*.3,t:0};S.coins.forEach(c=>{if(!c.fly)grabCoin(0,0,c)})}
 if(S.trophy){S.trophy.t+=dt;if(S.trophy.t<1.2)camX=lerp(camX,clamp(S.trophy.x-VW/2,0,maxCam()),dt*4)}}
function intro(dt){S.it+=dt;setMusicIntensity(.03);const M=maxCam(),t=S.it;
 if(t<.6)camX=0;else if(t<2.2)camX=ease((t-.6)/1.6)*M;else if(t<4.4)camX=M;else if(t<5.8)camX=(1-ease((t-4.4)/1.4))*M;else{camX=0;S.phase='ready';S.rt=0}
 S.preview.forEach(p=>p.ph+=dt*2)}

/* ---------- world render ---------- */
function drawField(){const rows=S.rows,rt=FY(0),rb=FY(rows),s=C/72,cr=S.lv.cross||[],night=S.lv.night;
 for(let r=0;r<rows;r++)for(let c=0;c<YC;c++){g.fillStyle=(r+c)%2?'#74bd42':'#68b237';g.fillRect(FX(c),FY(r),C+1,C+1);g.fillStyle='rgba(255,255,255,.05)';g.fillRect(FX(c),FY(r),C+1,C*.12);
  if((r*7+c*3)%5==0){ln(g,'#5aa02c',1.5,FX(c)+C*.3,FY(r)+C*.7,FX(c)+C*.33,FY(r)+C*.6);ln(g,'#5aa02c',1.5,FX(c)+C*.36,FY(r)+C*.7,FX(c)+C*.4,FY(r)+C*.62)}}
 g.fillStyle='#6b6e77';g.fillRect(FX(YC),rt,(COLS-YC)*C+C*.3,rows*C);
 g.fillStyle='rgba(0,0,0,.05)';for(let c=YC;c<COLS;c++)if(c%2)g.fillRect(FX(c),rt,C,rows*C);
 for(let i=0;i<30;i++){const c=YC+(i*7%12),r=(i*5)%rows;el(g,FX(c+.2+(i%3)*.3),FY(r)+C*(.3+(i%4)*.15),C*.05,C*.03,'rgba(0,0,0,.12)')}
 g.setLineDash([C*.3,C*.25]);for(let r=1;r<rows;r++)ln(g,'rgba(255,255,255,.35)',2,FX(YC)+C*.2,FY(r),WW,FY(r));g.setLineDash([]);
 cr.forEach(c=>{g.fillStyle='#5c5f68';g.fillRect(FX(c),oy,C,FH);for(let y=rt+C*.1;y<rb;y+=C*.28){g.fillStyle='rgba(255,255,255,.75)';g.fillRect(FX(c)+C*.12,y,C*.76,C*.13)}});
 rr(g,FX(YC)-C*.09,rt,C*.18,rows*C,3,'#d8cfbd');for(let r=0;r<rows;r++)ln(g,'#b9ae98',1,FX(YC)-C*.09,FY(r)+C*.5,FX(YC)+C*.09,FY(r)+C*.5);
 [[oy,TOPH],[rb,BOTH]].forEach(([y,h],k)=>{g.fillStyle='#2f6a1f';g.fillRect(X0-C*.55,y,FX(YC)-X0+C*.55,h);
  for(let x=X0-C*.4;x<FX(YC);x+=C*.42){el(g,x,y+h*.5,C*.28,h*.42,'#3f8a2a');el(g,x-C*.06,y+h*.38,C*.12,h*.15,'#57a83a');if(((x/C)*3|0)%4==k)[[-.1,.2],[.1,.3]].forEach(([a,b])=>el(g,x+a*C,y+h*(.3+b),C*.04,C*.04,k?'#f48fb1':'#fff59d'))}});
 S.houses.forEach(h=>{const x=FX(h.c0)+3,w=h.w*C-6,y0=oy+TOPH*.2;
  rr(g,x,y0,w,TOPH*.8,3,h.col);g.fillStyle='rgba(0,0,0,.08)';for(let yy=y0+6;yy<oy+TOPH;yy+=6)g.fillRect(x,yy,w,1);
  poly(g,h.roof,x-5,y0+2,x+w+5,y0+2,x+w-4,oy-2,x+4,oy-2);ln(g,'rgba(0,0,0,.2)',1,x-5,y0+2,x+w+5,y0+2);
  if(h.sign){rr(g,x+w/2-C*.42,y0+TOPH*.06,C*.84,TOPH*.18,3,'#fff3d6');g.fillStyle='#7a3d10';g.font=`900 ${Math.max(8,C*.13)}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(h.sign,x+w/2,y0+TOPH*.15)}
  if(h.awn){for(let i=0;i<w/8;i++)rr(g,x+i*8,y0+TOPH*.28,8,TOPH*.08,0,i%2?'#fff':'#e53935')}
  for(let c=h.c0;c<h.c0+h.w;c++){if(S.lv.doors.some(d=>d.s=='t'&&d.c==c))continue;const wx=FX(c+.5),lit=night?((h.lit*10+c)%3<2):((h.lit*10+c)%3<1);
   rr(g,wx-C*.18,oy+TOPH*.44,C*.36,TOPH*.34,2,'#fff');rr(g,wx-C*.15,oy+TOPH*.47,C*.3,TOPH*.28,2,lit?'#ffe08a':'#4e6a8a');ln(g,'#fff',1.5,wx,oy+TOPH*.47,wx,oy+TOPH*.75);rr(g,wx-C*.2,oy+TOPH*.78,C*.4,TOPH*.06,1,'#8d6e63')}});
 cr.forEach(c=>{g.fillStyle='#5c5f68';g.fillRect(FX(c),oy,C,TOPH)});
 g.fillStyle='#5e5148';g.fillRect(FX(YC),rb,(COLS-YC)*C+C*.3,BOTH);
 S.roofs.forEach(h=>{const x=FX(h.c0)+2,w=h.w*C-4,y=rb+BOTH*.08,hh=BOTH*.92;rr(g,x,y,w,hh,4,h.col);
  for(let yy=y+6;yy<y+hh;yy+=7)for(let xx=x+((yy/7|0)%2)*5;xx<x+w-4;xx+=10)el(g,xx+5,yy,5,3,'rgba(0,0,0,.12)');
  ln(g,'rgba(255,255,255,.25)',2,x+3,y+hh*.45,x+w-3,y+hh*.45);
  if(h.chim){rr(g,x+w*.7,y+hh*.12,C*.16,hh*.28,2,'#795548');rr(g,x+w*.7-2,y+hh*.1,C*.16+4,hh*.07,1,'#5d4037')}});
 S.lv.doors.filter(d=>d.s=='b').forEach(d=>{const x=FX(d.c)+C*.08,w=C*.84;g.fillStyle=lgrad(g,0,rb,0,rb+BOTH,[[0,'#3e342c'],[1,'#120d0a']]);g.fillRect(x,rb,w,BOTH);
  for(let i=0;i<3;i++)ln(g,'#2a221c',1,x,rb+BOTH*(.3+i*.22),x+w,rb+BOTH*(.3+i*.22))});
 cr.forEach(c=>{g.fillStyle='#5c5f68';g.fillRect(FX(c),rb,C,BOTH)});
 drawHome(s);
 (S.lv.pipes||[]).forEach(([r,c])=>{g.save();g.translate(FX(c+.22),FY(r)+C*.9);g.scale(s*.8,s*.8);drawHydrant(g);g.restore()});
 S.wglow.forEach(w=>{const a=Math.min(1,w.life*3);g.fillStyle=w.lv>1?`rgba(206,147,216,${.35*a})`:`rgba(255,245,157,${.35*a})`;g.fillRect(FX(w.c0),FY(w.r)+C*.2,(w.c1-w.c0)*C,C*.6)});
 drawDoors();
 if(night){g.fillStyle='rgba(16,20,64,.42)';g.fillRect(0,0,WW,VH);g.globalCompositeOperation='lighter';
  (S.lv.poles||[]).forEach(([r,c])=>{const x=FX(c+.8)+C*.27,y=FY(r)+C*.9-C*1.05;g.fillStyle=rgrad(g,x,y+C*.8,0,C*1.6,[[0,'rgba(255,230,140,.32)'],[1,'rgba(255,230,140,0)']]);g.fillRect(x-C*1.6,y-C*.8,C*3.2,C*3.2)});
  g.fillStyle=rgrad(g,X0-C*.5,FY(S.rows/2),0,C*2.5,[[0,'rgba(255,220,150,.25)'],[1,'rgba(255,220,150,0)']]);g.fillRect(0,oy,X0+C*2,FH);
  g.globalCompositeOperation='source-over'}}
function drawHome(s){const x1=X0-C*.55,wx=x1-C*1.08,T=oy,B=oy+FH,d=C*.45,midY=FY(S.rows/2),night=S.lv.night;
 const W=(u,v)=>[lerp(wx,x1,u),lerp(lerp(T+d,T,u),lerp(B-d,B,u),v)];
 const Q=(u0,v0,u1,v1,c)=>poly(g,c,...W(u0,v0),...W(u1,v0),...W(u1,v1),...W(u0,v1));
 const vOf=(y,u=1)=>{const yt=lerp(T+d,T,u),yb=lerp(B-d,B,u);return(y-yt)/(yb-yt)};
 g.fillStyle='#3f6e2a';g.fillRect(0,T,x1,FH);
 const rx=wx*.32,o=C*.14;
 poly(g,'#8f2e22',0,T+d*2.2,rx,T+d*1.55,rx,B-d*1.55,0,B-d*2.2);
 poly(g,'#c2452f',rx,T+d*1.55,wx+o,T+d-o,wx+o,B-d+o,rx,B-d*1.55);
 for(let i=1;i<7;i++){const q=i/7,xx=lerp(wx+o,rx,q),yt=lerp(T+d-o,T+d*1.55,q),yb=lerp(B-d+o,B-d*1.55,q),st=C*.2*(1-q*.4);
  ln(g,'rgba(80,15,10,.35)',1.5,xx,yt,xx,yb);for(let y=yt+st/2;y<yb;y+=st)el(g,xx+C*.035*(1-q*.4),y,C*.05*(1-q*.4),st*.42,'rgba(255,140,110,.18)')}
 for(let i=1;i<4;i++){const q=i/4,xx=lerp(rx,0,q);ln(g,'rgba(40,5,5,.3)',1.2,xx,lerp(T+d*1.55,T+d*2.2,q),xx,lerp(B-d*1.55,B-d*2.2,q))}
 ln(g,'#6e1f16',3,rx,T+d*1.55,rx,B-d*1.55);ln(g,'#5a1a12',4,wx+o,T+d-o,wx+o,B-d+o);
 const cy=T+d*1.55+C*.5,cx=rx+C*.18;poly(g,'#795548',cx,cy,cx+C*.26,cy-C*.06,cx+C*.26,cy+C*.5,cx,cy+C*.56);poly(g,'#5d4037',cx-C*.2,cy+C*.04,cx,cy,cx,cy+C*.56,cx-C*.2,cy+C*.6);
 poly(g,'#3e2723',cx-C*.2,cy+C*.04,cx,cy,cx+C*.26,cy-C*.06,cx+C*.06,cy-C*.02);
 for(let i=0;i<3;i++){const t=(S.t*.45+i*.33)%1;g.globalAlpha=.5*(1-t);el(g,cx+C*.05+Math.sin(t*6)*C*.12,cy-t*C*1.1,C*(.12+t*.18),C*(.1+t*.14),'#eceff1');g.globalAlpha=1}
 Q(0,0,1,1,'#f1d3a0');for(let i=1;i<26;i++){const v=i/26,a=W(0,v),b=W(1,v);ln(g,'rgba(150,100,50,.2)',1.2,a[0],a[1],b[0],b[1])}
 Q(0,0,.14,1,'rgba(0,0,0,.2)');Q(.97,0,1,1,'#e2bf86');
 const vm=vOf(midY,.6),dvh=C*.62/FH*1.15,v0=vm-dvh,v1=vm+dvh,u0=.3,u1=.78;
 Q(u0-.06,v0-.035,u1+.06,v1,'#6d4c41');Q(u0,v0,u1,v1,'#2e7d32');Q(u0+.06,v0+.04*(v1-v0)/.2,u1-.06,v0+.42*(v1-v0),'#27692b');Q(u0+.06,v0+.55*(v1-v0),u1-.06,v1-.06*(v1-v0),'#27692b');
 {const [px,py]=W((u0+u1)/2,v0+.25*(v1-v0));el(g,px,py,C*.07,C*.11,'#bbdefb');g.strokeStyle='#1b5e20';g.lineWidth=2;g.beginPath();g.ellipse(px,py,C*.07,C*.11,0,0,7);g.stroke();
  const [kx,ky]=W(u1-.08,v0+.58*(v1-v0));el(g,kx,ky,C*.025,C*.035,'#ffd54f')}
 [vOf(FY(0)+C*.45,.6),vOf(FY(S.rows)-C*.45,.6)].forEach(vc=>{if(Math.abs(vc-vm)<dvh*2.2||S.rows<3&&Math.abs(vc-vm)<dvh*2.6)return;const h=C*.34/FH*1.15,a0=vc-h,a1=vc+h,w0=.28,w1=.8;
  Q(w0-.05,a0-.02,w1+.05,a1+.02,'#fff');Q(w0,a0,w1,a1,night?'#ffe08a':'#90caf9');
  const m0=W(w0,a0),m1=W(w1,a0),m2=W(w0,a0+(a1-a0)*.6),m3=W(w1,a0+(a1-a0)*.6);poly(g,'#ef9a9a',...m0,...W(w0+.25,a0),...m2);poly(g,'#ef9a9a',...m1,...W(w1-.25,a0),...m3);
  const c0=W((w0+w1)/2,a0),c1=W((w0+w1)/2,a1);ln(g,'#fff',2,c0[0],c0[1],c1[0],c1[1]);
  Q(w0-.08,a1+.02,w1+.12,a1+.05,'#8d5524');[.35,.55,.75].forEach(q=>{const [fx,fy]=W(q,a1+.02);el(g,fx,fy,C*.04,C*.04,q==.55?'#ffeb3b':'#e91e63')})});
 ln(g,'#9e9e9e',3,x1-1,T,x1-1,B);
 g.fillStyle='#9b7a4f';g.fillRect(x1,FY(0),X0-x1,S.rows*C);for(let r=0;r<S.rows;r++)el(g,(x1+X0)/2,FY(r)+C*.75,C*.12,C*.04,'rgba(0,0,0,.15)');
 const [dxa,dya]=W(1,v0-.03),[dxb,dyb]=W(1,v1+.02),ext=C*.42;
 poly(g,'#a1774b',dxa,dya,dxa+ext,dya+C*.04,dxb+ext,dyb+C*.04,dxb,dyb);for(let i=1;i<5;i++){const t=i/5;ln(g,'rgba(70,40,20,.35)',1,dxa,lerp(dya,dyb,t),dxa+ext,lerp(dya,dyb,t)+C*.04)}
 poly(g,'#6d4c2b',dxb,dyb,dxb+ext,dyb+C*.04,dxb+ext,dyb+C*.12,dxb,dyb+C*.08);
}
function drawDoors(){S.lv.doors.forEach((d,i)=>{const x=FX(d.c+.5),soon=S.spawns.some(s=>s.d===i&&s.t-S.t<4),open=soon||S.doorOpen[i]>0,top=d.s=='t';
 if(top){const dw=C*.4,dh=TOPH*.58,base=oy+TOPH,dy=base-dh;
  rr(g,x-dw/2-5,dy-5,dw+10,dh+5,3,'#4e342e');rr(g,x-dw/2-2,dy-2,dw+4,dh+2,2,'#2b1a10');
  if(open){g.fillStyle=lgrad(g,0,dy,0,base,[[0,'#050302'],[1,'#2a1a0e']]);g.fillRect(x-dw/2,dy,dw,dh);
   poly(g,'#8d5524',x-dw/2,dy,x-dw/2+dw*.28,dy+dh*.08,x-dw/2+dw*.28,base-dh*.04,x-dw/2,base);
   if((S.t*3|0)%5)[-1,1].forEach(q=>el(g,x+dw*.12+q*C*.06,dy+dh*.5,C*.032,C*.032,'#c6ff4d'))}
  else{rr(g,x-dw/2,dy,dw,dh,2,'#a0632e');rr(g,x-dw*.34,dy+dh*.1,dw*.68,dh*.32,2,'#8d5524');rr(g,x-dw*.34,dy+dh*.52,dw*.68,dh*.36,2,'#8d5524');el(g,x+dw*.32,dy+dh*.55,2.4,2.4,'#ffd54f')}
  poly(g,'#6d4c41',x-dw*.85,dy-6,x+dw*.85,dy-6,x+dw,dy+3,x-dw,dy+3);poly(g,'rgba(0,0,0,.25)',x-dw*.7,dy+3,x+dw*.7,dy+3,x+dw*.6,dy+7,x-dw*.6,dy+7);
  poly(g,'#cfc8bb',x-dw*.75,base,x+dw*.75,base,x+dw*.9,base+C*.07,x-dw*.9,base+C*.07);poly(g,'#a59e92',x-dw*.9,base+C*.07,x+dw*.9,base+C*.07,x+dw*.9,base+C*.12,x-dw*.9,base+C*.12);
  rr(g,x-C*.12,dy-TOPH*.2,C*.24,TOPH*.12,2,'#fff3d6');g.fillStyle='#3a2210';g.font=`900 ${Math.max(8,C*.11)}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(d.c,x,dy-TOPH*.14)}
 else{const y=FY(S.rows)+BOTH*.55;if(open&&(S.t*3|0)%5)[-1,1].forEach(q=>el(g,x+q*C*.07,y,C*.035,C*.035,'#c6ff4d'))}
 if(soon){const by=top?oy+TOPH*.12:FY(S.rows)+BOTH*.85,p=1+Math.sin(S.t*12)*.12;g.save();g.translate(x+C*.34,by);g.scale(p,p);el(g,0,0,C*.17,C*.17,'#e53935');g.fillStyle='#fff';g.font=`900 ${C*.24}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('!',0,1);g.restore()}})}
function drawBolt(x1,y1,x2,y2,a,lv){const n=7,pts=[x1,y1];for(let i=1;i<n;i++)pts.push(lerp(x1,x2,i/n)+(Math.random()-.5)*C*.22,lerp(y1,y2,i/n)+(Math.random()-.5)*C*.22);pts.push(x2,y2);
 g.globalAlpha=a*.5;ln(g,lv>1?'#ce93d8':'#fff176',C*(lv>1?.16:.11),...pts);g.globalAlpha=a;ln(g,lv>1?'#f3e5f5':'#fffde7',C*.035,...pts);
 if(Math.random()<.5){const k=2+(Math.random()*4|0);ln(g,lv>1?'#e1bee7':'#fff59d',1.2,pts[k*2],pts[k*2+1],pts[k*2]+(Math.random()-.5)*C*.4,pts[k*2+1]+(Math.random()-.5)*C*.4)}
 g.globalAlpha=1}
function drawSurround(){const n=S.lv.night,top=oy,bot=oy+FH;
 if(top>0){g.fillStyle=lgrad(g,0,0,0,top,n?[[0,'#0e0b24'],[1,'#2a2550']]:[[0,'#f3a65f'],[1,'#ffd8a8']]);g.fillRect(camX-20,0,VW+40,top);
  const R=rng(5);for(let i=0;i<26;i++){const bx=i*C*1.1,bh=top*(.35+R()*.5);g.fillStyle=n?'#1c1838':'#c98a6a';g.fillRect(bx,top-bh,C*1.02,bh);
   for(let w=0;w<3;w++)if(R()<.5){g.fillStyle=n?'rgba(255,224,138,.6)':'rgba(255,255,255,.35)';g.fillRect(bx+C*.15+w*C*.28,top-bh+C*.15,C*.12,C*.16)}}}
 if(bot<VH){g.fillStyle=n?'#1f2d18':'#3f7a28';g.fillRect(camX-20,bot,VW+40,VH-bot);g.fillStyle=n?'#1a2614':'#376d22';for(let x=0;x<WW;x+=C*.5)el(g,x+C*.25,bot+C*.12,C*.3,C*.14,g.fillStyle)}}
function draw(){g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#1a120b';g.fillRect(0,0,VW,VH);if(!S)return;
 const s=C/72,sx=S.shake>0&&!RM?(Math.random()-.5)*S.shake*14:0;
 g.save();g.translate(-camX+sx,0);drawSurround();drawField();
 const k=drag&&drag.moved?drag.k:sel,showT=k&&ptr.in&&ptr.y>0;
 if(k&&S.phase=='play'){
  if(U[k]||k=='shovel')for(let r=0;r<S.rows;r++)for(let c=0;c<YC;c++)if(check(k,c,r).ok){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(FX(c)+2,FY(r)+2,C-4,C-4)}
  if(k=='bowl'){g.fillStyle='rgba(255,207,63,.12)';g.fillRect(FX(YC),FY(0),(COLS-YC)*C,S.rows*C)}
  if(k=='pipe'||k=='pole')(S.lv[k=='pipe'?'pipes':'poles']||[]).forEach(([r,c])=>{g.strokeStyle='#ffcf3f';g.lineWidth=3;g.setLineDash([6,5]);g.strokeRect(FX(c)+3,FY(r)+3,C-6,C-6);g.setLineDash([])});
  if(k=='taxi'||k=='truck')(S.lv.cross||[]).forEach(c=>{g.fillStyle='rgba(255,207,63,.2)';g.fillRect(FX(c),oy,C,FH)});
  if(showT){const{c,r}=cellAt(ptr.x+camX,ptr.y),ch=check(k,c,r);if(okR(r)||A[k]){g.fillStyle=ch.ok?'rgba(140,255,120,.35)':'rgba(255,90,90,.3)';if(k=='taxi'||k=='truck')g.fillRect(FX(c),oy,C,FH);else g.fillRect(FX(c),FY(r),C,C)}}}
 const items=[];
 S.bowls.forEach(b=>items.push([FY(b.r)+C*.85,()=>{g.save();g.translate(FX(b.c+.5),FY(b.r)+C*.85);g.scale(s,s);drawBowl(g,b.food);g.restore()}]));
 S.units.forEach(u=>items.push([FY(u.r)+C*.88,()=>{g.save();g.translate(FX(u.c+.5),FY(u.r)+C*.88);g.scale(s,s);drawUnit(g,u);g.restore();
  if(u.hp<u.max&&u.t!='wheel'&&u.t!='mine')hpBar(FX(u.c+.5),FY(u.r)+C*.98,u.hp/u.max,'#8bc34a')}]));
 (S.lv.poles||[]).forEach(([r,c])=>items.push([FY(r)+C*.9,()=>{g.save();g.translate(FX(c+.8),FY(r)+C*.9);g.scale(s,s);drawPole(g);g.restore()}]));
 S.fountains.forEach(f=>items.push([FY(f.r)+C*.9,()=>{const x=FX(f.c+.22),y=FY(f.r)+C*.62;for(let i=0;i<5;i++){const q=(S.t*3+i/5)%1;g.globalAlpha=.6*(1-q);el(g,x+Math.sin(i*2+S.t*9)*C*.08,y-q*C*1.1,C*.06,C*.12,'#8fd0ff')}g.globalAlpha=1;
  g.fillStyle='rgba(110,195,255,.18)';g.fillRect(FX(f.c-1),FY(f.r)+C*.15,C*3,C*.75)}]));
 S.mowers.forEach((m,r)=>{if(m.gone)return;items.push([FY(r)+C*.85,()=>{g.save();g.translate(FX(m.x),FY(r)+C*.84);g.scale(s*.85,s*.85);drawMower(g,m.go,m.ph||0);g.restore()}])});
 const ed=(e,y)=>({type:e.type,ph:e.ph,hit:e.hit,soak:e.soak,boost:e.boost,raise:e.raise,off:e.off,hpf:e.hp/e.max,scared:e.scared>0||!!e.flee,flip:!!e.flee,eat:e.eat,arm:e.arm,rust:e.rust});
 S.enemies.forEach(e=>items.push([FY(e.y)+C*.88,()=>{let y=FY(e.y)+C*.88;if(e.jf)y-=Math.sin(Math.PI*Math.min(1,e.jf.t))*C*.75;if(e.hop>0)y-=Math.sin(e.hop/.45*Math.PI)*C*.3;
  g.save();g.translate(FX(e.x),y);g.scale(s*(e.span?1.75:1),s*(e.span?1.75:1));drawCat(g,ed(e));g.restore();
  if(e.stun>0)for(let i=0;i<3;i++){const a=S.t*8+i*2.1;el(g,FX(e.x)+Math.cos(a)*C*.2,y-C*.95+Math.sin(a)*C*.06,C*.03,C*.03,'#fff59d')}
  if(e.play){g.save();g.translate(FX(e.x)-C*.32,y-C*.15);g.scale(s*.5,s*.5);g.rotate(Math.sin(e.ph)*.6);el(g,0,0,10,10,'#ec407a');g.restore()}
  if(!e.span&&(e.hp<e.max||e.arm>0&&e.arm<1)&&e.state=='walk'){const hy=y-C*(e.type=='fat'?1.15:e.type=='owner'?1.6:e.type=='boss'?1.9:.95);hpBar(FX(e.x),hy,e.hp/e.max,'#ef5350');if(E[e.type].arm)hpBar(FX(e.x),hy-C*.08,e.arm,'#b0bec5')}}]));
 if(S.phase=='intro')S.preview.forEach(p=>items.push([FY(p.r)+C*.88,()=>{g.save();g.translate(FX(p.x),FY(p.r)+C*.88);g.scale(s,s);drawCat(g,{type:p.type,ph:p.ph,arm:E[p.type].arm?1:0});g.restore()}]));
 S.corpses.forEach(c=>items.push([FY(c.y)+C*.88,()=>{g.save();g.translate(FX(c.x),FY(c.y)+C*.88);g.scale(s,s);drawCat(g,{type:c.type,ph:c.ph,dying:c.t,flip:c.flip,off:1,hpf:0});g.restore()}]));
 S.runners.forEach(r=>items.push([FY(r.y)+C*.88,()=>{g.save();g.translate(FX(r.x),FY(r.y)+C*.88);g.scale(-s,s);drawPerson(g,{ph:r.ph,run:1,panic:1,coat:'#90a4ae',shoe:'#f48fb1',hair:'#9e9e9e'});g.restore()}]));
 items.sort((a,b)=>a[0]-b[0]).forEach(i=>i[1]());
 S.sucked.forEach(q=>{const e=q.e,tx=FX(e.x)-C*.9,ty=FY(e.y)+C*.6,p=ease(q.t);g.save();g.translate(lerp(q.x0,tx,p),lerp(q.y0,ty,p));g.rotate(p*8);g.scale(s*(1-p*.8),s*(1-p*.8));drawUnit(g,q.u);g.restore()});
 S.units.forEach(u=>{if(u.t=='laser'&&u.dot){const d=u.dot,q=Math.min(1,d.t/.6),dx=FX(lerp(d.x,d.tx,q)),dy=FY(lerp(d.y,d.ty,q))+C*.8,lx=FX(u.c+.5)+4*s,ly=FY(u.r)+C*.88-41*s;
  g.globalAlpha=.7;ln(g,'#ff1744',2,lx,ly,dx,dy);g.globalAlpha=1;el(g,dx,dy,C*.08,C*.045,'rgba(255,23,68,.45)');el(g,dx,dy,C*.035,C*.025,'#ff1744')}});
 S.balls.forEach(b=>{const x=FX(b.x),y=FY(b.r)+C*.88-22*s;el(g,x,FY(b.r)+C*.86,C*.07,C*.025,'rgba(0,0,0,.25)');el(g,x,y,C*.09,C*.09,b.lv==3?'#ffeb3b':'#d7ef3a');g.strokeStyle='#fff';g.lineWidth=1.3;g.beginPath();g.arc(x-C*.05,y,C*.06,-1,1);g.stroke()});
 S.wires.forEach(w=>{g.globalAlpha=Math.min(1,w.life);ln(g,'#212121',2.5,w.x1,w.y1,(w.x1+w.x2)/2,Math.max(w.y1,w.y2)+C*.2,w.x2,w.y2);g.globalAlpha=1;if(Math.random()<.5)burst(w.x2,w.y2,'#fff59d',1)});
 S.bolts.forEach(b=>drawBolt(b.x1,b.y1,b.x2,b.y2,Math.min(1,b.life*6),b.lv));
 S.rings.forEach(r=>{g.strokeStyle=`rgba(255,213,79,${1-r.t/.8})`;g.lineWidth=3;for(let i=0;i<2;i++){g.beginPath();g.arc(r.x,r.y,(r.t+i*.2)*C*2.6,0,7);g.stroke()}});
 S.cars.forEach(c=>{g.save();g.translate(FX(c.c+.5),FY(c.y)+C*.5);g.scale(s,s);drawCar(g,c.k);g.restore()});
 S.parts.forEach(p=>{const a=Math.max(0,p.life/p.max);g.globalAlpha=a;
  if(p.k=='txt'){g.font=`900 ${C*.24}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=4;g.strokeStyle='#3a2210';g.strokeText(p.txt,p.x,p.y);g.fillStyle=p.col;g.fillText(p.txt,p.x,p.y)}
  else if(p.k=='star')sparkle(g,p.x,p.y,p.size*1.6,p.col);
  else if(p.k=='ring'){g.strokeStyle=p.col;g.lineWidth=3;g.beginPath();g.arc(p.x,p.y,p.size*(1.4-a),0,7);g.stroke()}
  else if(p.k=='cuke'){g.save();g.translate(p.x,p.y);g.rotate(p.life*12);rr(g,-p.size*.4,-p.size,p.size*.8,p.size*2,p.size*.4,'#43a047');g.restore()}
  else if(p.k=='basin'){g.save();g.translate(p.x,p.y);g.rotate((1-a)*9);g.fillStyle='#b0bec5';g.beginPath();g.ellipse(0,0,p.size,p.size*.7,0,Math.PI,0);g.fill();rr(g,-p.size*1.1,-2,p.size*2.2,5,2,'#8e9aa3');g.restore()}
  else el(g,p.x,p.y,p.size,p.size,p.col);g.globalAlpha=1});
 S.coins.forEach(c=>{if(c.fly)return;if(c.life<2.5&&(c.life*6|0)%2)return;el(g,c.x,c.ground+C*.05,C*.15,C*.04,'rgba(0,0,0,.25)');drawCoin(g,c.x,c.y-C*.1+Math.sin(S.t*4+c.x)*2,C*(c.gold?.2:.15),c.gold)});
 if(S.trophy){const t=S.trophy,b=Math.sin(t.t*3)*C*.08;g.save();g.translate(t.x,t.y+b);g.rotate(Math.sin(t.t*2)*.08);
  for(let i=0;i<10;i++){const q=i/10*Math.PI*2+t.t;g.globalAlpha=.35;poly(g,'#fff59d',0,0,Math.cos(q)*C*1.1,Math.sin(q)*C*1.1,Math.cos(q+.15)*C*1.1,Math.sin(q+.15)*C*1.1)}g.globalAlpha=1;
  rr(g,-C*.36,-C*.46,C*.72,C*.92,8,'#c6e39a');rr(g,-C*.3,-C*.4,C*.6,C*.6,6,'#f3fbdc');g.fillStyle='#2f6a17';g.font=`900 ${C*.3}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,-C*.1);g.font=`900 ${C*.12}px Nunito,sans-serif`;g.fillText('ЖМИ',0,C*.32);g.restore()}
 g.restore();
 S.coins.forEach(c=>{if(!c.fly)return;const q=ease(Math.min(1,c.t));drawCoin(g,lerp(c.sx,c.tx,q),lerp(c.sy,c.ty,q)-Math.sin(q*Math.PI)*C,C*(c.gold?.2:.15)*(1-q*.3),c.gold)});
 drawHUD(s)}
function hpBar(x,y,v,col){rr(g,x-C*.25,y,C*.5,C*.06,2,'rgba(0,0,0,.55)');rr(g,x-C*.25+1,y+1,(C*.5-2)*clamp(v,0,1),C*.06-2,2,col)}
function txtOut(t,x,y,size,col,stroke='#3a2210'){g.font=`${size}px "Lilita One",Impact,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=size*.18;g.strokeStyle=stroke;g.lineJoin='round';g.strokeText(t,x,y);g.fillStyle=col;g.fillText(t,x,y)}
function wrap(t,w){const out=[];let cur='';t.split(' ').forEach(word=>{const n=cur?cur+' '+word:word;if(g.measureText(n).width>w&&cur){out.push(cur);cur=word}else cur=n});if(cur)out.push(cur);return out}
function arrow(x,y,dir,label,col){const p=1+Math.sin(S.t*8)*.08;g.save();g.translate(x,y);g.scale(p,p);rr(g,-C*.32,-C*.22,C*.64,C*.44,C*.14,col);poly(g,col,dir*C*.3,-C*.16,dir*C*.5,0,dir*C*.3,C*.16);
 g.fillStyle='#fff';g.font=`900 ${C*.2}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(label,0,1);g.restore()}
function drawHUD(s){
 if(S.phase=='play'||S.phase=='won'){for(let r=0;r<S.rows;r++){let nR=0,nL=0;S.enemies.forEach(e=>{if(!onRow(e,r))return;const x=FX(e.x)-camX;if(x>VW-6)nR++;if(x<-C*.3&&e.x<YC+1)nL++});
   const y=FY(r)+C/2;if(nR)arrow(VW-C*.55,y,1,'×'+nR,'rgba(230,81,0,.92)');if(nL&&camX>C)arrow(C*.55,y,-1,'!'+nL,'rgba(211,47,47,.95)')}
  S.lv.doors.forEach((d,i)=>{if(S.spawns.some(s=>s.d===i&&s.t-S.t<4)&&FX(d.c+.5)-camX>VW)arrow(VW-C*.55,d.s=='t'?oy+TOPH*.5:FY(S.rows)+BOTH*.5,1,'!','rgba(255,193,7,.95)')})}
 if(S.phase!='pre'){const m=mmRect(),k=m.w/WW,ry=r=>m.y+3+(r+.5)/S.rows*(m.h-6);
  rr(g,m.x-4,m.y-4,m.w+8,m.h+8,9,'rgba(26,18,11,.85)');rr(g,m.x,m.y,X0*k,m.h,3,'#b23a2a');rr(g,m.x+X0*k,m.y,(FX(YC)-X0)*k,m.h,0,'#68b237');rr(g,m.x+FX(YC)*k,m.y,(WW-FX(YC))*k,m.h,3,'#6b6e77');
  (S.lv.cross||[]).forEach(c=>{g.fillStyle='#4e5058';g.fillRect(m.x+FX(c)*k,m.y,C*k,m.h)});
  S.lv.doors.forEach((d,i)=>{const soon=S.spawns.some(s=>s.d===i&&s.t-S.t<4);const x=m.x+FX(d.c+.5)*k,y=d.s=='t'?m.y-2:m.y+m.h+2;el(g,x,y,3,3,soon&&(S.t*6|0)%2?'#ff5252':'#ffcf3f')});
  S.units.forEach(u=>{g.fillStyle='rgba(255,255,255,.7)';g.fillRect(m.x+FX(u.c+.5)*k-1,ry(u.r)-1,2,2)});
  S.coins.forEach(c=>el(g,m.x+c.x*k,m.y+m.h/2,2,2,c.gold?'#ffd54f':'#e0e0e0'));
  S.enemies.forEach(e=>el(g,m.x+FX(e.x)*k,ry(clamp(e.y,0,S.rows-1)),SPECIAL.has(e.type)?3.2:2.3,SPECIAL.has(e.type)?3.2:2.3,SPECIAL.has(e.type)?'#ff5252':(PAL[e.type]||PAL.cat)[0]));
  g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(m.x+camX*k,m.y-2,VW*k,m.h+4);
  const w=Math.min(220,VW*.3),x=VW-w-14,y=VH-24,f=S.spawned/S.total;rr(g,x-4,y-4,w+8,22,10,'rgba(26,18,11,.85)');rr(g,x,y,w,14,7,'#4a3220');rr(g,x+w*(1-f),y,w*f,14,7,'#8bc34a');
  S.bigs.forEach(b=>{let n=0;S.lv.w.forEach(q=>{if(q[0]<b.t)n+=q[1].split(',').length});const fx=x+w*(1-Math.min(1,n/S.total));ln(g,'#fff',2,fx,y-8,fx,y+12);poly(g,'#e53935',fx,y-8,fx-10,y-4,fx,y)});
  g.save();g.translate(x+w*(1-f),y+12);g.scale(s*.42,s*.42);drawCat(g,{type:'cat',ph:0});g.restore();
  if(VW>620){g.fillStyle='#fff3d6';g.font='800 12px Nunito,sans-serif';g.textAlign='right';g.textBaseline='middle';g.fillText(`${S.i+1}. ${S.lv.n}`,x-10,y-14)}}
 S.toasts.forEach((t,i)=>{const a=Math.min(1,t.life),y=VH-74-i*44;g.globalAlpha=a;g.font='800 13px Nunito,sans-serif';const w=g.measureText(t.txt).width+60;
  rr(g,12,y-18,w,36,10,'rgba(80,10,10,.88)');g.save();g.translate(34,y+14);g.scale(s*.36,s*.36);drawCat(g,{type:t.type,ph:S.t*3,arm:E[t.type].arm?1:0});g.restore();
  g.fillStyle='#ffe0e0';g.textAlign='left';g.textBaseline='middle';g.fillText(t.txt,52,y);g.globalAlpha=1});
 if(S.phase=='play'&&S.hints.length){const t=S.hints[0].txt;g.font='800 15px Nunito,sans-serif';const ls=wrap(t,Math.min(460,VW-60)),w=Math.min(500,VW-30),h=ls.length*20+18,x=(VW-w)/2,y=8;
  rr(g,x,y+3,w,h,12,'rgba(58,34,16,.6)');rr(g,x,y,w,h,12,'#fff3d6');g.fillStyle='#3a2210';g.textAlign='center';g.textBaseline='top';ls.forEach((l,i)=>g.fillText(l,VW/2,y+10+i*20))}
 const boss=S.enemies.find(e=>e.span);if(boss&&S.phase=='play'){const w=Math.min(520,VW-40),x=(VW-w)/2,y=S.hints.length?92:14;rr(g,x-6,y-4,w+12,34,12,'rgba(40,10,40,.9)');
  rr(g,x,y+14,w,12,6,'#3a1a3a');rr(g,x,y+14,w*Math.max(0,boss.hp/boss.max),12,6,'#ab47bc');g.fillStyle='#f3e5f5';g.font='900 13px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(E.boss.n+' · '+Math.ceil(boss.hp),VW/2,y+6)}
 if(S.banner){const a=S.banner.life,sc=a>2.3?1+(a-2.3)*2:1;g.save();g.translate(VW/2,VH*.42);g.scale(sc,sc);g.globalAlpha=Math.min(1,a*2);txtOut(S.banner.t,0,0,Math.min(56,VW/12),'#ffcf3f','#7a2a10');g.restore();g.globalAlpha=1}
 if(S.phase=='intro'&&S.it>1.8&&S.it<4.6)txtOut('Сегодня придут:',VW/2,VH*.16,Math.min(36,VW/16),'#fff3d6');
 if(S.phase=='ready'){const t=S.rt,w=t<.7?'Приготовься…':t<1.4?'Ставь…':'ДЕРЖИСЬ!';txtOut(w,VW/2,VH*.45,Math.min(t<1.4?52:72,VW/9),t<1.4?'#fff3d6':'#ff5252','#3a2210')}
 if(S.paused)txtOut('Пауза',VW/2,VH*.45,56,'#fff3d6');
 if(ptr.mouse&&ptr.in&&!drag&&!sel&&S.phase=='play'){const wx=ptr.x+camX,wy=ptr.y;let name=null;
  const e=S.enemies.find(e=>Math.abs(FX(e.x)-wx)<C*.35&&Math.abs(FY(e.y)+C*.5-wy)<C*.5);
  if(e)name=E[e.type].n+(e.arm>0?' (в тазу)':'')+(e.soak>0?' (мокрый)':'')+(e.rust>0?' (ржавый)':'');
  else{const{c,r}=cellAt(wx,wy),u=okR(r)&&unitAt(r,c);if(u)name=U[u.t].n+(u.lv>1?' · ур. '+u.lv:'')+(u.t=='laser'?' · '+u.charges+' зар.':'')+(u.t=='mine'&&u.arm>0?' · взводится':'')}
  if(name){g.font='800 13px Nunito,sans-serif';const w=g.measureText(name).width+16;rr(g,ptr.x+12,ptr.y-30,w,24,8,'rgba(26,18,11,.92)');g.fillStyle='#fff3d6';g.textAlign='left';g.textBaseline='middle';g.fillText(name,ptr.x+20,ptr.y-18)}}
 const k=drag&&drag.moved?drag.k:(sel&&ptr.mouse?sel:null);
 if(k&&ptr.in&&ptr.y>0){g.save();g.globalAlpha=.8;g.translate(ptr.x,ptr.y+C*.35);g.scale(s,s);
  if(U[k])drawUnit(g,{t:k,lv:1,ph:S.t,fire:0,hp:1,max:1,charges:8});else if(k=='bowl')drawBowl(g,3);else if(k=='pipe')drawHydrant(g);else if(k=='pole')drawPole(g);else if(k=='shovel')drawShovel(g);else{g.translate(0,-40);drawCar(g,k)}g.restore()}}
