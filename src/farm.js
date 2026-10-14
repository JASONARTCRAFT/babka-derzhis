/* ---------- garden: real-time plants, watering, pots, seeds ---------- */
const MIN=60e3;
const PLANTS={
 catnip:{n:'Кошачья мята',grow:3*MIN,prod:1.5*MIN,price:3,bonus:'Колёса Мурзика роняют первую монетку сразу',
  d:'Главный источник мятных листиков: созревшая мята роняет листик каждые полторы минуты, пока полита.'},
 chili:{n:'Огонь-перец',grow:4*MIN,prod:2.5*MIN,price:5,bonus:'Все карточки перезаряжаются на 10% быстрее',
  d:'Жжётся даже на вид. Бабка добавляет его котам в корм «для бодрости».'},
 volt:{n:'Грозовой кабачок',grow:5*MIN,prod:2.5*MIN,price:8,bonus:'Шокер бьёт на 15% сильнее',
  d:'Потрескивает по ночам и заряжает батарейки, если их рядом положить.'},
 pump:{n:'Тыква-копилка',soon:1,d:'Появится в следующих версиях.'},
 cuke:{n:'Огурец-хохотун',soon:1,d:'Появится в следующих версиях.'}};
const GW={WATER:6*MIN,BOOST:1.5*MIN,CAP:3,SLOTS:12,MAXPOTS:10};
const SEEDREW=['catnip','chili','catnip','volt','chili','volt'];
function G(){if(!save.garden||!save.garden.pots)save.garden=JSON.parse(JSON.stringify(DEF.garden));return save.garden}
function gTick(p,now){const pl=PLANTS[p.k];const dt=Math.max(0,now-p.last);p.last=now;
 const wet=Math.min(dt,p.w);p.w-=wet;const bt=Math.min(wet,p.b);p.b-=bt;let gain=wet+bt*.5;
 if(p.g<pl.grow){const use=Math.min(pl.grow-p.g,gain);p.g+=use;gain-=use}
 if(p.g>=pl.grow&&gain>0&&p.st<GW.CAP){p.pr+=gain;while(p.pr>=pl.prod&&p.st<GW.CAP){p.pr-=pl.prod;p.st++}if(p.st>=GW.CAP)p.pr=0}}
function gUpdate(){const g=G(),n=Date.now();g.pots.forEach(pt=>{if(pt.p)gTick(pt.p,n)});if(g.can.until&&n>=g.can.until){g.can.uses=g.can.max;g.can.until=0}}
function gBonus(){gUpdate();const b={};G().pots.forEach(pt=>{const p=pt.p;if(p&&p.g>=PLANTS[p.k].grow&&p.w>0)b[p.k]=1});return b}
function gStored(){gUpdate();return G().pots.reduce((a,pt)=>a+(pt.p?pt.p.st:0),0)}
function gDry(){return G().pots.some(pt=>pt.p&&pt.p.w<=0)}
function canCd(){return(30-5*(G().cdLv||0))*MIN}
function potPrice(){return 5+3*Math.max(0,G().pots.length-2)}
function giveSeed(k,n=1){const g=G();g.seeds[k]=(g.seeds[k]||0)+n;g.known[k]=1}
function fmt(ms){ms=Math.max(0,ms);const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}

/* ---------- garden screen ---------- */
const FG={t:0,cam:0,s:1,W:0,H:0,tool:'hand',drag:null,fly:[],drops:[],msg:null,bf:[{x:600,y:180,p:0},{x:1500,y:240,p:2},{x:2200,y:200,p:4}]};
const WORLD=2700;
const slotX=i=>420+Math.floor(i/4)*760+80+(i%4)*160;
function openFarm(){show('farm');music('garden');gUpdate();$('#gInv').dataset.sig='';renderTools();renderBonus()}
function farmMsg(t){FG.msg={t,life:2.6}}
function renderBonus(){const b=gBonus(),ks=Object.keys(b);$('#gBonus').innerHTML=ks.length?'Бонусы в бою: '+ks.map(k=>`<b>${PLANTS[k].bonus}</b>`).join(' · '):'Созревшие и политые растения дают бонусы в бою.'}
function invItems(){const g=G(),c=g.can,it=[{id:'can',n:'Лейка',sub:c.uses>0?`${c.uses}/${c.max}`:fmt(c.until-Date.now()),off:c.uses<=0},{id:'fert',n:'Удобрение',sub:'×'+(g.fert||0),off:!(g.fert>0)}];
 if(g.shovel)it.push({id:'shovel',n:'Лопата',sub:'выкопать'});
 Object.entries(PLANTS).forEach(([k,p])=>{if(!p.soon&&(g.seeds[k]||0)>0)it.push({id:'seed:'+k,n:p.n,sub:'×'+g.seeds[k],plant:k})});return it}
function renderTools(){$('#leafN').textContent=save.leaves;const nav=$('#gInv'),items=invItems();
 if(FG.tool&&!items.some(i=>i.id===FG.tool&&!i.off))FG.tool=null;
 const sig=items.map(i=>i.id+i.sub+(i.off?1:0)).join()+FG.tool+save.leaves;if(nav.dataset.sig===sig)return;nav.dataset.sig=sig;
 nav.innerHTML=items.map(i=>`<button class="tool ${FG.tool===i.id?'on':''} ${i.off?'dim':''}" data-t="${i.id}">${i.plant?seedIcon(i.plant):`<canvas width="96" height="96" data-ico="${i.id}"></canvas>`}<span>${i.n}</span><small>${i.sub}</small></button>`).join('')+'<button class="tool shopb" data-t="shop"><canvas width="96" height="96" data-ico="shop"></canvas><span>Лавка</span><small>🍃 '+save.leaves+'</small></button>';
 paintPlantIcons(nav);nav.querySelectorAll('canvas[data-ico]').forEach(c=>{const x=c.getContext('2d'),k=c.dataset.ico;x.save();x.translate(48,70);x.scale(.9,.9);
  if(k=='can')drawCan(x,true);else if(k=='fert'){rr(x,-24,-50,48,52,6,'#8d6e63');rr(x,-24,-50,48,12,4,'#6d4c41');x.fillStyle='#fff3d6';x.font='900 13px Nunito,sans-serif';x.textAlign='center';x.fillText('ГУМУС',0,-14);drawLeaf(x,0,-30,10,.3)}
  else if(k=='shovel'){x.translate(0,10);drawShovel(x)}else{rr(x,-28,-40,56,40,6,'#e57373');poly(x,'#c62828',-34,-40,34,-40,26,-56,-26,-56);rr(x,-10,-26,20,26,3,'#5d4037')}x.restore()})}
$('#gInv').addEventListener('click',e=>{const b=e.target.closest('.tool');if(!b)return;SFX.click();const t=b.dataset.t;if(t=='shop')return openGShop();
 if(b.classList.contains('dim')){farmMsg(t=='can'?'Лейка пустая, ждём колодец':'Удобрений нет, купи в лавке');SFX.bad();return}
 FG.tool=FG.tool===t?null:t;$('#gInv').dataset.sig='';renderTools();
 if(FG.tool)farmMsg(t=='can'?'Нажми на растение, чтобы полить':t=='fert'?'Нажми на растущее растение':t=='shovel'?'Нажми на растение, чтобы выкопать':'Нажми на пустой горшок, чтобы посадить')});
function seedIcon(k){return `<canvas width="96" height="96" data-plant="${k}"></canvas>`}
function paintPlantIcons(root){root.querySelectorAll('canvas[data-plant]').forEach(c=>{const x=c.getContext('2d');x.clearRect(0,0,96,96);x.save();x.translate(48,88);x.scale(.42,.42);drawPot(x,1);drawPlant(x,c.dataset.plant,1,false,1);x.restore()})}
function openSeedBag(slot){const g=G();
 const html=Object.entries(PLANTS).map(([k,p])=>{const n=g.seeds[k]||0,known=g.known[k];
  return `<button class="sd ${p.soon||!n?'off':''}" data-k="${k}" ${p.soon||!n||slot==null?'disabled':''}>${known||p.soon?seedIcon(k):'<span class="q">?</span>'}<b>${p.soon?p.n:known?p.n:'???'}</b><span>${p.soon?'Скоро':known?`Семян: ${n}`:'Выпадет в миссиях'}</span>${known&&!p.soon?`<i>${p.bonus}</i>`:''}</button>`}).join('');
 const o=overlay(`<h2>${slot==null?'Мешочек семян':'Что посадим?'}</h2><p>${slot==null?'Семена выпадают за первое прохождение миссий и продаются в лавке.':'Выбери семечко. После посадки не забудь полить.'}</p><div class="seeds">${html}</div>`,[['Закрыть',()=>{}]],'wide');
 paintPlantIcons(o);
 o.querySelectorAll('.sd:not([disabled])').forEach(b=>b.onclick=()=>{const k=b.dataset.k;g.seeds[k]--;g.pots.find(p=>p.slot===slot).p={k,g:0,w:0,b:0,st:0,pr:0,last:Date.now()};
  persist();o.hidden=true;SFX.plant();farmMsg(`Посажено: ${PLANTS[k].n}. Теперь полей!`);FG.tool='can';renderTools()})}
function openGShop(){const g=G(),c=g.can;
 const items=[
  ['pot','Горшок',`Ставится на свободное место на столе. Горшков: ${g.pots.length} из ${GW.MAXPOTS}.`,g.pots.length>=GW.MAXPOTS?null:potPrice()],
  ['shovel','Садовая лопата','Выкапывает растение, которое тебе не нравится.',g.shovel?null:6],
  ['fert','Удобрение «Бабкин секрет»','Растение сразу подрастает на минуту.',4],
  ['canMax','Лейка побольше',`Поливов до перезарядки: ${c.max} → ${c.max+1}.`,c.max>=4?null:12*(c.max-1)],
  ['canCd','Колодец поглубже',`Лейка наполняется за ${canCd()/MIN} мин → ${canCd()/MIN-5} мин.`,(g.cdLv||0)>=3?null:10*((g.cdLv||0)+1)],
  ...Object.entries(PLANTS).filter(([k,p])=>!p.soon&&g.known[k]).map(([k,p])=>['seed:'+k,'Семена: '+p.n,p.bonus+'.',p.price]),
  ...Object.entries(SHOP).map(([k,it])=>['up:'+k,it.n,it.d,k=='magnet'&&save.lvl<MAGNET_UNLOCK?-1:save.shop[k]?null:it.cost]),
  ['lock1','???','Откроется после новых миссий.',-1],['lock2','???','Бабка ещё не решила, продавать ли это.',-1],['lock3','???','Говорят, привезли из-за границы.',-1]];
 const o=overlay(`<h2>Бабкина лавка</h2><p>Всё за мятные листики. У тебя: <b>${save.leaves}</b> 🍃</p><div class="shop">${items.map(([id,n,d,p])=>`<div class="si ${p<0?'lock':''}"><div><b>${n}</b><span>${d}</span></div><button class="btn sm" data-buy="${id}" ${p==null||p<0||save.leaves<p?'disabled':''}>${p<0?'🔒':p==null?'Есть':p+' 🍃'}</button></div>`).join('')}</div>`,[['Закрыть',()=>{renderTools();renderBonus()}]],'wide');
 o.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const id=b.dataset.buy,it=items.find(i=>i[0]===id),p=it[3];if(p==null||p<0||save.leaves<p)return;save.leaves-=p;
  if(id=='shovel')g.shovel=1;else if(id=='pot'){const used=new Set(g.pots.map(q=>q.slot));let s=0;while(used.has(s))s++;if(s<GW.SLOTS)g.pots.push({slot:s,p:null})}
  else if(id=='fert')g.fert=(g.fert||0)+1;else if(id=='canMax'){c.max++;if(!c.until)c.uses++}else if(id=='canCd'){g.cdLv=(g.cdLv||0)+1;if(c.until)c.until-=5*MIN}
  else if(id.startsWith('seed:'))giveSeed(id.slice(5));else if(id.startsWith('up:'))save.shop[id.slice(3)]=1;
  persist();SFX.reveal();openGShop()})}
function farmClickSlot(i){const g=G(),pt=g.pots.find(p=>p.slot===i),now=Date.now(),tool=FG.tool;
 if(!pt){if(g.pots.length>=GW.MAXPOTS){farmMsg(`Больше ${GW.MAXPOTS} горшков не поместится`);return}const pr=potPrice();
  overlay(`<h2>Новый горшок</h2><p>Поставить сюда горшок за <b>${pr}</b> 🍃? У тебя ${save.leaves}.</p>`,[[save.leaves>=pr?'Купить':'Не хватает листиков',()=>{if(save.leaves<pr)return;save.leaves-=pr;g.pots.push({slot:i,p:null});persist();SFX.place();renderTools()}],['Отмена',()=>{},'alt']]);return}
 if(!pt.p){if(tool&&tool.startsWith('seed:')){const k=tool.slice(5);if(!(g.seeds[k]>0))return;g.seeds[k]--;pt.p={k,g:0,w:0,b:0,st:0,pr:0,last:now};persist();SFX.plant();
   farmMsg(`Посажено: ${PLANTS[k].n}. Теперь возьми лейку и полей`);if(!(g.seeds[k]>0))FG.tool=null;renderTools();return}
  farmMsg(Object.values(g.seeds).some(n=>n>0)?'Выбери семечко внизу, потом нажми на горшок':'Семян нет: проходи миссии или загляни в лавку');return}
 const p=pt.p;gTick(p,now);const pl=PLANTS[p.k];
 if(tool=='can'){const c=g.can;if(c.uses<=0){farmMsg('Лейка пустая. Наполнится через '+fmt(c.until-now));SFX.bad();return}
  p.w=GW.WATER;p.b=GW.BOOST;c.uses--;if(c.uses<=0){c.until=now+canCd();FG.tool=null}FG.drops.push({x:slotX(i),t:0});SFX.splash();farmMsg('Полито: растёт быстрее');persist();renderTools();renderBonus();return}
 if(tool=='fert'){if(p.g>=pl.grow){farmMsg('Уже выросло, удобрение не нужно');return}g.fert--;p.g=Math.min(pl.grow,p.g+MIN);if(!(g.fert>0))FG.tool=null;SFX.reveal();farmMsg('Подкормлено: +1 минута роста');persist();renderTools();return}
 if(tool=='shovel'){overlay(`<h2>Выкопать?</h2><p>${pl.n} отправится в компост. Семечко не вернётся.</p>`,[['Выкопать',()=>{pt.p=null;persist();SFX.crunch();farmMsg('Горшок свободен');renderTools();renderBonus()}],['Оставить',()=>{},'alt']]);return}
 if(tool&&tool.startsWith('seed:')){farmMsg('Горшок занят. Выбери пустой или выкопай лопатой');return}
 if(p.st>0){save.leaves+=p.st;for(let k=0;k<p.st;k++)FG.fly.push({x:slotX(i),y:300,t:-k*.12});p.st=0;SFX.leaf();persist();renderTools();return}
 farmMsg(p.w<=0?`${pl.n}: сухо! Выбери лейку и полей`:p.g<pl.grow?`${pl.n}: до созревания ${fmt((pl.grow-p.g)/(p.b>0?1.5:1))}`:`${pl.n}: следующий листик через ${fmt(pl.prod-p.pr)}`)}
(()=>{const cv2=$('#farmCv');
 cv2.addEventListener('pointerdown',e=>{FG.drag={x0:e.clientX,c0:FG.cam,moved:0};try{cv2.setPointerCapture(e.pointerId)}catch(_){}});
 cv2.addEventListener('pointermove',e=>{if(!FG.drag)return;const dx=e.clientX-FG.drag.x0;if(Math.abs(dx)>6)FG.drag.moved=1;FG.cam=clamp(FG.drag.c0-dx/FG.s,0,Math.max(0,WORLD-FG.W/FG.s))});
 cv2.addEventListener('pointerup',e=>{const d=FG.drag;FG.drag=null;if(!d||d.moved)return;const r=cv2.getBoundingClientRect(),wx=(e.clientX-r.left)/FG.s+FG.cam,wy=(e.clientY-r.top-FG.oy)/FG.s;
  for(const [id,cx,cy,k] of [['gSleep',1130,690,'sleep'],['gGrey',1940,660,'nice'],['gBrown',2400,660,'nice']])if(Math.hypot(wx-cx,wy-cy)<55){petReact(id,k);return}
  for(let i=0;i<GW.SLOTS;i++)if(Math.abs(wx-slotX(i))<70&&wy>300&&wy<640){farmClickSlot(i);return}});
 cv2.addEventListener('wheel',e=>{e.preventDefault();FG.cam=clamp(FG.cam+(e.deltaX||e.deltaY)/FG.s,0,Math.max(0,WORLD-FG.W/FG.s))},{passive:false})})();
let farmUiT=0;
function drawFarm(dt){FG.t+=dt;petTick(dt);if((farmUiT+=dt)>1){farmUiT=0;gUpdate();renderTools();renderBonus()}
 const{x,W,H}=fitCanvas($('#farmCv'));const s=Math.min(H/720,W/900)*1.0;FG.s=s;FG.W=W;FG.H=H;FG.oy=(H-720*s)/2;FG.cam=clamp(FG.cam,0,Math.max(0,WORLD-W/s));
 x.fillStyle='#ffd8a8';x.fillRect(0,0,W,H);x.save();x.translate(-FG.cam*s,FG.oy);x.scale(s,s);gardenScene(x,FG.t);x.restore();
 if(FG.msg){FG.msg.life-=dt;const a=Math.min(1,FG.msg.life*2);x.globalAlpha=a;x.font='800 16px Nunito,sans-serif';const w=x.measureText(FG.msg.t).width+28;rr(x,(W-w)/2,H-150,w,34,12,'rgba(26,18,11,.88)');x.fillStyle='#fff3d6';x.textAlign='center';x.textBaseline='middle';x.fillText(FG.msg.t,W/2,H-133);x.globalAlpha=1;if(FG.msg.life<=0)FG.msg=null}
 const mw=Math.min(300,W*.5),k=mw/WORLD;rr(x,(W-mw)/2,H-108,mw,8,4,'rgba(26,18,11,.5)');rr(x,(W-mw)/2+FG.cam*k,H-108,Math.min(mw,W/s*k),8,4,'#fff3d6')}
function gardenScene(x,t){const g=G(),n=Date.now();
 x.fillStyle=lgrad(x,0,-400,0,470,[[0,'#ffb07a'],[1,'#ffe9c9']]);x.fillRect(-400,-1200,WORLD+800,1670);
 el(x,1300,120,90,90,'rgba(255,240,200,.6)');
 for(let i=0;i<14;i++){const tx=i*220+60;el(x,tx,330,110,90,'#9fc27a');el(x,tx+60,300,80,70,'#b2d18a')}
 x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=5;for(let i=0;i<=17;i++){x.beginPath();x.moveTo(300+i*140,-600);x.lineTo(300+i*140,400);x.stroke()}ln(x,'rgba(255,255,255,.5)',5,300,120,2680,120);ln(x,'rgba(255,255,255,.5)',5,300,-150,2680,-150);
 for(let i=-10;i<90;i++){rr(x,i*33,330,28,150,3,'#c08a52');poly(x,'#c08a52',i*33,330,i*33+14,316,i*33+28,330)}rr(x,-400,360,WORLD+800,10,2,'#a8743e');rr(x,-400,430,WORLD+800,10,2,'#a8743e');
 x.fillStyle=lgrad(x,0,470,0,900,[[0,'#7cb342'],[1,'#4f8f2c']]);x.fillRect(-400,470,WORLD+800,1000);
 poly(x,'#c9a66b',0,700,WORLD,700,WORLD,740,0,740);
 rr(x,-20,150,260,380,0,'#f1d3a0');for(let y=160;y<530;y+=14){x.fillStyle='rgba(150,100,50,.14)';x.fillRect(-20,y,260,1.5)}poly(x,'#b23a2a',-40,160,120,40,280,160);
 rr(x,120,360,80,170,4,'#2e7d32');el(x,180,450,4,4,'#ffd54f');rr(x,10,250,80,70,4,'#fff');rr(x,16,256,68,58,3,'#90caf9');rr(x,100,520,130,12,2,'#9e9e9e');
 const wx=300;el(x,wx,560,60,18,'#5d4037');rr(x,wx-55,470,110,90,6,'#9e9e9e');for(let i=0;i<4;i++)rr(x,wx-55,478+i*20,110,3,0,'#757575');el(x,wx,470,55,14,'#3e2723');el(x,wx,470,48,10,'#1e5aa8');
 rr(x,wx-62,360,8,112,2,'#6d4c41');rr(x,wx+54,360,8,112,2,'#6d4c41');poly(x,'#8f2e22',wx-80,370,wx,320,wx+80,370);
 const c=g.can;x.save();x.translate(wx,430);x.rotate(c.uses>0?0:.4);drawCan(x,c.uses>0);x.restore();
 x.fillStyle='#3a2210';x.font='900 22px Nunito,sans-serif';x.textAlign='center';x.fillText(c.uses>0?`Лейка: ${c.uses}/${c.max}`:`Колодец: ${fmt(c.until-n)}`,wx,620);
 for(let tb=0;tb<3;tb++){const x0=420+tb*760;rr(x,x0,560,660,26,6,'#8d5524');rr(x,x0,560,660,7,4,'#b07440');[x0+30,x0+630].forEach(lx=>rr(x,lx-8,584,16,110,3,'#6d4c41'));rr(x,x0+20,660,620,8,2,'#6d4c41')}
 rr(x,2470,380,200,170,4,'#8d6e63');poly(x,'#5d4037',2450,390,2570,320,2690,390);rr(x,2540,450,60,100,3,'#4e342e');x.fillStyle='#fff3d6';x.font='900 20px Nunito,sans-serif';x.fillText('САРАЙ',2570,420);
 for(let i=0;i<GW.SLOTS;i++){const px=slotX(i),py=560,pt=g.pots.find(p=>p.slot===i);
  if(!pt){x.globalAlpha=.55;x.setLineDash([8,6]);x.strokeStyle='#5d4037';x.lineWidth=3;x.strokeRect(px-50,py-88,100,86);x.setLineDash([]);x.globalAlpha=1;
   x.fillStyle='#5d4037';x.font='900 18px Nunito,sans-serif';x.textAlign='center';x.fillText(g.pots.length<GW.MAXPOTS?`Горшок · ${potPrice()}🍃`:'',px,py+30);continue}
  const p=pt.p;if(p)gTick(p,n);const dry=p&&p.w<=0;
  x.save();x.translate(px,py);drawPot(x,p?(dry?0:1):.5);
  if(p){const pl=PLANTS[p.k];drawPlant(x,p.k,p.g/pl.grow,dry,t)}x.restore();
  if(p){const pl=PLANTS[p.k];for(let k=0;k<p.st;k++){const lx=px+(k-1)*38,ly=py-300+Math.sin(t*2+k)*8;x.globalAlpha=.55;el(x,lx,ly,30,30,'#f1ffe4');x.globalAlpha=1;drawLeaf(x,lx,ly,22,Math.sin(t+k)*.4)}
   rr(x,px-46,py+14,92,10,5,'rgba(0,0,0,.25)');rr(x,px-45,py+15,90*clamp(p.w/GW.WATER,0,1),8,4,'#4fc3f7');
   if(p.g<pl.grow){rr(x,px-46,py+28,92,10,5,'rgba(0,0,0,.25)');rr(x,px-45,py+29,90*p.g/pl.grow,8,4,'#8bc34a')}
   x.fillStyle=dry?'#b71c1c':'#3a2210';x.font='900 19px Nunito,sans-serif';x.textAlign='center';
   x.fillText(dry?'Сухо! Полей':p.g<pl.grow?`Растёт ${fmt((pl.grow-p.g)/(p.b>0?1.5:1))}`:p.st?`Собрать ${p.st}`:`Листик ${fmt(pl.prod-p.pr)}`,px,py+60);
   if(dry){const b=Math.sin(t*5)*4;el(x,px+44,py-150+b,12,15,'#4fc3f7');poly(x,'#4fc3f7',px+44,py-172+b,px+34,py-152+b,px+54,py-152+b)}}
  else{x.fillStyle='#3a2210';x.font='900 19px Nunito,sans-serif';x.textAlign='center';x.fillText('Посадить',px,py+40)}}
 x.save();x.translate(1150,708);x.scale(2,2);sleepyCat(x,'#f0a04b',t*2,petProg('gSleep'));x.restore();petBubble(x,'gSleep',1130,640,'sleep');
 x.save();x.translate(1940,708);x.scale(1.8,1.8);niceCat(x,'#9e9e9e',{ph:t,blink:1,react:petProg('gGrey')});x.restore();petBubble(x,'gGrey',1940,610,'nice');
 x.save();x.translate(2400,708);x.scale(1.8,1.8);niceCat(x,'#5d4037',{ph:t*1.3,blink:1,react:petProg('gBrown')});x.restore();petBubble(x,'gBrown',2400,610,'nice');
 FG.bf.forEach((b,i)=>{b.p+=.016;const bx=b.x+Math.sin(b.p*.7)*220,by=b.y+Math.sin(b.p*1.3)*60,f=Math.abs(Math.sin(t*12+i));el(x,bx-6*f,by,8*f,6,'#ff8a65');el(x,bx+6*f,by,8*f,6,'#ff8a65');el(x,bx,by,2,6,'#4e342e')});
 FG.drops.forEach(d=>{d.t+=.016;for(let k=0;k<8;k++){const q=(d.t*2+k/8)%1;x.globalAlpha=1-d.t;el(x,d.x-40+k*11,lerp(380,480,q),3,6,'#4fc3f7')}x.globalAlpha=1;x.save();x.translate(d.x+30,360);x.rotate(.6);drawCan(x,true);x.restore()});FG.drops=FG.drops.filter(d=>d.t<1);
 FG.fly.forEach(f=>{f.t+=.016;if(f.t<0)return;const q=ease(Math.min(1,f.t));drawLeaf(x,lerp(f.x,FG.cam+FG.W/FG.s-80,q),lerp(f.y,-FG.oy/FG.s+30,q)-Math.sin(q*Math.PI)*120,16,q*8)});FG.fly=FG.fly.filter(f=>f.t<1)}
function drawCan(x,full){poly(x,'#78909c',-26,-30,22,-30,18,8,-22,8);rr(x,-28,-34,52,8,3,'#90a4ae');ln(x,'#78909c',6,18,-18,46,-44);el(x,48,-46,7,4,'#546e7a');x.strokeStyle='#607d8b';x.lineWidth=5;x.beginPath();x.arc(-2,-34,18,Math.PI,0);x.stroke();if(full)el(x,-2,-30,20,3,'#4fc3f7')}
function drawPot(x,wet){poly(x,'#c4652f',-46,-74,46,-74,36,0,-36,0);rr(x,-52,-86,104,16,5,'#d97b42');el(x,0,-76,43,6,wet>=1?'#4e342e':wet>0?'#6d4c41':'#a1887f');
 if(wet===0){ln(x,'#795548',1.5,-20,-77,-8,-75);ln(x,'#795548',1.5,6,-76,18,-78)}}
function drawPlant(x,k,f,dry,t){const sw=Math.sin(t*1.4+k.length)*.05;x.save();x.translate(0,-78);x.rotate(dry?.25:sw);
 const lc=dry?'#9e9d24':'#558b2f',st=f<.25?0:f<.6?1:f<1?2:3;
 if(st==0){ln(x,lc,4,0,0,0,-24);drawLeafC(x,-9,-26,10,-1,dry);drawLeafC(x,9,-26,10,1,dry)}
 else if(k=='catnip'){const h=st==1?70:st==2?100:125;ln(x,lc,5,0,0,0,-h);for(let i=0;i<(st==1?4:8);i++)drawLeafC(x,i%2?13:-13,-14-i*(h/(st==1?4:8)),st==1?12:15,i%2?1.1:-1.1,dry);
  if(st==3)[-22,0,22].forEach((q,i)=>{ln(x,lc,3,0,-h*.6,q,-h-14-i%2*10);for(let m=0;m<5;m++)el(x,q+(m%2?3:-3),-h-12-i%2*10-m*7,4,3.5,dry?'#bcaaa4':m%2?'#ba68c8':'#ce93d8')})}
 else if(k=='chili'){const h=st==1?55:st==2?85:100;const sc=st/3+.35;ln(x,lc,6,0,0,0,-h*.55);[[-.9,.55],[.9,.55],[-.6,.8],[.6,.8],[-.25,1],[.25,1],[0,.7]].forEach(([dx,dy],i)=>{const bx=dx*34*sc,by=-h*dy;ln(x,lc,3,0,-h*.45,bx,by);drawLeafC(x,bx,by-6,13+st*1.5,dx*1.2,dry)})
  if(st>=2)[[-18,-40],[14,-52],[-4,-70],[22,-30]].slice(0,st==3?4:2).forEach(([a,b])=>{x.save();x.translate(a,b);x.rotate(.3);rr(x,-5,0,10,26,5,dry?'#a1887f':st==3?'#e53935':'#7cb342');rr(x,-3,-4,6,6,2,'#2e7d32');x.restore()});
  if(st==3&&!dry&&Math.sin(t*4)>.3)poly(x,'rgba(255,152,0,.6)',-4,-74,0,-92,4,-74)}
 else if(k=='volt'){const h=st==1?45:st==2?60:70;for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.55;drawLeafC(x,Math.cos(a)*36*(st/3+.3),Math.sin(a)*30*(st/3+.4)-10,20,a+Math.PI/2,dry)}
  if(st>=2){x.save();x.translate(0,-h*.4);x.rotate(-.25);rr(x,-34,-12,68,24,12,dry?'#9e9d24':'#c0ca33');for(let i=0;i<4;i++)ln(x,dry?'#827717':'#6b8e23',3,-24+i*16,-10,-20+i*16,10);
   if(st==3&&!dry){ln(x,'#fff59d',3,-6,-6,2,0,-4,2,6,8);if(Math.random()<.5)ln(x,'#fffde7',2,30,-6,40+Math.random()*10,-16-Math.random()*10)}x.restore()}}
 x.restore()}
function drawLeafC(x,cx,cy,r,rot,dry){if(!dry)return drawLeaf(x,cx,cy,r,rot);x.save();x.translate(cx,cy);x.rotate(rot+.4);x.fillStyle='#c0ca33';x.beginPath();x.moveTo(0,-r);x.quadraticCurveTo(r*.8,-r*.2,0,r);x.quadraticCurveTo(-r*.8,-r*.2,0,-r);x.fill();x.restore()}
