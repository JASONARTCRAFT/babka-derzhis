/* ---------- screens ---------- */
const SCREENS=['menu','levels','farm','game','cut'];
function show(id){SCREENS.forEach(s=>$('#'+s).hidden=s!==id)}
function toMenu(){S=null;sel=null;drag=null;$('#ov').hidden=true;show('menu');music('menu');updMenu()}
function updMenu(){$('#menuStat').textContent=`Побеждено зомби-котов: ${save.kills} · Мятных листиков: ${save.leaves}`;
 const n=gStored(),dry=gDry(),b=$('#farmBadge');b.hidden=!n&&!dry;b.textContent=n?'+'+n:'💧';$('#bPlay').textContent=save.lvl>0?`Играть · ур. ${save.lvl+1}`:'Играть'}
function iconKind(k){return U[k]?'u':E[k]?'e':'a'}
function renderIcon(c,kind,key){const x=c.getContext('2d'),W=c.width,H=c.height;x.clearRect(0,0,W,H);x.save();
 if(kind=='u'){x.translate(W/2+(key=='spr'?-W*.14:key=='shock'?-W*.06:0),H*.96);const s=H/(key=='fence'?102:84);x.scale(s,s);drawUnit(x,{t:key,lv:1,ph:1,fire:key=='spr'?.5:0,hp:1,max:1,charges:8,arm:0})}
 else if(kind=='e'){x.translate(W/2+W*.05,H*.95);const s=H/(key=='fat'?95:key=='kit'?50:key=='owner'?118:key=='boss'?150:78);x.scale(s,s);if(key=='boss')x.translate(12,0);drawCat(x,{type:key,ph:.8,arm:E[key].arm?1:0})}
 else{x.translate(W/2,H*.94);const s=H/80;x.scale(s,s);
  if(key=='pipe')drawHydrant(x);else if(key=='pole'){x.scale(.9,.9);drawPole(x)}else if(key=='shovel')drawShovel(x);else if(key=='bowl'){x.scale(1.3,1.3);drawBowl(x,3)}
  else{x.translate(0,-36);x.rotate(-Math.PI/2);x.scale(.62,.62);drawCar(x,key)}}
 x.restore()}
function overlay(html,btns,cls=''){const o=$('#ov');o.innerHTML=`<div class="box ${cls}">${html}<div class="row">${btns.map((b,i)=>`<button class="btn ${b[2]||''}" data-i="${i}">${b[0]}</button>`).join('')}</div></div>`;o.hidden=false;
 o.querySelectorAll('canvas[data-k]').forEach(c=>renderIcon(c,iconKind(c.dataset.k),c.dataset.k));
 o.querySelectorAll('canvas[data-g]').forEach(c=>{const x=c.getContext('2d');x.translate(c.width/2,c.height*.42);x.scale(2.4,2.4);drawGranny(x,{mood:c.dataset.g,item:'pin',wave:1})});
 o.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>{SFX.click();o.hidden=true;btns[b.dataset.i][1]()});o.querySelector('button[data-i]')?.focus();return o}

/* ---------- level select ---------- */
function openLevels(){show('levels');music('menu');const b=$('#lvlBody');b.innerHTML='';
 [['Улица Мурлыкина','День. Тихая улица, где всё началось.',0,7,''],['Ночная смена','Ночь. Призраки, роботы и кое-что похуже.',7,12,'night']].forEach(([n,d,a,z,cls])=>{
  const sec=document.createElement('section');sec.className='area '+cls;sec.innerHTML=`<h2>${n}</h2><p>${d}</p><div class="lgrid"></div>`;
  const gr=sec.querySelector('.lgrid');
  for(let i=a;i<z;i++){const l=L[i],lock=i>save.lvl,st=save.stars[i]||0,bt=document.createElement('button');bt.className='lvb';bt.disabled=lock;
   bt.innerHTML=`<b>${i+1}</b><span class="ln">${l.n}</span><small>${lock?'Пройди предыдущий уровень':l.sub}</small><div class="st">${lock?'<i>закрыто</i>':'★'.repeat(st)+'<i>'+'★'.repeat(3-st)+'</i>'}</div>`;
   bt.onclick=()=>{SFX.click();beginLevel(i)};gr.append(bt)}
  b.append(sec)});
 $('#lvAll').hidden=save.lvl>=L.length-1}
function unlockAll(){save.lvl=L.length-1;save.all=true;persist();if(!$('#levels').hidden)openLevels()}

/* ---------- pre-battle ---------- */
function preBattle(cb){const lv=S.lv,need=S.avail.length>lv.slots;
 const foes=S.types.map(t=>`<div class="foe"><canvas width="112" height="96" data-k="${t}"></canvas><span>${E[t].n}</span></div>`).join('');
 const deck=need?`<h3>Выбери ${lv.slots} карточек из ${S.avail.length}</h3><div class="deck">${S.avail.map(k=>`<button class="dc" data-c="${k}"><canvas width="92" height="76" data-k="${k}"></canvas><span>${U[k].n}</span></button>`).join('')}</div><p class="cnt" id="dcCnt"></p>`:'';
 const o=overlay(`<div class="tag">Уровень ${S.i+1}</div><h2>${lv.n}</h2><p>${lv.sub}</p>${Object.keys(S.bon).length?`<p class="leafline">Бонусы огорода: ${Object.keys(S.bon).map(k=>PLANTS[k].bonus).join(' · ')}</p>`:''}<h3>Сегодня на улице</h3><div class="foes">${foes}</div>${deck}`,
  [['В бой!',()=>{save.deck=S.deck.slice();persist();cb()}],['Уровни',()=>{toMenu();openLevels()},'alt']],'wide');
 if(need){const go=o.querySelector('button[data-i="0"]'),upd=()=>{$('#dcCnt').textContent=`Выбрано ${S.deck.length} из ${lv.slots}`;o.querySelectorAll('.dc').forEach(b=>b.classList.toggle('on',S.deck.includes(b.dataset.c)));go.disabled=!S.deck.length};
  o.querySelectorAll('.dc').forEach(b=>b.onclick=()=>{const k=b.dataset.c;if(S.deck.includes(k))S.deck=S.deck.filter(x=>x!=k);else if(S.deck.length<lv.slots)S.deck.push(k);else{SFX.bad();return}SFX.click();upd()});upd()}}

/* ---------- reveal / settings / almanac ---------- */
function openReveal(){if(!S.trophy)return;S.trophy=null;const i=S.i,stars=Math.max(1,3-S.mowUsed),first=!save.won[i];
 save.stars[i]=Math.max(save.stars[i]||0,stars);save.lvl=Math.max(save.lvl,Math.min(L.length-1,i+1));let seed=null;if(first){save.won[i]=1;save.leaves+=5;seed=SEEDREW[i]||pick(['catnip','chili','volt']);giveSeed(seed)}persist();SFX.reveal();
 const st=`<div class="stars">${'★'.repeat(stars)}<i>${'★'.repeat(3-stars)}</i></div>`,lf=first?`<p class="leafline">+5 мятных листиков и семечко «${PLANTS[seed].n}» для огорода</p>`:'';
 if(i+1<L.length){const nw=newCards(i+1),k=nw[0],d=k&&cardDef(k);
  overlay(d?`<div class="tag">Новая находка</div><h2>${d.n}</h2>${st}<canvas class="big" width="300" height="260" data-k="${k}"></canvas><p>${d.d}</p>${nw.length>1?`<p>И ещё: ${nw.slice(1).map(x=>cardDef(x).n).join(', ')}.</p>`:''}${lf}`
   :`<div class="tag">Уровень пройден</div><h2>${L[i].n}</h2>${st}<canvas class="big" width="300" height="260" data-g="angry"></canvas><p>Дальше: «${L[i+1].n}». ${L[i+1].sub}</p>${lf}`,
   [['Дальше',()=>perkThen(i,()=>beginLevel(i+1))],['Уровни',()=>perkThen(i,()=>{toMenu();openLevels()}),'alt']])}
 else overlay(`<div class="tag">Финал</div><h2>Улица Мурлыкина спасена!</h2>${st}<canvas class="big" width="300" height="260" data-g="calm"></canvas><p>Король Пылесосов повержен. Бабка ставит чайник, коты спят кучей на диване. Побеждено зомби-котов: ${save.kills}.</p>${lf}`,[['В меню',toMenu]])}
function perkThen(i,next){const set=PERKSETS[i];save.perkAsk=save.perkAsk||{};if(!set||save.perkAsk[i])return next();save.perkAsk[i]=1;persist();SFX.fanfare();
 overlay(`<div class="tag">Бабкина премия</div><h2>Выбери одно улучшение</h2><p>Оно останется с тобой до конца игры.</p><div class="perks">${set.map(k=>`<div class="pk"><b>${PERKS[k].n}</b><span>${PERKS[k].d}</span></div>`).join('')}</div>`,
  set.map(k=>[PERKS[k].n,()=>{save.perks[k]=1;persist();SFX.reveal();next()}]),'wide')}
function openSettings(){const s=save.set,wasPlay=S&&S.phase=='play'&&!S.paused;if(wasPlay)S.paused=true;
 const o=overlay(`<h2>Настройки</h2>
 <div class="set-row"><label for="sMusOn">Музыка</label><input type="checkbox" id="sMusOn" ${s.musicOn?'checked':''}><input type="range" id="sMus" min="0" max="1" step="0.05" value="${s.music}" aria-label="Громкость музыки"></div>
 <div class="set-row"><label for="sSfxOn">Звуки</label><input type="checkbox" id="sSfxOn" ${s.sfxOn?'checked':''}><input type="range" id="sSfx" min="0" max="1" step="0.05" value="${s.sfx}" aria-label="Громкость звуков"></div>
 <div class="row col"><button class="btn alt" id="sAll">${save.lvl>=L.length-1?'Все уровни открыты':'Открыть все уровни'}</button><button class="btn alt" id="sIntro">Посмотреть заставку</button><button class="btn danger" id="sReset">Сбросить прогресс</button></div>`,
  [['Готово',()=>{if(wasPlay&&S)S.paused=false}]]);
 const upd=()=>{s.musicOn=$('#sMusOn').checked;s.sfxOn=$('#sSfxOn').checked;s.music=+$('#sMus').value;s.sfx=+$('#sSfx').value;applyVol();persist()};
 ['#sMusOn','#sSfxOn','#sMus','#sSfx'].forEach(q=>$(q).addEventListener('input',upd));
 $('#sAll').onclick=()=>{unlockAll();$('#sAll').textContent='Все уровни открыты';SFX.reveal()};
 $('#sIntro').onclick=()=>{o.hidden=true;S=null;playCut(toMenu)};
 let armed=false;$('#sReset').onclick=()=>{if(!armed){armed=true;$('#sReset').textContent='Точно сбросить? Нажми ещё раз';return}
  const set=save.set;save=JSON.parse(JSON.stringify(DEF));save.set=set;persist();$('#sReset').textContent='Прогресс сброшен';if(!$('#menu').hidden)updMenu()}}
function openAlmanac(){const top=L[save.lvl],have=new Set([...top.cards,...top.ab,...(top.shovel?['shovel']:[]),...(save.shop.mine?['mine']:[])]);
 const item=(k,d,lock,extra='')=>`<div class="ai ${lock?'lock':''}"><canvas width="112" height="96" ${lock?'':`data-k="${k}"`}></canvas><div><b>${lock?'???':d.n}</b>${lock?'Откроется позже.':extra+d.d}</div></div>`;
 overlay(`<h2>Альманах</h2><h3>Бабкина защита</h3><div class="ag">${[...Object.keys(U),...Object.keys(A),'shovel'].map(k=>{const d=cardDef(k);return item(k,d,!have.has(k),d.cost?`Цена ${d.cost}. `:'')}).join('')}</div>
 <h3>Зомби-коты</h3><div class="ag">${Object.keys(E).map(k=>item(k,E[k],!save.seen[k])).join('')}</div>`,[['Закрыть',()=>{}]],'alm')}

/* ---------- canvas helpers ---------- */
function fitCanvas(c){const d=Math.min(2,devicePixelRatio||1),w=c.clientWidth||innerWidth,h=c.clientHeight||innerHeight;if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x,W:w,H:h}}
function cover(W,H,fx=.5){const s=Math.max(W/1280,H/720);return{s,ox:(W-1280*s)*fx,oy:(H-720*s)*.5}}

/* ---------- petting cats ---------- */
const PETS={};let lastPurr=0;
function petState(id){return PETS[id]||(PETS[id]={last:-1e9,r:0})}
function petReact(id,kind){const p=petState(id),n=performance.now();if(n-p.last<60000){if(n-lastPurr>900){lastPurr=n;SFX.purr()}return}p.last=n;p.r=1;
 if(kind=='sleep')SFX.meowGrumpy();else SFX.meowHappy()}
function petTick(dt){for(const k in PETS)if(PETS[k].r>0)PETS[k].r=Math.max(0,PETS[k].r-dt/2.4)}
function petProg(id){const r=petState(id).r;return r>0?1-r:0}
function petBubble(x,id,cx,cy,kind){const r=petState(id).r;if(r<=0)return;const a=Math.min(1,r*4);x.globalAlpha=a;const txt=kind=='sleep'?'мрр…':'Мяу!';
 x.font='900 22px Nunito,sans-serif';const w=x.measureText(txt).width+22;rr(x,cx-w/2,cy-32,w,32,14,'#fff');poly(x,'#fff',cx-6,cy,cx+6,cy,cx,cy+10);x.fillStyle='#3a2210';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,cx,cy-16);
 if(kind!='sleep')for(let i=0;i<3;i++){const q=(1-r+i*.2)%1;el(x,cx+30+i*12,cy-10-q*40,5,5,'#ff6f91');el(x,cx+36+i*12,cy-10-q*40,5,5,'#ff6f91');poly(x,'#ff6f91',cx+25+i*12,cy-8-q*40,cx+41+i*12,cy-8-q*40,cx+33+i*12,cy+2-q*40)}
 x.globalAlpha=1}
/* ---------- main menu scene ---------- */
const MENU={hot:[],t:0,ff:Array.from({length:14},(_,i)=>({x:Math.random()*1280,y:420+Math.random()*250,p:Math.random()*6}))};
function drawMenu(dt){MENU.t+=dt;petTick(dt);const{x,W,H}=fitCanvas($('#menuCv')),c=cover(W,H,W<720?.22:.5);MENU.c=c;x.clearRect(0,0,W,H);x.save();x.translate(c.ox,c.oy);x.scale(c.s,c.s);menuScene(x,MENU.t);x.restore()}
$('#menuCv').addEventListener('pointerdown',e=>{const c=MENU.c;if(!c)return;const r=$('#menuCv').getBoundingClientRect(),px=(e.clientX-r.left-c.ox)/c.s,py=(e.clientY-r.top-c.oy)/c.s;
 [['mRoof',590,262,46,'sleep'],['mWin',480,450,48,'nice'],['mPorch',270,570,46,'nice']].forEach(([id,cx,cy,rad,k])=>{if(Math.hypot(px-cx,py-cy)<rad)petReact(id,k)})});
function menuScene(x,t){
 x.fillStyle=lgrad(x,0,0,0,480,[[0,'#2b1d4e'],[.55,'#a24b6a'],[1,'#f3a65f']]);x.fillRect(0,0,1280,480);
 el(x,980,470,150,150,'rgba(255,207,107,.25)');el(x,980,470,105,105,'#ffcf6b');
 for(let i=0;i<4;i++){const cx=((i*340+t*8)%1600)-160,cy=80+i*42;x.globalAlpha=.45;el(x,cx,cy,90,16,'#f7c6a3');el(x,cx+40,cy-10,50,14,'#f7c6a3');x.globalAlpha=1}
 const R=rng(7);for(let i=0;i<22;i++){const bx=i*62-10,bh=80+R()*130,by=470-bh;x.fillStyle='#3d2a57';x.fillRect(bx,by,58,bh+10);
  for(let w=0;w<6;w++)if(R()<.4){x.fillStyle='rgba(255,224,138,.6)';x.fillRect(bx+8+(w%3)*16,by+14+(w/3|0)*22,7,9)}
  if(i%6==3){const cx=bx+30,cy=by;poly(x,'#21152e',cx-10,cy-4,cx-12,cy-22,cx-4,cy-14);poly(x,'#21152e',cx+10,cy-4,cx+12,cy-22,cx+4,cy-14);el(x,cx,cy-8,12,10,'#21152e');el(x,cx+4,cy+6,10,12,'#21152e');
   if(Math.sin(t*1.3+i)>-.85){el(x,cx-4,cy-9,2.2,2.2,'#c6ff4d');el(x,cx+4,cy-9,2.2,2.2,'#c6ff4d')}}}
 x.fillStyle=lgrad(x,0,470,0,720,[[0,'#4f8f2c'],[1,'#2a5617']]);x.fillRect(0,470,1280,250);
 poly(x,'#c9a66b',340,585,410,585,500,720,250,720);
 menuHouse(x,t);
 for(let i=0;i<40;i++){const fx=i*34-10;if(fx>290&&fx<470)continue;rr(x,fx,606,22,70,4,'#f5efe2');poly(x,'#f5efe2',fx,606,fx+11,594,fx+22,606)}
 [624,654].forEach(y=>{rr(x,0,y,292,9,2,'#e0d7c4');rr(x,470,y,810,9,2,'#e0d7c4')});
 rr(x,520,560,8,60,2,'#6d4c41');rr(x,500,528,48,34,10,'#1e88e5');poly(x,'#e53935',546,532,560,528,560,546,546,546);x.fillStyle='#fff';x.font='bold 11px Nunito,sans-serif';x.textAlign='center';x.fillText('ЗИНА',524,552);
 const pk=Math.max(0,Math.sin(t*.7-1)),py=630-pk*46;x.save();x.beginPath();x.rect(960,480,260,160);x.clip();x.save();x.translate(1100,py);x.scale(1.5,1.5);
 poly(x,'#a3b18a',-13,-4,-11,-19,-3,-11);poly(x,'#a3b18a',13,-4,10,-19,2,-11);el(x,0,0,14,13,'#a3b18a');el(x,-5,-1,5,5.5,'#f4ffd0');el(x,-6,-1,2,2.5,'#111');ln(x,'#3a4a2e',2,2,-3,7,1);ln(x,'#3a4a2e',2,2,1,7,-3);x.restore();x.restore();
 el(x,1100,650,130,52,'#2f6a1f');el(x,1030,628,62,42,'#3f8a2a');el(x,1160,622,74,48,'#3f8a2a');el(x,1100,610,60,40,'#46962f');[[1060,615],[1140,600],[1180,640]].forEach(([a,b])=>el(x,a,b,5,5,'#f48fb1'));
 MENU.ff.forEach(f=>{f.p+=.02;const a=.5+.5*Math.sin(f.p*3);x.globalAlpha=a;el(x,f.x+Math.sin(f.p)*20,f.y+Math.cos(f.p*.7)*12,3,3,'#fff59d');el(x,f.x+Math.sin(f.p)*20,f.y+Math.cos(f.p*.7)*12,8,8,'rgba(255,245,157,.25)');x.globalAlpha=1})}
function menuHouse(x,t){
 poly(x,'#cfae7e',560,330,690,290,690,545,560,585);for(let y=300;y<580;y+=14)ln(x,'rgba(120,80,40,.15)',1.5,560,y+40,690,y);
 rr(x,170,330,390,255,0,'#f3dcb2');for(let y=340;y<585;y+=14){x.fillStyle='rgba(150,100,50,.14)';x.fillRect(170,y,390,1.5)}
 poly(x,'#8f2e22',365,165,580,340,700,298,485,128);for(let i=1;i<8;i++){const q=i/8;ln(x,'rgba(0,0,0,.15)',2,lerp(365,580,q),lerp(165,340,q),lerp(485,700,q),lerp(128,298,q))}
 poly(x,'#b23a2a',145,345,365,160,585,345);for(let i=1;i<7;i++){const y=165+i*27,hw=(y-160)/185*220;ln(x,'rgba(0,0,0,.12)',2,365-hw,y,365+hw,y)}
 rr(x,470,150,40,90,3,'#795548');rr(x,464,144,52,12,2,'#5d4037');
 for(let i=0;i<4;i++){const q=(t*.25+i*.25)%1;x.globalAlpha=.55*(1-q);el(x,490+Math.sin(q*6+i)*14,140-q*120,12+q*26,10+q*20,'#e0e0e0');x.globalAlpha=1}
 el(x,365,272,28,28,'#fff');el(x,365,272,23,23,'#ffe08a');ln(x,'#fff',3,342,272,388,272);ln(x,'#fff',3,365,249,365,295);
 const win=(wx,wy,ww,wh,fill)=>{rr(x,wx-6,wy-6,ww+12,wh+12,4,'#fff');rr(x,wx,wy,ww,wh,3,'#ffe9b0');x.save();x.beginPath();x.rect(wx,wy,ww,wh);x.clip();fill();x.restore();
  poly(x,'#ef9a9a',wx,wy,wx+ww*.35,wy,wx,wy+wh*.65);poly(x,'#ef9a9a',wx+ww,wy,wx+ww*.65,wy,wx+ww,wy+wh*.65);rr(x,wx-10,wy+wh+4,ww+20,12,3,'#8d5524');[.2,.4,.6,.8].forEach(q=>el(x,wx+ww*q,wy+wh+2,7,7,q==.4?'#ffeb3b':'#e91e63'))};
 win(196,380,118,104,()=>{x.translate(255,450);x.scale(1.75,1.75);drawGranny(x,{mood:'angry',item:'pin',wave:t*3.4})});
 win(420,380,118,104,()=>{x.translate(480,490);x.scale(1.55,1.55);niceCat(x,'#9e9e9e',{ph:t,blink:1,react:petProg('mWin')})});petBubble(x,'mWin',480,400,'nice');
 rr(x,322,440,86,145,6,'#5d4037');rr(x,330,448,70,137,4,'#2e7d32');el(x,365,480,14,14,'#bbdefb');ring(x,365,480,14,'#1b5e20',3);el(x,388,520,4,4,'#ffd54f');
 poly(x,'#8f2e22',300,440,430,440,446,420,284,420);rr(x,300,585,130,10,2,'#9e9e9e');rr(x,290,595,150,10,2,'#bdbdbd');
 x.save();x.translate(612,282);x.rotate(-.3);x.scale(1.4,1.4);sleepyCat(x,'#f0a04b',t*2,petProg('mRoof'));x.restore();petBubble(x,'mRoof',590,235,'sleep');
 x.save();x.translate(270,600);x.scale(1.5,1.5);niceCat(x,'#5d4037',{ph:t*1.2,blink:1,react:petProg('mPorch')});x.restore();petBubble(x,'mPorch',270,520,'nice')}

/* ---------- intro cutscene ---------- */
const CUT={t:0,i:0,after:null};
const SCENES=[
 {d:6,cap:'Тихий городок. Бабушка Зина вяжет носки своим двенадцати котам.',draw:sceneHome},
 {d:6,cap:'Но однажды из подвалов полезли зомби-коты. Соседи бежали кто куда.',draw:sceneStreet},
 {d:4.5,cap:'Бабка посмотрела в окно, поправила очки и сказала: «Ну уж нет».',draw:sceneAngry},
 {d:6,cap:'Коты у бабки умные. За ночь они собрали защиту из всего, что нашлось в сарае.',draw:sceneBuild},
 {d:4.5,cap:'',draw:sceneTitle}];
function playCut(after){CUT.t=0;CUT.i=0;CUT.after=after;show('cut');stopMusic();music('menu');$('#cap').textContent=SCENES[0].cap;$('#cap').hidden=false;save.intro=true;persist()}
function endCut(){MUS.force=null;const a=CUT.after;CUT.after=null;(a||toMenu)()}
$('#skip').onclick=()=>{SFX.click();endCut()};
$('#cut').addEventListener('pointerdown',e=>{if(e.target.id=='skip')return;if(CUT.i==SCENES.length-1&&CUT.t>1.5)endCut();else{CUT.t=SCENES[CUT.i].d}});
function drawCut(dt){CUT.t+=dt;let sc=SCENES[CUT.i];if(CUT.t>sc.d){if(CUT.i<SCENES.length-1){CUT.i++;CUT.t=0;sc=SCENES[CUT.i];$('#cap').textContent=sc.cap;$('#cap').hidden=!sc.cap;
  if(CUT.i==1){music('day');MUS.force=1;MUS.I=.8}if(CUT.i==2){SFX.sting();MUS.force=.45}if(CUT.i==3)MUS.force=.25;if(CUT.i==4){MUS.force=null;stopMusic();SFX.fanfare();setTimeout(()=>{if(!$('#cut').hidden)music('menu')},1600)}}else{CUT.t=sc.d}}
 const{x,W,H}=fitCanvas($('#cutCv')),c=cover(W,H*.82,.5),p=CUT.t/sc.d,z=1+p*.05;c.oy=Math.min(c.oy,0);x.fillStyle='#000';x.fillRect(0,0,W,H);
 x.save();x.translate(W/2,H/2);x.scale(z,z);x.translate(-W/2,-H/2);x.translate(c.ox,c.oy);x.scale(c.s,c.s);sc.draw(x,CUT.t,p);x.restore();
 const fa=Math.max(0,1-CUT.t/.45);if(fa>0){x.fillStyle=`rgba(0,0,0,${fa})`;x.fillRect(0,0,W,H)}}
function sceneHome(x,t){x.fillStyle='#f6e3c4';x.fillRect(0,0,1280,720);for(let i=0;i<32;i++){x.fillStyle=i%2?'rgba(233,150,160,.25)':'rgba(255,255,255,.15)';x.fillRect(i*40,0,20,520)}
 x.fillStyle='#a1673a';x.fillRect(0,520,1280,200);for(let i=0;i<10;i++)ln(x,'#8a5530',2,0,540+i*20,1280,540+i*20);
 rr(x,820,120,320,260,8,'#fff');rr(x,836,136,288,228,4,lgrad(x,0,136,0,364,[[0,'#90caf9'],[1,'#e3f2fd']]));
 for(let i=0;i<4;i++)rr(x,850+i*70,280-i%2*30,60,90,2,['#e8a87c','#a8d5a2','#9fc5e8','#f4d06f'][i]);ln(x,'#fff',6,980,136,980,364);ln(x,'#fff',6,836,250,1124,250);
 rr(x,180,150,120,150,6,'#8d5524');rr(x,192,162,96,126,4,'#ffe0b2');x.save();x.translate(240,262);x.scale(1.6,1.6);niceCat(x,'#f0a04b',{ph:0});x.restore();
 rr(x,300,330,360,240,40,'#c62828');rr(x,330,300,300,120,40,'#e53935');rr(x,280,420,60,170,20,'#b71c1c');rr(x,620,420,60,170,20,'#b71c1c');
 x.save();x.translate(480,420);x.scale(3.2,3.2);drawGranny(x,{mood:'calm',item:'knit'});x.restore();
 el(x,640,640,240,40,'#7b1fa2');x.save();x.translate(560,650);x.scale(2.6,2.6);sleepyCat(x,'#9e9e9e',t*2);x.restore();
 x.save();x.translate(780,650);x.scale(2.4,2.4);niceCat(x,'#5d4037',{ph:t,blink:1});x.restore();
 const bx=1000+Math.sin(t*1.5)*60;el(x,bx,640,18,18,'#26a69a');x.save();x.translate(bx+60,650);x.scale(1.8,1.8);niceCat(x,'#ffcc80',{ph:t*2});x.restore()}
function sceneStreet(x,t){x.fillStyle=lgrad(x,0,0,0,720,[[0,'#3a2a5e'],[.6,'#c2616b'],[1,'#f2a65a']]);x.fillRect(0,0,1280,720);el(x,1050,140,50,50,'#fff3c4');
 for(let i=0;i<9;i++){const h=180+(i*53%120);rr(x,i*150-20,560-h,140,h,0,['#4a3466','#3d2a57','#55407a'][i%3]);for(let w=0;w<4;w++)if((i+w)%3)rr(x,i*150+(w%2)*60,600-h+(w>>1)*60-30,30,34,2,'rgba(255,224,138,.7)')}
 x.fillStyle='#55565e';x.fillRect(0,560,1280,160);ln(x,'#fff',4,0,640,1280,640);
 const px=1300-t*230;x.save();x.translate(px,620);x.scale(-2.4,2.4);drawPerson(x,{ph:t*14,run:1,panic:1,coat:'#5c6bc0'});x.restore();
 if(px>-200&&px<1280){x.globalAlpha=.85;x.fillStyle='#fff';x.font='900 40px "Lilita One",sans-serif';x.textAlign='center';x.fillText('А-А-А!',px,420+Math.sin(t*20)*4);x.globalAlpha=1}
 ['cat','fat','kit','cat'].forEach((ty,k)=>{const cx=px+260+k*120;x.save();x.translate(cx,630+k%2*20);x.scale(2.2,2.2);drawCat(x,{type:ty,ph:t*10+k});x.restore()});
 if((t*2|0)%2){x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=8;x.lineCap='round';for(let i=0;i<3;i++){x.beginPath();x.moveTo(140+i*36,60);x.lineTo(90+i*36,220);x.stroke()}}
 x.lineWidth=40;x.strokeStyle='#5d4037';x.strokeRect(20,20,1240,680)}
function sceneAngry(x,t){x.fillStyle=rgrad(x,640,360,40,800,[[0,'#ffb74d'],[1,'#b71c1c']]);x.fillRect(0,0,1280,720);
 x.save();x.translate(640,360);x.rotate(t*.2);for(let i=0;i<24;i++){x.rotate(Math.PI/12);poly(x,'rgba(255,255,255,.08)',0,0,900,-60,900,60)}x.restore();
 x.save();x.translate(640,380+Math.sin(t*8)*3);x.scale(7.5,7.5);drawGranny(x,{mood:'angry',item:'pin',wave:t*4});x.restore();
 if(t>1.2){const a=Math.min(1,(t-1.2)*3);x.globalAlpha=a;sparkle(x,560,360,40*a,'#fff');sparkle(x,720,360,30*a,'#fff');x.globalAlpha=1}}
function sceneBuild(x,t){x.fillStyle='#6d4c41';x.fillRect(0,0,1280,720);for(let i=0;i<20;i++)ln(x,'#5d4037',3,i*70,0,i*70,720);
 rr(x,820,80,320,230,6,'#1e5aa8');x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2;x.strokeRect(840,100,280,190);x.save();x.translate(980,260);x.scale(1.8,1.8);x.globalAlpha=.7;drawShock(x,1,0,t);x.restore();
 x.fillStyle='#fff';x.font='bold 18px Nunito,sans-serif';x.textAlign='left';x.fillText('ПЛАН «ОТПОР»',850,124);
 rr(x,80,520,1120,40,6,'#8d5524');x.fillStyle='#4e342e';x.fillRect(0,560,1280,160);
 [[260,'wheel'],[520,'ball'],[780,'spr'],[1020,'shock']].forEach(([px,ty],k)=>{const show=t>k*1.1;if(!show)return;const pop=Math.min(1,(t-k*1.1)*3);x.save();x.translate(px,520);x.scale(2.6*pop,2.6*pop);drawUnit(x,{t:ty,lv:1,ph:t,fire:ty=='spr'?.6:0,hp:1,max:1});x.restore();
  if(t-k*1.1<.6)for(let i=0;i<6;i++)sparkle(x,px+Math.cos(i+t*10)*60,440+Math.sin(i*2+t*10)*60,10,'#fff59d')});
 [[160,'#f0a04b'],[420,'#9e9e9e'],[680,'#5d4037'],[1120,'#ffcc80']].forEach(([cx,col],k)=>{x.save();x.translate(cx,690);x.scale(2.2,2.2);niceCat(x,col,{ph:t*2+k,blink:1});x.restore();
  x.save();x.translate(cx+24,640);x.rotate(Math.sin(t*10+k)*.5);rr(x,-3,-22,6,24,2,'#9e9e9e');rr(x,-8,-28,16,8,3,'#757575');x.restore()})}
function sceneTitle(x,t){x.fillStyle=lgrad(x,0,0,0,720,[[0,'#2b1d4e'],[.6,'#a24b6a'],[1,'#f3a65f']]);x.fillRect(0,0,1280,720);
 x.fillStyle='#3a6b24';x.fillRect(0,520,1280,200);
 for(let i=0;i<6;i++){const cx=1300-i*60+Math.sin(t+i)*8,cy=560+(i%3)*40;el(x,cx,cy,22,18,'#1e1430');poly(x,'#1e1430',cx-16,cy-6,cx-14,cy-30,cx-4,cy-16);poly(x,'#1e1430',cx+16,cy-6,cx+14,cy-30,cx+4,cy-16);el(x,cx-6,cy-4,3,3,'#c6ff4d');el(x,cx+6,cy-4,3,3,'#c6ff4d')}
 x.save();x.translate(420,520);x.scale(4.2,4.2);drawGranny(x,{mood:'angry',item:'pin',wave:t*5});x.restore();
 [[230,'#f0a04b'],[600,'#9e9e9e'],[700,'#5d4037']].forEach(([cx,col],k)=>{x.save();x.translate(cx,690);x.scale(2.6,2.6);niceCat(x,col,{ph:t*2+k,blink:1});x.restore()});
 const b=Math.min(1,t*1.6),sc=1+Math.sin(Math.min(1,t*1.6)*Math.PI)*.15;x.save();x.translate(840,200);x.scale(sc*b,sc*b);x.rotate(-.04);
 x.font='110px "Lilita One",Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=20;x.strokeStyle='#7a2a10';x.strokeText('Бабка,',0,-60);x.strokeText('держись!',0,60);
 x.fillStyle='#ffcf3f';x.fillText('Бабка,',0,-60);x.fillText('держись!',0,60);x.restore();
 if(t>1.5){x.globalAlpha=.6+.4*Math.sin(t*4);x.fillStyle='#fff3d6';x.font='800 28px Nunito,sans-serif';x.textAlign='center';x.fillText('Нажми, чтобы начать',840,360);x.globalAlpha=1}}

/* ---------- wiring & main loop ---------- */
$('#bPlay').onclick=()=>{SFX.click();if(!save.intro)playCut(()=>beginLevel(save.lvl));else beginLevel(save.lvl)};
$('#bLevels').onclick=()=>{SFX.click();openLevels()};$('#bFarm').onclick=()=>{SFX.click();openFarm()};
$('#bAlm').onclick=()=>{SFX.click();openAlmanac()};$('#bSet').onclick=()=>{SFX.click();openSettings()};$('#bIntro').onclick=()=>{SFX.click();playCut(toMenu)};
$('#lvBack').onclick=()=>{SFX.click();toMenu()};$('#lvAll').onclick=()=>{SFX.click();unlockAll();SFX.reveal()};$('#fBack').onclick=()=>{SFX.click();toMenu()};
let last=performance.now(),menuTick=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!$('#game').hidden&&S){
  if(S.phase=='intro'){if($('#ov').hidden)intro(dt)}else if(S.phase=='ready'){S.rt+=dt;if(S.rt>2.3)S.phase='play'}
  else if(!S.paused&&$('#ov').hidden&&(S.phase=='play'||S.phase=='won'))for(let i=0;i<S.speed;i++)step(dt);
  if(drag&&drag.moved&&ptr.in){if(ptr.x>VW-50)camX=clamp(camX+C*8*dt,0,maxCam());if(ptr.x<50)camX=clamp(camX-C*8*dt,0,maxCam())}
  draw();updBar()}
 else if(!$('#menu').hidden){drawMenu(dt);if((menuTick+=dt)>1){menuTick=0;updMenu()}}
 else if(!$('#farm').hidden)drawFarm(dt);
 else if(!$('#cut').hidden)drawCut(dt);
 requestAnimationFrame(loop)}
toMenu();requestAnimationFrame(loop);
