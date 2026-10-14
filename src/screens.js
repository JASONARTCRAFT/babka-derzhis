/* ---------- screens ---------- */
const SCREENS=['menu','levels','farm','game','cut'];
function show(id){SCREENS.forEach(s=>$('#'+s).hidden=s!==id)}
function toMenu(){S=null;sel=null;drag=null;$('#ov').hidden=true;show('menu');music('menu');updMenu()}
function updMenu(){$('#menuStat').textContent=`Побеждено зомби-котов: ${save.kills} · Мятных листиков: ${save.leaves}`;
 const n=gStored(),dry=gDry(),b=$('#farmBadge');b.hidden=!n&&!dry;b.textContent=n?'+'+n:'💧';$('#bPlay').textContent=save.lvl>0?`Играть · ур. ${save.lvl+1}`:'Играть'}
function iconKind(k){return U[k]?'u':E[k]?'e':'a'}
const ICON_ART={pipe:'hydrant',pole:'pole',bowl:'bowl',taxi:'taxi',truck:'truck',shovel:'shovel'};
function renderIcon(c,kind,key){const sprite=kind=='u'?unitKey(key,1):kind=='e'?(hasSprite('zombie-'+key)?'zombie-'+key:!['robo','owner','boss','box','ghost'].includes(key)?'zombie-cat':null):hasSprite(ICON_ART[key])?ICON_ART[key]:null;
 if(sprite&&COMIC_SPRITES[sprite]?.image.naturalWidth){const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);comicFit(x,sprite,c.width/2,c.height*.94,c.width*.9,c.height*.88);return;}const x=c.getContext('2d'),W=c.width,H=c.height;x.clearRect(0,0,W,H);x.save();
 if(kind=='u'){x.translate(W/2+(key=='spr'?-W*.14:key=='shock'?-W*.06:0),H*.96);const s=H/(key=='fence'?102:84);x.scale(s,s);drawUnit(x,{t:key,lv:1,ph:1,fire:key=='spr'?.5:0,hp:1,max:1,charges:8,arm:0})}
 else if(kind=='e'){x.translate(W/2+W*.05,H*.95);const s=H/(key=='fat'?95:key=='kit'?50:key=='owner'?118:key=='boss'?150:78);x.scale(s,s);if(key=='boss')x.translate(12,0);drawCat(x,{type:key,ph:.8,arm:E[key].arm?1:0})}
 else{x.translate(W/2,H*.94);const s=H/80;x.scale(s,s);
  if(key=='pipe')drawHydrant(x);else if(key=='pole'){x.scale(.9,.9);drawPole(x)}else if(key=='shovel')drawShovel(x);else if(key=='bowl'){x.scale(1.3,1.3);drawBowl(x,3)}
  else{x.translate(0,-36);x.rotate(-Math.PI/2);x.scale(.62,.62);drawCar(x,key)}}
 x.restore()}
function overlay(html,btns,cls=''){const o=$('#ov');o.innerHTML=`<div class="box ${cls}">${html}<div class="row">${btns.map((b,i)=>`<button class="btn ${b[2]||''}" data-i="${i}">${b[0]}</button>`).join('')}</div></div>`;o.hidden=false;
 o.querySelectorAll('canvas[data-k]').forEach(c=>renderIcon(c,iconKind(c.dataset.k),c.dataset.k));
 o.querySelectorAll('canvas[data-gd]').forEach(c=>{const x=c.getContext('2d');comicFit(x,hasSprite('granddaughter-give')?'granddaughter-give':'granddaughter',c.width/2,c.height*.98,c.width*.95,c.height*.95)});
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
  overlay(d?`<div class="tag">Награда за уровень</div><h2>${d.n}</h2>${st}<div class="gift"><canvas class="gd" width="180" height="270" data-gd="1"></canvas><div class="say"><p class="bubble">Бабуль, смотри, что я собрала! Держи — «${d.n}».</p><canvas class="big" width="300" height="260" data-k="${k}"></canvas></div></div><p>${d.d}</p>${nw.length>1?`<p>И ещё: ${nw.slice(1).map(x=>cardDef(x).n).join(', ')}.</p>`:''}${lf}`
   :`<div class="tag">Уровень пройден</div><h2>${L[i].n}</h2>${st}<canvas class="big" width="300" height="260" data-g="angry"></canvas><p>Дальше: «${L[i+1].n}». ${L[i+1].sub}</p>${lf}`,
   [['Дальше',()=>perkThen(i,()=>beginLevel(i+1))],['Уровни',()=>perkThen(i,()=>{toMenu();openLevels()}),'alt']])}
 else overlay(`<div class="tag">Финал</div><h2>Улица Мурлыкина спасена!</h2>${st}<canvas class="big" width="300" height="260" data-g="calm"></canvas><p>Король Пылесосов повержен. Бабка ставит чайник, коты спят кучей на диване. Побеждено зомби-котов: ${save.kills}.</p>${lf}`,[['В меню',toMenu]])}
function perkThen(i,nextAfter){const next=()=>bpThen(i,nextAfter),set=PERKSETS[i];save.perkAsk=save.perkAsk||{};if(!set||save.perkAsk[i])return next();save.perkAsk[i]=1;persist();SFX.fanfare();
 overlay(`<div class="tag">Бабкина премия</div><h2>Выбери одно улучшение</h2><p>Оно останется с тобой до конца игры.</p><div class="perks">${set.map(k=>`<div class="pk"><b>${PERKS[k].n}</b><span>${PERKS[k].d}</span></div>`).join('')}</div>`,
  set.map(k=>[PERKS[k].n,()=>{save.perks[k]=1;persist();SFX.reveal();next()}]),'wide')}
function openSettings(){const s=save.set,wasPlay=S&&S.phase=='play'&&!S.paused;if(wasPlay){S.paused=true;S.resumeAfterSettings=true}
 const o=overlay(`<h2>Настройки</h2>
 <div class="set-row"><label for="sMusOn">Музыка</label><input type="checkbox" id="sMusOn" ${s.musicOn?'checked':''}><input type="range" id="sMus" min="0" max="1" step="0.05" value="${s.music}" aria-label="Громкость музыки"></div>
 <div class="set-row"><label for="sSfxOn">Звуки</label><input type="checkbox" id="sSfxOn" ${s.sfxOn?'checked':''}><input type="range" id="sSfx" min="0" max="1" step="0.05" value="${s.sfx}" aria-label="Громкость звуков"></div>
 <div class="row col"><button class="btn alt" id="sAll">${save.lvl>=L.length-1?'Все уровни открыты':'Открыть все уровни'}</button><button class="btn alt" id="sIntro">Посмотреть заставку</button><button class="btn alt" id="sCredits">Звуки и авторы</button><button class="btn danger" id="sReset">Сбросить прогресс</button></div>`,
  [['Готово',()=>{if(S&&(wasPlay||S.resumeAfterSettings)){S.paused=false;S.resumeAfterSettings=false}}]]);
 const upd=()=>{s.musicOn=$('#sMusOn').checked;s.sfxOn=$('#sSfxOn').checked;s.music=+$('#sMus').value;s.sfx=+$('#sSfx').value;applyVol();persist()};
 ['#sMusOn','#sSfxOn','#sMus','#sSfx'].forEach(q=>$(q).addEventListener('input',upd));
 $('#sAll').onclick=()=>{unlockAll();$('#sAll').textContent='Все уровни открыты';SFX.reveal()};
 $('#sIntro').onclick=()=>{o.hidden=true;S=null;playCut(toMenu)};
 $('#sCredits').onclick=showAudioCredits;
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
/* ---------- intro cutscene ---------- */
const CUT={t:0,i:0,after:null};
const SCENES=[
 {d:6,cap:'Тихий городок. Бабушка Зина вяжет носки своим двенадцати котам.',draw:sceneHome},
 {d:6,cap:'Но однажды из подвалов полезли зомби-коты. Соседи бежали кто куда.',draw:sceneStreet},
 {d:4.5,cap:'Бабка посмотрела в окно, поправила очки и сказала: «Ну уж нет».',draw:sceneAngry},
 {d:8,cap:'Внучка-кошкодевочка вместе с котами за ночь построила все девять устройств из того, что нашлось в сарае.',draw:sceneBuild},
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
function sceneBuild(x,t){
 x.fillStyle='#e7d3b4';x.fillRect(0,0,1280,720);
 for(let i=0;i<18;i++)ln(x,'rgba(108,71,61,.16)',2,i*76,0,i*76,720);
 rr(x,45,60,460,240,6,'#fff2da');x.strokeStyle='#352a30';x.lineWidth=4;x.strokeRect(45,60,460,240);
 x.fillStyle='#352a30';x.font='700 28px Oswald,Impact,sans-serif';x.textAlign='center';x.fillText('ПЛАН «ОТПОР»',275,104);
 [['wheel',140],['ball',275],['shock',410]].forEach(([k,cx])=>{x.save();x.translate(cx,260);x.scale(1.7,1.7);drawUnit(x,{t:k,lv:1,ph:t,fire:0,hp:1,max:1});x.restore()});
 rr(x,655,310,490,44,6,'#92604e');rr(x,690,350,24,250,3,'#684639');rr(x,1080,350,24,250,3,'#684639');
 // Granddaughter actively assembles the launcher, her wrench hand rocks while tightening.
 x.save();x.translate(640,590);x.rotate(Math.sin(t*5)*.018);comicFit(x,'granddaughter',0,0,275,465);x.restore();
 x.save();x.translate(800,310);x.scale(2,2);drawUnit(x,{t:'ball',lv:1,ph:t,fire:(Math.sin(t*6)>0?.08:0),hp:1,max:1});x.restore();
 x.save();x.translate(1060,300);x.scale(1.6,1.6);niceCat(x,'#f0a04b',{ph:t*2,blink:1});x.restore();
 x.save();x.translate(1065,240);x.rotate(Math.sin(t*8)*.18);rr(x,-4,-20,8,25,2,'#707477');rr(x,-13,-28,26,10,2,'#4e4c52');x.restore();
 // Other cats bring parts to the workbench.
 [['#9e9e9e',350],['#5d4037',930]].forEach(([fur,cx],i)=>{x.save();x.translate(cx+Math.sin(t*2+i)*12,570);x.scale(2,2);niceCat(x,fur,{ph:t*3,blink:1});rr(x,8,-33,20,14,2,i?'#a1c6a4':'#cc6f7b');x.restore()});
 rr(x,80,585,1120,24,3,'#b17e59');rr(x,115,610,24,110,2,'#81593f');rr(x,1150,610,24,110,2,'#81593f');
 const devices=['wheel','ball','spr','shock','fence','cuc','laser','yarn','mine'];
 devices.forEach((ty,k)=>{const start=.8+k*.6;if(t<start)return;const pop=Math.min(1,(t-start)*4),cx=130+k*125;x.save();x.translate(cx,585);x.scale(1.5*pop,1.5*pop);drawUnit(x,{t:ty,lv:1,ph:t,fire:0,hp:1,max:1,charges:8,arm:0});x.restore();if(t-start<.25)sparkle(x,cx,500,10,'#f5d56b')});
}
function sceneTitle(x,t){x.fillStyle=lgrad(x,0,0,0,720,[[0,'#2b1d4e'],[.6,'#a24b6a'],[1,'#f3a65f']]);x.fillRect(0,0,1280,720);
 x.fillStyle='#3a6b24';x.fillRect(0,520,1280,200);
 for(let i=0;i<6;i++){const cx=1300-i*60+Math.sin(t+i)*8,cy=560+(i%3)*40;el(x,cx,cy,22,18,'#1e1430');poly(x,'#1e1430',cx-16,cy-6,cx-14,cy-30,cx-4,cy-16);poly(x,'#1e1430',cx+16,cy-6,cx+14,cy-30,cx+4,cy-16);el(x,cx-6,cy-4,3,3,'#c6ff4d');el(x,cx+6,cy-4,3,3,'#c6ff4d')}
 x.save();x.translate(420,520);x.scale(4.2,4.2);drawGranny(x,{mood:'angry',item:'pin',wave:t*5});x.restore();
 [[230,'#f0a04b'],[600,'#9e9e9e'],[700,'#5d4037']].forEach(([cx,col],k)=>{x.save();x.translate(cx,690);x.scale(2.6,2.6);niceCat(x,col,{ph:t*2+k,blink:1});x.restore()});
 const b=Math.min(1,t*1.6),sc=1+Math.sin(Math.min(1,t*1.6)*Math.PI)*.15;x.save();x.translate(840,200);x.scale(sc*b,sc*b);x.rotate(-.04);
 x.font='700 78px Oswald,Impact,sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=20;x.strokeStyle='#7a2a10';x.strokeText('Бабка против',0,-60);x.strokeText('зомби!',0,60);
 x.fillStyle='#ffcf3f';x.fillText('Бабка против',0,-60);x.fillText('зомби!',0,60);x.restore();
 if(t>1.5){x.globalAlpha=.6+.4*Math.sin(t*4);x.fillStyle='#fff3d6';x.font='800 28px Nunito,sans-serif';x.textAlign='center';x.fillText('Нажми, чтобы начать',840,360);x.globalAlpha=1}}

/* ---------- wiring & main loop ---------- */
$('#bPlay').onclick=()=>{SFX.click();if(!save.intro)playCut(()=>beginLevel(save.lvl));else beginLevel(save.lvl)};
$('#bLevels').onclick=()=>{SFX.click();openLevels()};$('#bFarm').onclick=()=>{SFX.click();openFarm()};
$('#bAlm').onclick=()=>{SFX.click();openAlmanac()};$('#bSurv').onclick=()=>{if(save.lvl<SURV_UNLOCK){SFX.bad();return}SFX.click();beginSurvival()};$('#bSet').onclick=()=>{SFX.click();openSettings()};$('#bIntro').onclick=()=>{SFX.click();playCut(toMenu)};
$('#lvBack').onclick=()=>{SFX.click();toMenu()};$('#lvAll').onclick=()=>{SFX.click();unlockAll();SFX.reveal()};$('#fBack').onclick=()=>{SFX.click();toMenu()};
let last=performance.now(),menuTick=0;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 if(!$('#game').hidden&&S){
  if(S.feedback)S.feedback.life-=dt;
  if(S.phase=='prepare'){for(const k in S.cool)S.cool[k]=Math.max(0,S.cool[k]-dt);S.units.forEach(u=>{u.ph+=dt;if(u.pop!=null&&u.pop<1)u.pop+=dt})}
  else if(S.phase=='intro'){if($('#ov').hidden)intro(dt)}else if(S.phase=='ready'){S.rt+=dt;if(S.rt>2.3){S.phase='play';SFX.zombieStart()}}
  else if(!S.paused&&$('#ov').hidden&&(S.phase=='play'||S.phase=='won'))for(let i=0;i<S.speed;i++)step(dt);
  if(drag&&drag.moved&&ptr.in){if(ptr.x>VW-50)camX=clamp(camX+C*8*dt,0,maxCam());if(ptr.x<50)camX=clamp(camX-C*8*dt,0,maxCam());if(ptr.y>VH-50)camY=clamp(camY+C*8*dt,0,maxCamY());if(ptr.y<50)camY=clamp(camY-C*8*dt,0,maxCamY())}
  draw();updBar()}
 else if(!$('#menu').hidden){drawMenu(dt);if((menuTick+=dt)>1){menuTick=0;updMenu()}}
 else if(!$('#farm').hidden)drawFarm(dt);
 else if(!$('#cut').hidden)drawCut(dt);
 requestAnimationFrame(loop)}
toMenu();requestAnimationFrame(loop);
