/* ---------- game state & layout ---------- */
const cv=$('#cv'),g=cv.getContext('2d'),bar=$('#bar');
let S=null,VW=0,VH=0,dpr=1,C=64,TOPH=48,BOTH=48,X0=120,oy=0,FH=0,WW=0,camX=0,cvTop=88;
const FX=c=>X0+c*C,FY=r=>oy+TOPH+r*C,maxCam=()=>Math.max(0,WW-VW),okR=r=>!!S&&r>=0&&r<S.rows;
// Camera zoom changes rendering only; world coordinates stay stable during a battle.
let viewZoom=1,manualZoom=false,camY=0;
const defaultZoom=()=>clamp(innerWidth/800,1,2.5);
const maxCamY=()=>Math.max(0,FH+34-VH);
function updateZoomButtons(){const label=$('#zoomLabel');if(label)label.textContent=Math.round(viewZoom*100)+'%';
 const minus=$('#zoomOut'),plus=$('#zoomIn');if(minus)minus.disabled=viewZoom<=.75;if(plus)plus.disabled=viewZoom>=4}
function layout(){cvTop=bar.getBoundingClientRect().bottom;const height=Math.max(200,innerHeight-cvTop);
 if(!manualZoom)viewZoom=defaultZoom();
 VW=innerWidth/viewZoom;VH=height/viewZoom;const rows=S?S.rows:5;
 if(S&&!S.viewCell)S.viewCell=clamp((height-40)/(rows+2.2),40,92);
 C=S?S.viewCell:72;TOPH=C*2.1;BOTH=C*1.0;X0=C*2.5;dpr=Math.min(2,devicePixelRatio||1);
 cv.style.top=cvTop+'px';cv.width=Math.round(innerWidth*dpr);cv.height=Math.round(height*dpr);cv.style.width=innerWidth+'px';cv.style.height=height+'px';
 WW=X0+COLS*C+C*.3;FH=TOPH+rows*C+BOTH;oy=0;
 camX=clamp(camX,0,maxCam());camY=clamp(camY,0,maxCamY());uiSpace();updateZoomButtons()}
function changeZoom(factor){const next=clamp(viewZoom*factor,.75,4);if(next===viewZoom)return;
 const x=camX+VW/2,y=camY+VH/2;viewZoom=next;manualZoom=true;layout();
 camX=clamp(x-VW/2,0,maxCam());camY=clamp(y-VH/2,0,maxCamY());ptr.in=false}
addEventListener('resize',()=>{if(S)layout()});

function beginLevel(i){const lv=L[i];$('#ov').hidden=true;
 S={i,lv,rows:lv.rows,en:lv.start+(i>=2?50:0)+(save.shop.cash?50:0)+(save.perks&&save.perks.start75?75:0),t:0,phase:'pre',speed:1,paused:false,units:[],enemies:[],balls:[],parts:[],bolts:[],wglow:[],coins:[],fountains:[],zaps:[],wires:[],cars:[],bowls:[],
  corpses:[],runners:[],sucked:[],rings:[],toasts:[],cool:{},spawns:[],bigs:[],doorOpen:{},grp:{},gid:1,id:1,spawned:0,mowUsed:0,shake:0,banner:null,trophy:null,last:null,collected:0,hints:[],sndGap:0,groundT:0};
 const R=rng(i*1013+11);
 lv.w.forEach((w,wi)=>{const[t,types,dl,big]=w,ts=types.split(','),di=dl||[0,1];if(big)S.bigs.push({t,last:wi==lv.w.length-1});
  ts.forEach((ty,k)=>{const d=di[(k+wi)%di.length],tt=t+k*(big?1.1:1.7),r=ty=='boss'?Math.floor(lv.rows/2):R()*lv.rows|0;
   if(ty=='swarm'){const[a,b]=lv.swarm,n=a+(R()*(b-a+1)|0);for(let j=0;j<n;j++)S.spawns.push({t:tt+j*.35,type:'kit',d,r:clamp(r+[0,1,-1,0,1][j],0,lv.rows-1)})}
   else S.spawns.push({t:tt,type:ty,d,r})})});
 if(i>=2){S.spawns.forEach(s=>s.t=s.t*1.18+4);S.bigs.forEach(b=>b.t=b.t*1.18+4)}
 S.spawns.sort((a,b)=>a.t-b.t);S.total=S.spawns.length;
 S.mowers=i>=1?Array.from({length:lv.rows},()=>({x:-.32,go:0,gone:0})):[];
 S.houses=genHouses(i,lv);S.roofs=genRoofs(i,lv);
 S.types=[...new Set(S.spawns.map(s=>s.type))];if(S.types.includes('mom')&&!S.types.includes('kit'))S.types.push('kit');
 S.preview=S.types.filter(t=>t!='kit').map((t,k)=>({type:t,x:COLS-1.4-(k%4)*1.15,r:k%lv.rows,ph:k}));
 const avail=[...lv.cards,...(save.shop.mine?['mine']:[])];S.avail=avail;
 S.deck=avail.length<=lv.slots?avail:(save.deck||avail).filter(k=>avail.includes(k)).slice(0,lv.slots);
 if(S.deck.length<Math.min(lv.slots,avail.length))avail.forEach(k=>{if(S.deck.length<lv.slots&&!S.deck.includes(k))S.deck.push(k)});
 S.bon=gBonus();setupHints(i);show('game');buildBar();camY=0;layout();camX=0;MUS.force=null;MUS.I=.05;MUS.target=.03;music(lv.boss?'night':lv.night?'night':'day');
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
  {txt:'Коты выходят из домов справа. Внизу карта всей улицы: рамка показывает, что ты видишь. Листай колесом мыши или тяни рамку на карте. Монетки собирай, проводя по ним зажатой мышкой.',until:()=>S.t>48},
  {txt:'Колёс много не бывает, но газон не резиновый, а убрать поставленное пока нельзя.',until:()=>S.t>68})}
 else{newCards(i).forEach(k=>{const d=cardDef(k);H.push({txt:`Новое: ${d.n}. ${d.s}`,until:()=>S.t>16})});
  if(i==3)H.push({txt:'Секрет: поставь Шокер прямо за Брызгалкой, и ток побежит по струе воды.',until:()=>S.t>40});
  if(i==4)H.push({txt:'Теперь можно улучшать: перетащи ту же карточку на уже стоящую защиту. Золотое колесо даёт по 25.',until:()=>S.t>40});
  if(i==5)H.push({txt:'Миску ставят на улице, далеко от газона. Пролистай вправо и задержи котов, пока строишься.',until:()=>S.t>40})}}

/* ---------- bar ---------- */
function buildBar(){bar.innerHTML='';const m=document.createElement('div');m.className='money';m.id='money';m.innerHTML='<canvas width="60" height="60"></canvas><b id="mon">0</b>';bar.append(m);
 drawCoin(m.querySelector('canvas').getContext('2d'),30,30,24,true);
 const keys=[...S.deck,...S.lv.ab,...(S.lv.shovel?['shovel']:[])],gl=t=>{const d=document.createElement('div');d.className='gl';d.textContent=t;bar.append(d)};
 keys.forEach((k,i)=>{if(i==0)gl('Мои');if(A[k]&&!A[keys[i-1]])gl('Улица');if(k=='shovel'&&i)gl(' ');const d=cardDef(k),c=document.createElement('div');c.className='card'+(A[k]?' ab':k=='shovel'?' sh':'');c.dataset.k=k;c.title=d.n+': '+d.s;
  c.innerHTML=`<canvas width="92" height="76"></canvas><span class="nm">${d.n}</span><span class="co">${k=='shovel'?'&nbsp;':d.cost}</span><i class="cdv"></i>`;
  renderIcon(c.querySelector('canvas'),iconKind(k),k);c.addEventListener('pointerdown',ev=>cardDown(ev,k,c));c.addEventListener('pointerenter',()=>hov=k);c.addEventListener('pointerleave',()=>{if(hov===k)hov=null});bar.append(c)});
 const start=document.createElement('button');start.id='startBattle';start.className='btn';start.textContent='Начать волну';start.hidden=S.phase!='prepare';start.onclick=startBattle;bar.insertBefore(start,m.nextSibling);
 const sp=document.createElement('div');sp.className='sp';bar.append(sp);
 const zoom=document.createElement('div');zoom.className='zoomControls';
 zoom.innerHTML='<button class="ib" id="zoomOut" aria-label="Уменьшить масштаб" title="Уменьшить масштаб">−</button><span id="zoomLabel"></span><button class="ib" id="zoomIn" aria-label="Увеличить масштаб" title="Увеличить масштаб">+</button>';
 bar.append(zoom);$('#zoomOut').onclick=()=>changeZoom(1/1.2);$('#zoomIn').onclick=()=>changeZoom(1.2);updateZoomButtons();
 [['x1',b=>{S.speed=S.speed==1?2:1;b.textContent='x'+S.speed},'Скорость'],['❚❚',b=>{S.paused=!S.paused;b.textContent=S.paused?'▶':'❚❚'},'Пауза'],
  ['♪',()=>openSettings(),'Настройки'],['☰',()=>toMenu(),'Меню']].forEach(([t,f,ti])=>{const b=document.createElement('button');b.className='ib';b.textContent=t;b.title=ti;b.setAttribute('aria-label',ti);b.onclick=()=>{SFX.click();f(b)};bar.append(b)})}
function updBar(){const mon=$('#mon');if(!mon)return;mon.textContent=S.en;
 bar.querySelectorAll('.card').forEach(c=>{const k=c.dataset.k,d=cardDef(k),cd=S.cool[k]||0;c.querySelector('.cdv').style.height=(d.cd?cd/d.cd*100:0)+'%';
  c.classList.toggle('poor',S.en<d.cost);c.classList.toggle('sel',sel===k||(drag&&drag.k===k))})}

/* ---------- reach & stats ---------- */
const BALLR=lv=>6+lv,sprN=lv=>lv>1?3:2;
const sprAt=(r,c)=>{const u=okR(r)&&unitAt(r,c);return u&&u.t=='spr'?u:null};
function shockCells(c,sp){const pk=save.perks&&save.perks.shock2?1:0;
 if(sp)return Array.from({length:sprN(sp.lv)+pk},(_,k)=>c+2+k);return pk?[c+1,c+2]:[c+1]}
function reach(t,lv,r,c,sp){
 if(t=='ball')return{t,rows:[r],a:c+.9,b:Math.min(c+1+BALLR(lv),YC+3),col:'215,239,58'};
 if(t=='spr')return{t,rows:[r],a:c+1,b:c+1+sprN(lv),col:'143,208,255'};
 if(t=='shock'){const cs=shockCells(c,sp);return{t,rows:[r],a:cs[0],b:cs[cs.length-1]+1,col:lv>1?'206,147,216':'255,241,118',combo:!!sp}}
 if(t=='cuc')return{t,rows:[r],a:c,b:c+2,col:'124,214,90'};
 if(t=='laser')return{t,rows:[r],a:c+1,b:c+2.3,col:'255,82,82'};
 if(t=='yarn')return{t,rows:[r-1,r,r+1].filter(okR),a:c+.3,b:c+2.6,col:'255,128,171'};
 if(t=='mine')return{t,rows:[r],a:c,b:c+1,col:'255,112,67'};
 if(t=='pipe')return{t,rows:[r],a:c-1,b:c+2,col:'110,195,255'};
 if(t=='pole')return{t,rows:[r],a:c,b:c+1,col:'255,241,118'};
 return null}
function stats(t,lv,sp){const pk=save.perks||{},v=S&&S.bon&&S.bon.volt?1.15:1;
 return({wheel:[['Монетка',lv>1?25:pk.wheel15?15:10],['Раз в (сек)',lv>1?8:5]],
  ball:[['Урон мяча',lv>2?24:20],['Мячей за выстрел',lv],['Дальность (кл.)',BALLR(lv)]],
  spr:[['Дальность (кл.)',sprN(lv)],['Замедление','×0.5']],
  shock:[['Урон',Math.round((lv>1?40:25)*v)],['Перезарядка (сек)',lv>1?1.6:2],['Дальность (кл.)',shockCells(0,sp).length]],
  fence:[['Прочность',Math.round(1200*(save.shop.lux?1.6:1)*(pk.fence?1.5:1))]],
  cuc:[['Отпугивает на (кл.)',4]],laser:[['Зарядов',8]],yarn:[['Держит котов (сек)',5]],mine:[['Урон',900],['Взводится (сек)',8]],
  pipe:[['Фонтан (сек)',8],['Мочит клеток',3]],pole:[['Ударов током',3],['Урон',45]]})[t]||[]}
function statDiff(t,a,b,spA,spB){const A0=stats(t,a,spA),B0=stats(t,b,spB);
 return B0.map(([n,v],i)=>{const o=A0[i]?A0[i][1]:v;if(o===v)return{txt:`${n}: ${v}`};const d=typeof v=='number'&&typeof o=='number'?Math.round((v-o)*100)/100:null;
  return{txt:`${n}: ${o} → ${v}${d!=null?` (${d>0?'+':''}${d})`:''}`,up:1}})}
const poleFt=(r,c)=>S.fountains.find(f=>Math.abs(f.r-r)<=1&&Math.abs(f.c-c)<=2);
const pipeNear=(r,c)=>(S.lv.pipes||[]).some(([pr,pc])=>Math.abs(pr-r)<=1&&Math.abs(pc-c)<=2);

/* ---------- input ---------- */
let ptr={x:-1,y:-1,in:false,mouse:false},drag=null,pan=null,sel=null,hov=null,mmDrag=false;
function usable(k){const d=cardDef(k);return canBuild()&&S.en>=d.cost&&!(S.cool[k]>0)}
function cardDown(ev,k,c){ev.preventDefault();if(!usable(k)){placementFeedback(S.en<cardDef(k).cost?'Не хватает монет':'Карточка пока недоступна');c.classList.remove('no');void c.offsetWidth;c.classList.add('no');SFX.bad();return}
 drag={k,x0:ev.clientX,y0:ev.clientY,moved:0};ptr.mouse=ev.pointerType=='mouse'}
addEventListener('pointermove',e=>{if(!drag)return;ptr.x=e.clientX/viewZoom;ptr.y=(e.clientY-cvTop)/viewZoom;ptr.in=ptr.y>0;if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>8)drag.moved=1});
addEventListener('pointerup',()=>{pan=null;mmDrag=false;if(!drag)return;const k=drag.k;
 if(drag.moved){if(ptr.y>0)tryPlace(k,ptr.x+camX,ptr.y+camY);sel=null}else sel=sel===k?null:k;drag=null});
function mmRect(){const w=Math.max(120,Math.min(UW-260,420));return{x:12,y:UH-26,w,h:17}}
function mmJump(px){const m=mmRect();camX=clamp((px-m.x)/m.w*WW-VW/2,0,maxCam())}
cv.addEventListener('pointermove',e=>{ptr.x=e.clientX/viewZoom;ptr.y=(e.clientY-cvTop)/viewZoom;ptr.in=true;ptr.mouse=e.pointerType=='mouse';
 if(mmDrag){mmJump(ptr.x*UK);return}
 if(pan&&!(e.buttons&1))pan=null;
 if(magOn()){const wx=ptr.x+camX;S.coins.filter(c=>!c.fly&&Math.hypot(wx-c.x,ptr.y+camY-c.y)<magR()).forEach(c=>grabCoin(0,0,c))}});
cv.addEventListener('pointerleave',()=>{if(!drag)ptr.in=false});
cv.addEventListener('pointerdown',e=>{pan=null;if(!S||e.button!==0)return;ptr.x=e.clientX/viewZoom;ptr.y=(e.clientY-cvTop)/viewZoom;ptr.in=true;ptr.mouse=e.pointerType=='mouse';
 if(S.phase=='intro'){S.it=Math.max(S.it,5.8);return}
 const m=mmRect(),ux=ptr.x*UK,uy=ptr.y*UK;if(ux>=m.x&&ux<=m.x+m.w&&uy>=m.y-5&&uy<=m.y+m.h+5){mmDrag=true;mmJump(ux);try{cv.setPointerCapture(e.pointerId)}catch(_){}return}
 const wx=ptr.x+camX,wy=ptr.y+camY;
 if(S.trophy&&Math.hypot(wx-S.trophy.x,wy-S.trophy.y)<C*.75){openReveal();return}
 if(grabCoin(wx,wy)){pan={sweep:1};try{cv.setPointerCapture(e.pointerId)}catch(_){}return}
 if(sel&&canBuild()){tryPlace(sel,wx,wy);sel=null;return}
});
cv.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey){changeZoom(e.deltaY<0?1.1:1/1.1);return}
 if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)||maxCamY()===0)camX=clamp(camX+(e.deltaX||e.deltaY)/viewZoom,0,maxCam());
 else camY=clamp(camY+e.deltaY/viewZoom,0,maxCamY())},{passive:false});
addEventListener('keydown',e=>{if(!S||$('#game').hidden)return;if(e.key=='ArrowRight')camX=clamp(camX+C*2,0,maxCam());if(e.key=='ArrowLeft')camX=clamp(camX-C*2,0,maxCam());
 if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','+','=','-'].includes(e.key))e.preventDefault();
 if(e.key=='ArrowDown')camY=clamp(camY+C*2,0,maxCamY());if(e.key=='ArrowUp')camY=clamp(camY-C*2,0,maxCamY());
 if(e.key=='+'||e.key=='=')changeZoom(1.2);if(e.key=='-')changeZoom(1/1.2);
 if(e.key==' '&&S.phase=='play'){S.paused=!S.paused;e.preventDefault()}});
function grabCoin(wx,wy,c){c=c||S.coins.find(c=>!c.fly&&Math.hypot(wx-c.x,wy-(c.y-C*.08+Math.sin(S.t*4+c.x)*1.5))<C*(c.gold?.22:.19));if(!c)return false;
 c.fly=1;c.t=0;c.sx=c.x-camX;c.sy=c.y-camY;const r=$('#money').getBoundingClientRect();c.tx=(r.left+r.width/2)/viewZoom;c.ty=(r.top+r.height/2-cvTop)/viewZoom;SFX.coin(c.gold);S.collected++;return true}
const cellAt=(wx,wy)=>({c:Math.floor((wx-X0)/C),r:Math.floor((wy-oy-TOPH)/C)});
const unitAt=(r,c)=>S.units.find(u=>u.r===r&&u.c===c&&!u.dead);
function check(k,c,r){if(k=='shovel'){const u=unitAt(r,c);return u?{ok:1,u}:{ok:0}}
 if(k=='bowl')return{ok:okR(r)&&c>=YC&&c<COLS&&!S.bowls.some(b=>b.r==r&&b.c==c)};
 if(k=='pipe')return{ok:!!(S.lv.pipes||[]).find(p=>p[0]==r&&p[1]==c)};
 if(k=='pole')return{ok:!!(S.lv.poles||[]).find(p=>p[0]==r&&p[1]==c)};
 if(A[k])return{ok:(S.lv.cross||[]).includes(c)&&r>=-1&&r<=S.rows};
 if(!okR(r)||c<0||c>=YC)return{ok:0};const u=unitAt(r,c);if(!u)return{ok:1};
 if(u.t===k&&u.lv<maxLv(k,S.i))return{ok:1,up:u};return{ok:0}}
function tryPlace(k,wx,wy){if(!usable(k)){placementFeedback(S.en<cardDef(k).cost?'Не хватает монет':'Карточка перезаряжается');SFX.bad();return}const{c,r}=cellAt(wx,wy),ch=check(k,c,r),d=cardDef(k);
 if(!ch.ok){placementFeedback('Здесь нельзя поставить эту защиту');SFX.bad();return}
 S.en-=d.cost;S.cool[k]=(d.cd||0)*(S.bon.chili?.9:1)*(k=='cuc'&&save.perks&&save.perks.cucfast?.5:1);const px=FX(c+.5),py=FY(r)+C*.85;
 if(k=='shovel'){ch.u.dead=1;burst(px,py,'#b8975f',8);SFX.crunch();return}
 if(k=='bowl'){S.bowls.push({r,c,food:3,t:0});SFX.place();burst(px,py,'#8d6e63',6);return}
 if(k=='pipe'){S.fountains.push({r,c,t:8});SFX.splash();return}
 if(k=='pole'){const ft=poleFt(r,c);let cells=[[r,c]];
  if(ft)for(let q=-1;q<=1;q++)cells.push([ft.r,ft.c+q]);
  const src={x:FX(c+.8)+C*.25,y:FY(r)+C*.9-C*1.12};S.zaps.push({cells,left:3,cd:.45,src});S.wires.push({x1:src.x,y1:src.y,x2:FX(c+.5),y2:FY(r)+C*.7,life:3});SFX.zap(2);return}
 if(A[k]){S.cars.push({c,y:-1.6,k,hit:new Set()});SFX.horn(k);return}
 SFX.place();burst(px,py,'#c9a66b',10);
 if(ch.up){ch.up.lv++;ch.up.hp=ch.up.max;ch.up.pop=.12;for(let i=0;i<16;i++)P({x:px,y:py-C*.4,vx:(Math.random()-.5)*C*3,vy:-C*(1+Math.random()*2),g:C*5,life:.8,size:C*.06,col:'#ffd54f'});
  P({k:'txt',txt:'Улучшено!',x:px,y:py-C*.9,vy:-C*.5,life:1.2,col:'#ffcf3f'});SFX.reveal();return}
 const hp=U[k].hp*(k=='fence'?(save.shop.lux?1.6:1)*(save.perks&&save.perks.fence?1.5:1):1);
 S.units.push({t:k,r,c,lv:1,hp,max:hp,cd:k=='wheel'?(S.bon.catnip?.4:3):0,ph:Math.random()*5,fire:0,charges:8,arm:k=='mine'?8:0,id:S.id++,pop:0})}

/* ---------- simulation ---------- */
function P(o){S.parts.push(Object.assign({k:'dot',vx:0,vy:0,g:0,life:.8,size:4,col:'#fff'},o,{max:o.life||.8}))}
function burst(x,y,col,n,sp=1){for(let i=0;i<n;i++)P({x,y,vx:(Math.random()-.5)*C*3*sp,vy:-C*Math.random()*2.5*sp,g:C*7,life:.6,size:C*.05,col})}
function txt(e,s,col){P({k:'txt',txt:s,x:FX(e.x),y:FY(e.y)+C*.1,vy:-C*.5,life:1.1,col})}
const onRow=(e,r)=>Math.abs(e.r-r)<=(e.span||0);
const inCells=(r,a,b)=>S.enemies.filter(e=>e.state=='walk'&&!e.dead&&!e.flee&&!e.jf&&onRow(e,r)&&e.x>=a&&e.x<b).sort((p,q)=>p.x-q.x);
function mk(type,r,x,y){const d=E[type],hm=(S.lv.hpm||1)*(S.i>=2?.9:1),e={id:S.id++,type,r,x,y:y??r,hp:d.hp*hm,max:d.hp*hm,span:d.boss?1:0,arm:d.arm?1:0,armHp:d.arm||0,sp:d.sp*(S.i>=2?.95:1),ph:Math.random()*6,t:0,soak:0,boost:0,hit:0,stun:0,rust:0,mt:0,vt:0,state:'walk',sndT:2+Math.random()*8};S.enemies.push(e);return e}
function spawn(s){const d=S.lv.doors[s.d],e=mk(s.type,s.r,d.c+.5,d.s=='t'?-.9:S.rows-.1);e.state='enter';S.doorOpen[s.d]=1.3;S.spawned++;
 if(SPECIAL.has(s.type)){S.toasts.push({type:s.type,txt:`${E[s.type].n} выходит ${d.s=='t'?'из дома':'из подворотни'} №${d.c}`,life:5});SFX.sting();
  setTimeout(()=>voice(s.type,1,2),500);if(s.type=='boss'){music('boss');banner('Король Пылесосов!')}}}
function dropCoin(x,y,ground,val){S.coins.push({x,y,vx:(Math.random()-.5)*C*.8,vy:-C*3.2,ground,life:9,val,gold:val>=25})}
/* Магнит включается только нажатием на монету и работает до отпускания кнопки. */
const MAGNET_UNLOCK=7;
const magnetUpgraded=()=>!!(save.shop.magnet&&save.lvl>=MAGNET_UNLOCK);
const magR=()=>C*(magnetUpgraded()?.6:.2),magOn=()=>!!(pan&&pan.sweep&&ptr.in&&S&&!S.paused&&$('#ov').hidden&&(S.phase=='play'||S.phase=='won'));
addEventListener('pointercancel',()=>{pan=null});
addEventListener('blur',()=>{pan=null});
function enemyVoice(e){if(S.sndGap>0||!AU.ctx)return;const sx=FX(e.x)-camX,on=sx>-50&&sx<VW+50;voice(e.type,clamp(sx/VW*2-1,-1,1),(on?1:.45)*(SPECIAL.has(e.type)?2:1));S.sndGap=1.4}
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
function upU(u,dt){u.ph+=dt;if(u.pop!=null&&u.pop<1)u.pop+=dt;u.cd-=dt;if(u.fire>0)u.fire-=dt;if(u.hurt>0)u.hurt-=dt;
 const s=C/72,cx=FX(u.c+.5),fy=FY(u.r)+C*.88;
 if(u.t=='wheel'){if(u.cd<=0){const gold=u.lv>1;u.cd=gold?8:5;dropCoin(cx,fy-C*.7,FY(u.r)+C*.82,gold?25:save.perks&&save.perks.wheel15?15:10)}}
 else if(u.t=='ball'){const end=reach('ball',u.lv,u.r,u.c).b;if(u.cd<=0&&S.enemies.some(e=>e.state=='walk'&&!e.flee&&e.type!='ghost'&&onRow(e,u.r)&&e.x>u.c+.4&&e.x<Math.min(end-.3,YC+1.5))){u.cd=1.5*(save.perks&&save.perks.rate?.85:1);u.fire=.18;for(let i=0;i<u.lv;i++)S.balls.push({x:u.c+.9-i*.42,r:u.r,lv:u.lv,end});SFX.pop()}}
 else if(u.t=='spr'){const n=u.lv>1?3:2;if(u.cd<=0){const es=inCells(u.r,u.c+1,u.c+1+n).filter(e=>e.type!='ghost');if(es.length){u.cd=1;u.fire=.9;
  es.forEach(e=>{if(e.type=='robo'){if(e.rust<=0)txt(e,'Ржавеет!','#ffab91');e.rust=6}else if(!E[e.type].swim)e.soak=3;if(e.type=='box')hit(e,10,'w');
   for(let i=0;i<3;i++)P({x:FX(e.x),y:FY(e.y)+C*.35,vx:(Math.random()-.5)*C*1.2,vy:-C*(1+Math.random()),g:C*6,life:.5,size:C*.045,col:'#8fd0ff'})});SFX.splash()}}}
 else if(u.t=='shock'){if(u.cd<=0){const sp=sprAt(u.r,u.c+1),via=!!sp,cells=shockCells(u.c,sp);
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
  if((u.snd=(u.snd||0)-dt)<=0){u.snd=.42+Math.random()*.2;const pn=clamp((FX(u.c)-camX)/VW*2-1,-1,1),on=FX(u.c)-camX>-40&&FX(u.c)-camX<VW+40;if(on){if(t=='robo')SFX.clank(pn);else if(t=='ghost')SFX.haunt(pn);else if(u.t=='fence'||e.scratch||t=='basin')SFX.scratch(pn);else SFX.bite(pn)}}
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
  if(e){hit(e,b.lv==3?24:20,'b');b.x=99;burst(FX(e.x),FY(e.r)+C*.45,'#d7ef3a',4);SFX.thwack()}
  else if(b.x>=b.end){P({x:FX(b.end),y:FY(b.r)+C*.84,vx:C*1.2,vy:-C*1.4,g:C*7,life:.45,size:C*.07,col:'#d7ef3a'});b.x=99}});S.balls=S.balls.filter(b=>b.x<b.end);
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
  c.life-=dt;if(c.life<=0)c.done=1});
 if(magOn()){const mx=ptr.x+camX,my=ptr.y+camY,R=magR(),pull=magnetUpgraded()?7:3.5;S.coins.forEach(c=>{if(c.fly||c.done)return;const dx=mx-c.x,dy=my-c.y,d=Math.hypot(dx,dy);
  if(d<R)grabCoin(0,0,c);else if(d<R*1.9){const k=Math.min(1,pull*dt*(1.9-d/R));c.x+=dx*k;c.y+=dy*k;c.vy=0;c.vx=0;c.mag=.15}})}
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
 if(S.trophy){S.trophy.t+=dt;if(S.trophy.t<1.2)camX=lerp(camX,clamp(S.trophy.x-VW/2,0,maxCam()),dt*4);camY=lerp(camY,clamp(S.trophy.y-VH/2,0,maxCamY()),dt*4)}}
function intro(dt){S.it+=dt;setMusicIntensity(.03);const M=maxCam(),t=S.it;
 if(t<.6)camX=0;else if(t<2.2)camX=ease((t-.6)/1.6)*M;else if(t<4.4)camX=M;else if(t<5.8)camX=(1-ease((t-4.4)/1.4))*M;else{camX=0;camY=clamp(FY(0)+S.rows*C/2-VH/2,0,maxCamY());S.phase='prepare';S.rt=0;buildBar();layout()}
 S.preview.forEach(p=>p.ph+=dt*2)}

/* ---------- world render ---------- */
function drawField(){drawOverheadField()}
function drawHome(s){drawOverheadHome()}
function drawDoors(){S.lv.doors.forEach((d,i)=>{
 const x=FX(d.c+.5),top=d.s=='t',soon=S.spawns.some(s=>s.d===i&&s.t-S.t<4),open=soon||S.doorOpen[i]>0;
 const y=top?FY(0)-C*.2:FY(S.rows)+C*.5,w=C*.46,h=C*.2;
 // Doors live in the houses/gateways; only an opening doorway with glowing eyes is drawn on top.
 if(open){const k=Math.min(1,(S.doorOpen[i]>0?S.doorOpen[i]:1)*2);g.globalAlpha=k;el(g,x,y,w*.7,h*.9,'rgba(20,16,22,.75)');[-1,1].forEach(q=>el(g,x+q*C*.07,y,C*.028,C*.028*(.4+.6*Math.abs(Math.sin(S.t*3+i))),'#c8ef7d'));g.globalAlpha=1}
 if(soon){const a=1+Math.sin(S.t*10)*.1;g.save();g.translate(x+C*.32,y-C*.15);g.scale(a,a);rr(g,-C*.1,-C*.12,C*.2,C*.24,2,'#e9c85c');g.fillStyle='#2e2527';g.font='900 '+C*.19+'px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',0,0);g.restore()}
 })}
function drawBolt(x1,y1,x2,y2,a,lv){const n=7,pts=[x1,y1];for(let i=1;i<n;i++)pts.push(lerp(x1,x2,i/n)+(Math.random()-.5)*C*.22,lerp(y1,y2,i/n)+(Math.random()-.5)*C*.22);pts.push(x2,y2);
 g.globalAlpha=a*.5;ln(g,lv>1?'#ce93d8':'#fff176',C*(lv>1?.16:.11),...pts);g.globalAlpha=a;ln(g,lv>1?'#f3e5f5':'#fffde7',C*.035,...pts);
 if(Math.random()<.5){const k=2+(Math.random()*4|0);ln(g,lv>1?'#e1bee7':'#fff59d',1.2,pts[k*2],pts[k*2+1],pts[k*2]+(Math.random()-.5)*C*.4,pts[k*2+1]+(Math.random()-.5)*C*.4)}
 g.globalAlpha=1}
function drawSurround(){comicGround(g,'lawn-tile',camX,camY,VW,VH,C*3,'#879544')}
function draw(){g.setTransform(dpr*viewZoom,0,0,dpr*viewZoom,0,0);g.fillStyle='#1a120b';g.fillRect(0,0,VW,VH);if(!S)return;
 const s=C/72,sx=S.shake>0&&!RM?(Math.random()-.5)*S.shake*14:0;
 g.save();g.translate(-camX+sx,-camY);drawSurround();drawField();
 const held=drag&&drag.moved?drag.k:sel,k=held||(S.phase=='play'?hov:null),showT=held&&ptr.in&&ptr.y>0,pul=.5+.5*Math.sin(S.t*6);S.pv=null;
 if(k&&canBuild()){
  const tgt=(r,c,lbl)=>{g.strokeStyle=`rgba(255,207,63,${.6+.4*pul})`;g.lineWidth=3;g.setLineDash([6,5]);g.strokeRect(FX(c)+3,FY(r)+3,C-6,C-6);g.setLineDash([]);
   if(lbl){g.font=`900 ${Math.max(10,C*.17)}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='#3a2210';const y=FY(r)-C*.08-pul*C*.08;g.strokeText(lbl,FX(c+.5),y);g.fillStyle='#ffcf3f';g.fillText(lbl,FX(c+.5),y)}};
  if(k=='shock')S.units.forEach(u=>{if(u.t=='spr'&&check('shock',u.c-1,u.r).ok){tgt(u.r,u.c-1,'⚡ КОМБО');drawReach(reach('shock',1,u.r,u.c-1,u),.35)}});
  if(k=='spr')S.units.forEach(u=>{if(u.t=='shock'&&check('spr',u.c+1,u.r).ok){tgt(u.r,u.c+1,'💧 КОМБО');drawReach(reach('shock',u.lv,u.r,u.c,{lv:1}),.35)}});
  if(k=='pipe'||k=='pole')(S.lv[k=='pipe'?'pipes':'poles']||[]).forEach(([r,c])=>{tgt(r,c,k=='pole'&&poleFt(r,c)?'⚡ КОМБО':'сюда');drawReach(reach(k,1,r,c),.3)});
  if(k=='pipe')(S.lv.poles||[]).forEach(([r,c])=>{if(pipeNear(r,c))tgt(r,c,'потом ⚡')});
  if(k=='pole')S.fountains.forEach(f=>drawReach(reach('pipe',1,f.r,f.c),.4));
  if(k=='bowl'){g.font=`900 ${Math.max(11,C*.2)}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=`rgba(255,207,63,${.6+.4*pul})`;g.fillText('ставь на улицу →',FX(YC+3),FY(0)-C*.12)}
  if(k=='taxi'||k=='truck')(S.lv.cross||[]).forEach(c=>{g.strokeStyle=`rgba(255,207,63,${.6+.4*pul})`;g.lineWidth=3;g.setLineDash([8,6]);g.strokeRect(FX(c)+3,oy+3,C-6,FH-6);g.setLineDash([])});
  if(U[k]||k=='shovel')for(let r=0;r<S.rows;r++)for(let c=0;c<YC;c++)if(check(k,c,r).ok){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(FX(c)+2,FY(r)+2,C-4,C-4)}
  if(k=='bowl'){g.fillStyle='rgba(255,207,63,.12)';g.fillRect(FX(YC),FY(0),(COLS-YC)*C,S.rows*C)}
  if(k=='pipe'||k=='pole')(S.lv[k=='pipe'?'pipes':'poles']||[]).forEach(([r,c])=>{g.strokeStyle='#ffcf3f';g.lineWidth=3;g.setLineDash([6,5]);g.strokeRect(FX(c)+3,FY(r)+3,C-6,C-6);g.setLineDash([])});
  if(k=='taxi'||k=='truck')(S.lv.cross||[]).forEach(c=>{g.fillStyle='rgba(255,207,63,.2)';g.fillRect(FX(c),oy,C,FH)});
  if(showT){const{c,r}=cellAt(ptr.x+camX,ptr.y+camY),ch=check(k,c,r);if(okR(r)||A[k]){g.fillStyle=ch.ok?'rgba(140,255,120,.35)':'rgba(255,90,90,.3)';if(k=='taxi'||k=='truck')g.fillRect(FX(c),oy,C,FH);else g.fillRect(FX(c),FY(r),C,C)}
   if(ch.ok&&U[k]&&okR(r)){const d=U[k],sp=k=='shock'?sprAt(r,c+1):null,bx=FX(c+.5)-camX,by=FY(r)-camY,pk=save.perks&&save.perks.shock2?1:0;
    if(ch.up){const u=ch.up;drawReach(reach(k,u.lv+1,r,c,sp),1,1);drawReach(Object.assign(reach(k,u.lv,r,c,sp),{col:'100,181,246'}),1);
     const L=statDiff(k,u.lv,u.lv+1,sp,sp);if(k=='spr'){const sh=unitAt(r,c-1);if(sh&&sh.t=='shock'){drawReach(reach('shock',sh.lv,r,c-1,{lv:u.lv+1}),.5,1);L.push({txt:`Комбо с шокером: ${sprN(u.lv)+pk} → ${sprN(u.lv+1)+pk} кл.`,up:1})}}
     S.pv={x:bx,y:by,title:`${d.n}: ур. ${u.lv} → ${u.lv+1}`,lines:L,two:1}}
    else{drawReach(reach(k,1,r,c,sp),.9);const L=stats(k,1,sp).map(([n,v])=>({txt:`${n}: ${v}`}));
     if(sp)L.push({txt:'⚡ Комбо: ток бежит по струе!',up:1});
     if(k=='spr'){const sh=unitAt(r,c-1);if(sh&&sh.t=='shock'){drawReach(reach('shock',sh.lv,r,c-1,{lv:1}),.6);L.push({txt:'⚡ Комбо: шокер ударит по струе!',up:1})}}
     S.pv={x:bx,y:by,title:d.n,lines:L}}}
   if(ch.ok&&k=='pole'&&poleFt(r,c))S.pv={x:FX(c+.5)-camX,y:FY(r)-camY,title:'Столб + фонтан',lines:[{txt:'⚡ Ток разойдётся по всей воде',up:1}]}}}
 else if(ptr.mouse&&ptr.in&&!drag&&!sel&&S.phase=='play'){const{c,r}=cellAt(ptr.x+camX,ptr.y+camY),u=okR(r)&&unitAt(r,c);if(u)drawReach(reach(u.t,u.lv,r,c,u.t=='shock'?sprAt(r,c+1):null),.55)}
 const items=[];
 S.bowls.forEach(b=>items.push([FY(b.r)+C*.85,()=>{g.save();g.translate(FX(b.c+.5),FY(b.r)+C*.85);g.scale(s,s);drawBowl(g,b.food);g.restore()}]));
 const hk=k;
 S.units.forEach(u=>items.push([FY(u.r)+C*.88,()=>{const ux=FX(u.c+.5),uy=FY(u.r)+C*.88,canUp=U[u.t].up&&u.lv<maxLv(u.t,S.i),ready=canUp&&S.en>=U[u.t].cost&&!(S.cool[u.t]>0)&&S.phase=='play',held=hk===u.t&&canUp;
  if(u.lv>1){g.fillStyle=rgrad(g,ux,uy-C*.35,0,C*.62,[[0,u.lv>2?'rgba(255,214,79,.55)':'rgba(130,220,255,.45)'],[1,'rgba(255,255,255,0)']]);g.fillRect(ux-C*.65,uy-C,C*1.3,C*1.2)}
  if(held){g.fillStyle=rgrad(g,ux,uy-C*.35,0,C*.75,[[0,`rgba(255,230,90,${.55+.35*pul})`],[1,'rgba(255,230,90,0)']]);g.fillRect(ux-C*.8,uy-C*1.1,C*1.6,C*1.4);g.strokeStyle=`rgba(255,240,150,${.6+.4*pul})`;g.lineWidth=3;g.strokeRect(FX(u.c)+3,FY(u.r)+3,C-6,C-6)}
  g.save();g.translate(ux,uy);g.scale(s,s);drawUnit(g,u);g.restore();
  for(let k=1;k<u.lv;k++)sparkle(g,FX(u.c)+C*(.14+(k-1)*.17),FY(u.r)+C*.14,C*.08,u.lv>2?'#ffd54f':'#b3e5fc');
  if(held||ready){const by=FY(u.r)+C*.2-Math.abs(Math.sin(S.t*4))*C*.08,bx=FX(u.c)+C*.84;g.globalAlpha=held?1:.75;el(g,bx,by,C*.13,C*.13,held?'#ffca28':'#7cb342');poly(g,'#fff',bx,by-C*.08,bx+C*.07,by+C*.01,bx+C*.025,by+C*.01,bx+C*.025,by+C*.07,bx-C*.025,by+C*.07,bx-C*.025,by+C*.01,bx-C*.07,by+C*.01);g.globalAlpha=1}
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
 S.balls.forEach(b=>{const x=FX(b.x),y=FY(b.r)+C*.88-22*s*clamp((b.end-b.x)/1.3,.12,1);el(g,x,FY(b.r)+C*.86,C*.07,C*.025,'rgba(0,0,0,.25)');el(g,x,y,C*.09,C*.09,b.lv==3?'#ffeb3b':'#d7ef3a');g.strokeStyle='#fff';g.lineWidth=1.3;g.beginPath();g.arc(x-C*.05,y,C*.06,-1,1);g.stroke()});
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
 S.coins.forEach(c=>{if(c.fly)return;const bob=Math.sin(S.t*4+c.x)*1.5,cy=c.y-C*.08+bob,f=clamp(c.life/9,0,1),R=C*(c.gold?.14:.11),rad=R+C*.06;
  {g.lineCap='round';g.strokeStyle='rgba(26,18,11,.45)';g.lineWidth=C*.04;g.beginPath();g.arc(c.x,cy,rad,0,7);g.stroke();
   g.strokeStyle=f>.5?'#9ccc65':f>.28?'#ffca28':'#ff5252';g.lineWidth=C*.025;g.beginPath();g.arc(c.x,cy,rad,-Math.PI/2,-Math.PI/2+f*Math.PI*2);g.stroke()}
  if(c.life<2.5&&(c.life*6|0)%2)return;const pl=.6+.4*Math.sin(S.t*5+c.x);
  g.fillStyle=rgrad(g,c.x,cy,0,C*.3,[[0,c.gold?`rgba(255,220,80,${.55*pl})`:`rgba(255,255,255,${.45*pl})`],[1,'rgba(255,255,255,0)']]);g.fillRect(c.x-C*.3,cy-C*.3,C*.6,C*.6);
  sparkle(g,c.x+Math.cos(S.t*2+c.x)*R*1.3,cy+Math.sin(S.t*2+c.x)*R*1.3,C*.035*pl,'#fffde7');
  el(g,c.x,c.ground+C*.04,R*.8,R*.22,'rgba(0,0,0,.22)');coinSpin(g,c.x,cy,R,c.gold,S.t*3+c.x*.05)});
 if(magOn())drawMagnet();
 if(S.trophy){const t=S.trophy,b=Math.sin(t.t*3)*C*.08;g.save();g.translate(t.x,t.y+b);g.rotate(Math.sin(t.t*2)*.08);
  for(let i=0;i<10;i++){const q=i/10*Math.PI*2+t.t;g.globalAlpha=.35;poly(g,'#fff59d',0,0,Math.cos(q)*C*1.1,Math.sin(q)*C*1.1,Math.cos(q+.15)*C*1.1,Math.sin(q+.15)*C*1.1)}g.globalAlpha=1;
  rr(g,-C*.36,-C*.46,C*.72,C*.92,8,'#c6e39a');rr(g,-C*.3,-C*.4,C*.6,C*.6,6,'#f3fbdc');g.fillStyle='#2f6a17';g.font=`900 ${C*.3}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('?',0,-C*.1);g.font=`900 ${C*.12}px Nunito,sans-serif`;g.fillText('ЖМИ',0,C*.32);g.restore()}
 g.restore();
 S.coins.forEach(c=>{if(!c.fly)return;const q=ease(Math.min(1,c.t));coinSpin(g,lerp(c.sx,c.tx,q),lerp(c.sy,c.ty,q)-Math.sin(q*Math.PI)*C*.7,C*(c.gold?.14:.11)*(1-q*.3),c.gold,S.t*9)});
 drawDragGhost(s);uiSpace();g.setTransform(dpr*UZ,0,0,dpr*UZ,0,0);drawHUD()}
function drawReach(R,a,next){if(!R)return;const x0=FX(Math.max(R.a,0)),x1=FX(R.b),pul=.5+.5*Math.sin(S.t*6);
 R.rows.forEach(r=>{const y=FY(r)+C*.3,h=C*.4;
  if(next){g.fillStyle=`rgba(255,213,79,${.16*a})`;g.fillRect(x0,y-4,x1-x0,h+8);g.strokeStyle=`rgba(255,213,79,${(.7+.3*pul)*a})`;g.lineWidth=3;g.setLineDash([9,6]);g.strokeRect(x0,y-4,x1-x0,h+8);g.setLineDash([]);return}
  g.fillStyle=lgrad(g,x0,0,x1,0,[[0,`rgba(${R.col},${.55*a})`],[.8,`rgba(${R.col},${.35*a})`],[1,`rgba(${R.col},${.05*a})`]]);g.fillRect(x0,y,x1-x0,h);
  if(R.t=='shock'||R.t=='pole'){g.globalAlpha=a;const pts=[];for(let x=x0;x<=x1;x+=C*.2)pts.push(x,y+h/2+((x/C*5|0)%2?-1:1)*h*.28);ln(g,'#fffde7',2,...pts);g.globalAlpha=1}
  if(R.t=='ball'){g.globalAlpha=a;el(g,x1-C*.12,FY(r)+C*.82,C*.08,C*.08,'#d7ef3a');ln(g,'rgba(255,255,255,.8)',2,x1-C*.3,y+h*.3,x1-C*.16,FY(r)+C*.72);g.globalAlpha=1}})}
function drawPv(){const p=S.pv;if(!p)return;const px=p.x*UK,py=p.y*UK,cc=C*UK;g.font='900 14px Nunito,sans-serif';let lw=g.measureText(p.title).width;g.font='800 13px Nunito,sans-serif';p.lines.forEach(l=>lw=Math.max(lw,g.measureText(l.txt).width));lw+=24;const h=26+p.lines.length*19+(p.two?20:0);
 const x=clamp(px-lw/2,8,UW-lw-8),y=py-h-10>4?py-h-10:py+cc+10;
 rr(g,x,y+3,lw,h,10,'rgba(0,0,0,.35)');rr(g,x,y,lw,h,10,'rgba(26,18,11,.94)');g.textAlign='left';g.textBaseline='middle';
 g.font='900 14px Nunito,sans-serif';g.fillStyle='#ffcf3f';g.fillText(p.title,x+12,y+15);g.font='800 13px Nunito,sans-serif';
 p.lines.forEach((l,i)=>{g.fillStyle=l.up?'#9ccc65':'#fff3d6';g.fillText(l.txt,x+12,y+34+i*19)});
 if(p.two){const yy=y+h-12;rr(g,x+12,yy-5,18,10,2,'rgba(143,208,255,.8)');g.fillStyle='#fff3d6';g.fillText('сейчас',x+34,yy);rr(g,x+96,yy-5,18,10,2,'rgba(255,213,79,.9)');g.fillText('после',x+118,yy)}}
function drawMagnet(){const x=ptr.x+camX,y=ptr.y+camY,R=magR(),big=magnetUpgraded(),col=big?'255,213,79':'143,208,255',a=big?1:.6;
 g.fillStyle=rgrad(g,x,y,0,R,[[0,`rgba(${col},${.22*a})`],[.7,`rgba(${col},${.1*a})`],[1,`rgba(${col},0)`]]);g.beginPath();g.arc(x,y,R,0,7);g.fill();
 for(let i=0;i<3;i++){const q=(S.t*(big?1.6:1.1)+i/3)%1,r=R*1.9*(1-q)+R*.15*q;g.strokeStyle=`rgba(${col},${(big?.55:.35)*Math.sin(q*Math.PI)})`;g.lineWidth=big?3:2;g.setLineDash([C*.12,C*.1]);g.beginPath();g.arc(x,y,r,S.t*(big?2:1)+i,S.t*(big?2:1)+i+7);g.stroke()}g.setLineDash([]);
 ring(g,x,y,R,`rgba(${col},${.7*a})`,big?2.5:1.5);
 S.coins.forEach(c=>{if(c.fly||!(c.mag>0))return;c.mag-=1/60;g.globalAlpha=Math.min(1,c.mag*6)*a;ln(g,`rgba(${col},.8)`,2,c.x,c.y-C*.1,x,y);g.globalAlpha=1});
 if(big)for(let i=0;i<4;i++){const q=S.t*3+i*Math.PI/2;sparkle(g,x+Math.cos(q)*R*.8,y+Math.sin(q)*R*.8,C*.06,'#fff59d')}}
function hpBar(x,y,v,col){rr(g,x-C*.25,y,C*.5,C*.06,2,'rgba(0,0,0,.55)');rr(g,x-C*.25+1,y+1,(C*.5-2)*clamp(v,0,1),C*.06-2,2,col)}
function txtOut(t,x,y,size,col,stroke='#3a2210'){g.font=`${size}px "Lilita One",Impact,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=size*.18;g.strokeStyle=stroke;g.lineJoin='round';g.strokeText(t,x,y);g.fillStyle=col;g.fillText(t,x,y)}
function wrap(t,w){const out=[];let cur='';t.split(' ').forEach(word=>{const n=cur?cur+' '+word:word;if(g.measureText(n).width>w&&cur){out.push(cur);cur=word}else cur=n});if(cur)out.push(cur);return out}
function arrow(x,y,dir,label,col,C=46){const p=1+Math.sin(S.t*8)*.08;g.save();g.translate(x,y);g.scale(p,p);rr(g,-C*.32,-C*.22,C*.64,C*.44,C*.14,col);poly(g,col,dir*C*.3,-C*.16,dir*C*.5,0,dir*C*.3,C*.16);
 g.fillStyle='#fff';g.font=`900 ${C*.2}px Nunito,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(label,0,1);g.restore()}
// HUD lives in screen space: camera zoom must never inflate hints, minimap or arrows.
let UZ=1,UW=800,UH=600,UK=1;
const uiZ=()=>clamp(Math.min(innerWidth/1180,innerHeight/760),.78,1.1);
function uiSpace(){UZ=uiZ();UW=innerWidth/UZ;UH=VH*viewZoom/UZ;UK=viewZoom/UZ}
function drawHUD(){const AR=46,uy=y=>y*UK;
 if(S.phase=='prepare'){const w=Math.min(400,UW-30);rr(g,(UW-w)/2,10,w,46,9,'#fff2d9');g.fillStyle='#30252c';g.font='700 15px Oswald,Impact,sans-serif';g.textAlign='center';g.textBaseline='alphabetic';g.fillText('Расставь защиту — затем «Начать волну»',UW/2,30);g.font='11px Nunito,sans-serif';g.fillText('1–9: карточки · Enter: начать · Esc: отменить выбор',UW/2,47)}
 if(S.feedback&&S.feedback.life>0){const w=Math.min(330,UW-24);rr(g,(UW-w)/2,UH-74,w,26,7,'#fff2d9');g.fillStyle='#3b292d';g.font='700 13px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(S.feedback.txt,UW/2,UH-61)}
 if(S.phase=='play'||S.phase=='won'){for(let r=0;r<S.rows;r++){let nR=0,nL=0;S.enemies.forEach(e=>{if(!onRow(e,r))return;const x=FX(e.x)-camX;if(x>VW-6)nR++;if(x<-C*.3&&e.x<YC+1)nL++});
   const y=uy(FY(r)+C/2-camY);if(nR)arrow(UW-AR*.55,y,1,'×'+nR,'rgba(230,81,0,.92)',AR);if(nL&&camX>C)arrow(AR*.55,y,-1,'!'+nL,'rgba(211,47,47,.95)',AR)}
  S.lv.doors.forEach((d,i)=>{if(S.spawns.some(s=>s.d===i&&s.t-S.t<4)&&FX(d.c+.5)-camX>VW)arrow(UW-AR*.55,clamp(uy((d.s=='t'?oy+TOPH*.5:FY(S.rows)+BOTH*.5)-camY),AR*.3,UH-AR*.3),1,'!','rgba(255,193,7,.95)',AR)})}
 if(S.phase!='pre'){const m=mmRect(),k=m.w/WW,ry=r=>m.y+3+(r+.5)/S.rows*(m.h-6);
  rr(g,m.x-4,m.y-4,m.w+8,m.h+8,8,'rgba(26,18,11,.8)');rr(g,m.x,m.y,X0*k,m.h,3,'#b23a2a');rr(g,m.x+X0*k,m.y,(FX(YC)-X0)*k,m.h,0,'#68b237');rr(g,m.x+FX(YC)*k,m.y,(WW-FX(YC))*k,m.h,3,'#6b6e77');
  (S.lv.cross||[]).forEach(c=>{g.fillStyle='#4e5058';g.fillRect(m.x+FX(c)*k,m.y,C*k,m.h)});
  S.lv.doors.forEach((d,i)=>{const soon=S.spawns.some(s=>s.d===i&&s.t-S.t<4);const x=m.x+FX(d.c+.5)*k,y=d.s=='t'?m.y-2:m.y+m.h+2;el(g,x,y,2.6,2.6,soon&&(S.t*6|0)%2?'#ff5252':'#ffcf3f')});
  const hk=drag&&drag.moved?drag.k:sel||hov;if(hk&&A[hk]&&(S.t*4|0)%2){const pts=hk=='pipe'?S.lv.pipes:hk=='pole'?S.lv.poles:hk=='bowl'?[]:(S.lv.cross||[]).map(c=>[S.rows/2-.5,c]);(pts||[]).forEach(([r,c])=>el(g,m.x+FX(c+.5)*k,ry(r),3.5,3.5,'#ffcf3f'));if(hk=='bowl'){g.fillStyle='rgba(255,207,63,.45)';g.fillRect(m.x+FX(YC)*k,m.y,(WW-FX(YC))*k,m.h)}}
  S.units.forEach(u=>{g.fillStyle='rgba(255,255,255,.7)';g.fillRect(m.x+FX(u.c+.5)*k-1,ry(u.r)-1,2,2)});
  S.coins.forEach(c=>el(g,m.x+c.x*k,m.y+m.h/2,1.8,1.8,c.gold?'#ffd54f':'#e0e0e0'));
  S.enemies.forEach(e=>{const sp=SPECIAL.has(e.type);el(g,m.x+FX(e.x)*k,ry(clamp(e.y,0,S.rows-1)),sp?3:2.1,sp?3:2.1,sp?'#ff5252':(PAL[e.type]||PAL.cat)[0])});
  g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(m.x+camX*k,m.y-2,VW*k,m.h+4);
  const w=Math.min(190,UW*.26),x=UW-w-12,y=UH-22,f=S.spawned/S.total;rr(g,x-4,y-4,w+8,20,9,'rgba(26,18,11,.8)');rr(g,x,y,w,12,6,'#4a3220');rr(g,x+w*(1-f),y,w*f,12,6,'#8bc34a');
  S.bigs.forEach(b=>{let n=0;S.lv.w.forEach(q=>{if(q[0]<b.t)n+=q[1].split(',').length});const fx=x+w*(1-Math.min(1,n/S.total));ln(g,'#fff',2,fx,y-7,fx,y+11);poly(g,'#e53935',fx,y-7,fx-9,y-3.5,fx,y)});
  g.save();g.translate(x+w*(1-f),y+11);g.scale(.36,.36);drawCat(g,{type:'cat',ph:0});g.restore();
  if(UW>620){g.fillStyle='#fff3d6';g.font='800 11px Nunito,sans-serif';g.textAlign='right';g.textBaseline='middle';g.fillText(`${S.i+1}. ${S.lv.n}`,x-10,y-12)}}
 S.toasts.forEach((t,i)=>{const a=Math.min(1,t.life),y=UH-66-i*40;g.globalAlpha=a;g.font='800 12px Nunito,sans-serif';const w=g.measureText(t.txt).width+56;
  rr(g,12,y-16,w,32,9,'rgba(80,10,10,.88)');g.save();g.translate(32,y+12);g.scale(.32,.32);drawCat(g,{type:t.type,ph:S.t*3,arm:E[t.type].arm?1:0});g.restore();
  g.fillStyle='#ffe0e0';g.textAlign='left';g.textBaseline='middle';g.fillText(t.txt,50,y);g.globalAlpha=1});
 if(hov&&!drag&&!sel&&canBuild()){const d=cardDef(hov),st=stats(hov,1).map(([n,v])=>`${n}: ${v}`).join(' · ');g.font='800 12px Nunito,sans-serif';const ls=[d.n,...wrap(d.d||d.s,Math.min(400,UW-60)),...(st?[st]:[])],w=Math.min(440,UW-30),h=ls.length*17+14,x=(UW-w)/2,y=8;
  rr(g,x,y+3,w,h,11,'rgba(58,34,16,.6)');rr(g,x,y,w,h,11,A[hov]?'#e3f0ff':'#fff3d6');g.textAlign='center';g.textBaseline='top';ls.forEach((l,i)=>{g.font=i==0?'900 14px Nunito,sans-serif':'800 12px Nunito,sans-serif';g.fillStyle=i==0?'#7a3d10':i==ls.length-1&&st?'#2e7d32':'#3a2210';g.fillText(l,UW/2,y+7+i*17)})}
 else if(S.phase=='play'&&S.hints.length){const t=S.hints[0].txt;g.font='800 13px Nunito,sans-serif';const ls=wrap(t,Math.min(420,UW-60)),w=Math.min(460,UW-30),h=ls.length*18+14,x=(UW-w)/2,y=8;
  rr(g,x,y+3,w,h,11,'rgba(58,34,16,.6)');rr(g,x,y,w,h,11,'#fff3d6');g.fillStyle='#3a2210';g.textAlign='center';g.textBaseline='top';ls.forEach((l,i)=>g.fillText(l,UW/2,y+8+i*18));
  helperPortrait(x-6,y,h)}
 const boss=S.enemies.find(e=>e.span);if(boss&&S.phase=='play'){const w=Math.min(480,UW-40),x=(UW-w)/2,y=S.hints.length?84:12;rr(g,x-6,y-4,w+12,32,11,'rgba(40,10,40,.9)');
  rr(g,x,y+13,w,11,6,'#3a1a3a');rr(g,x,y+13,w*Math.max(0,boss.hp/boss.max),11,6,'#ab47bc');g.fillStyle='#f3e5f5';g.font='900 12px Nunito,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(E.boss.n+' · '+Math.ceil(boss.hp),UW/2,y+5)}
 drawPv();
 if(S.banner){const a=S.banner.life,sc=a>2.3?1+(a-2.3)*2:1;g.save();g.translate(UW/2,UH*.42);g.scale(sc,sc);g.globalAlpha=Math.min(1,a*2);txtOut(S.banner.t,0,0,Math.min(48,UW/13),'#ffcf3f','#7a2a10');g.restore();g.globalAlpha=1}
 if(S.phase=='intro'&&S.it>1.8&&S.it<4.6)txtOut('Сегодня придут:',UW/2,UH*.16,Math.min(32,UW/16),'#fff3d6');
 if(S.phase=='ready'){const t=S.rt,w=t<.7?'Приготовься…':t<1.4?'Ставь…':'ДЕРЖИСЬ!';txtOut(w,UW/2,UH*.45,Math.min(t<1.4?44:62,UW/9),t<1.4?'#fff3d6':'#ff5252','#3a2210')}
 if(S.paused)txtOut('Пауза',UW/2,UH*.45,48,'#fff3d6');
 if(ptr.mouse&&ptr.in&&!drag&&!sel&&!hov&&S.phase=='play'){const wx=ptr.x+camX,wy=ptr.y+camY;let name=null;
  const e=S.enemies.find(e=>Math.abs(FX(e.x)-wx)<C*.35&&Math.abs(FY(e.y)+C*.5-wy)<C*.5);
  if(e)name=E[e.type].n+(e.arm>0?' (в тазу)':'')+(e.soak>0?' (мокрый)':'')+(e.rust>0?' (ржавый)':'');
  else{const{c,r}=cellAt(wx,wy),u=okR(r)&&unitAt(r,c);if(u)name=U[u.t].n+(u.lv>1?' · ур. '+u.lv:'')+(u.t=='laser'?' · '+u.charges+' зар.':'')+(u.t=='mine'&&u.arm>0?' · взводится':'')}
  if(name){const px=ptr.x*UK,py=ptr.y*UK;g.font='800 12px Nunito,sans-serif';const w=g.measureText(name).width+16;rr(g,px+12,py-28,w,22,7,'rgba(26,18,11,.92)');g.fillStyle='#fff3d6';g.textAlign='left';g.textBaseline='middle';g.fillText(name,px+20,py-17)}}}
// The granddaughter is the tutorial helper: she peeks in from the left of every hint.
function helperPortrait(bx,by,bh){if(!COMIC_SPRITES.granddaughter?.image.naturalWidth)return;const ph=RM?0:Math.sin(S.t*2.2),h=Math.max(120,bh+70),w=h*.66,cx=Math.max(w/2+4,bx-w*.42);
 poly(g,'#fff3d6',bx+2,by+bh*.35,bx-14,by+bh*.5,bx+2,by+bh*.62);
 g.save();g.translate(cx,by+h-8);g.scale(1-ph*.01,1+ph*.02);comicFit(g,'granddaughter',0,0,w,h);g.restore()}
function drawDragGhost(s){const k=drag&&drag.moved?drag.k:(sel&&ptr.mouse?sel:null);
 if(k&&ptr.in&&ptr.y>0){g.save();g.globalAlpha=.8;g.translate(ptr.x,ptr.y+C*.35);g.scale(s,s);
  if(U[k])drawUnit(g,{t:k,lv:1,ph:S.t,fire:0,hp:1,max:1,charges:8});else if(k=='bowl')drawBowl(g,3);else if(k=='pipe')drawHydrant(g);else if(k=='pole')drawPole(g);else if(k=='shovel')drawShovel(g);else{g.translate(0,-40);drawCar(g,k)}g.restore()}}


function canBuild(){return !!S&&(S.phase=='play'||S.phase=='prepare')}
function startBattle(){if(!S||S.phase!='prepare')return;S.phase='ready';S.rt=0;S.cool={};sel=null;S.paused=false;const b=$('#startBattle');if(b)b.hidden=true;SFX.click()}
function placementFeedback(txt){if(S)S.feedback={txt,life:1.4}}
addEventListener('pointerover',e=>{const b=e.target.closest('button');if(b&&!b.disabled&&(!e.relatedTarget||!b.contains(e.relatedTarget)))SFX.hover()});
addEventListener('pointerdown',e=>{const b=e.target.closest('button,.card');if(b&&!b.disabled)b.classList.add('is-pressed')});
const clearPress=()=>document.querySelectorAll('.is-pressed').forEach(b=>b.classList.remove('is-pressed'));
addEventListener('pointerup',clearPress);addEventListener('pointercancel',clearPress);addEventListener('blur',clearPress);
addEventListener('keydown',e=>{if(!S||$('#game').hidden||!$('#ov').hidden)return;
 if(e.key=='Escape'){sel=null;drag=null;pan=null;e.preventDefault()}
 if(e.key=='Enter'&&S.phase=='prepare'){startBattle();e.preventDefault()}
 if(/^[1-9]$/.test(e.key)&&canBuild()){const k=S.deck[+e.key-1];if(k&&usable(k)){sel=sel===k?null:k;SFX.click()}else if(k){placementFeedback('Карточка пока недоступна');SFX.bad()}}
});
