/* ---------- main menu scene ----------
 Structure follows the PvZ title screen: a living scene where every menu item is an object in the world.
 Big cat tree = the "tombstone" with mode slabs; hanging sign = welcome/progress; book = almanac; stake signs = options.
 Visuals are canvas; real <button>s sit invisibly on top of each object for mouse, touch and keyboard. */
const INK='#211b22';
const MENU={t:0,hot:null,press:null,c:null,walker:-1,
 items:{ // scene-space hit boxes (1280x720)
  bPlay:{x:735,y:212,w:350,h:96},bLevels:{x:760,y:334,w:300,h:76},bFarm:{x:772,y:434,w:276,h:70},
  bAlm:{x:58,y:560,w:190,h:120},bSurv:{x:560,y:584,w:104,h:104},bSet:{x:1146,y:470,w:124,h:54},bIntro:{x:1146,y:604,w:124,h:54}}};
function inkBox(x,X,Y,W,H,r,fill,lw=3.5){rr(x,X,Y,W,H,r,fill);x.strokeStyle=INK;x.lineWidth=lw;x.beginPath();if(x.roundRect)x.roundRect(X,Y,W,H,r);else x.rect(X,Y,W,H);x.stroke()}
function inkText(x,t,cx,cy,font,fill,stroke,lw){x.font=font;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';if(stroke){x.lineWidth=lw;x.strokeStyle=stroke;x.strokeText(t,cx,cy)}x.fillStyle=fill;x.fillText(t,cx,cy)}
function menuFit(W,H){const narrow=W/H<1.25,s=narrow?Math.min(W/1280,H/720):Math.max(W/1280,H/720);
 return{s,ox:clamp(W/2-(narrow?640:820)*s,Math.min(0,W-1280*s),Math.max(0,W-1280*s)),oy:(H-720*s)*.5}}
function drawMenu(dt){MENU.t+=dt;petTick(dt);const cv=$('#menuCv'),{x,W,H}=fitCanvas(cv),c=menuFit(W,H);MENU.c=c;
 x.fillStyle='#5f5b8f';x.fillRect(0,0,W,c.oy+40);x.fillStyle='#7f8c47';x.fillRect(0,c.oy+600*c.s,W,H);x.save();x.translate(c.ox,c.oy);x.scale(c.s,c.s);menuScene(x,MENU.t);x.restore();
 for(const id in MENU.items){const b=$('#'+id),r=MENU.items[id];if(!b)continue;
  Object.assign(b.style,{left:c.ox+r.x*c.s+'px',top:c.oy+r.y*c.s+'px',width:r.w*c.s+'px',height:r.h*c.s+'px'})}}
function menuScene(x,t){
 // Far: dusk sky and the city skyline; mid: the street the cats come from; near: Babka's front garden.
 districtParallax(x,Math.sin(t*.07)*30,0,1280,312,96,t,'dusk');
 comicGround(x,'road-tile',0,330,1280,92,240,'#777078');
 rr(x,0,312,1280,20,0,'#d8cdb2');for(let i=0;i<1280;i+=40)ln(x,'rgba(130,118,96,.35)',1,i,314,i,330);rr(x,0,328,1280,4,0,'#a49b88');
 const keys=[6,5,4,7,3,8,2].map(n=>'front-house-'+n);
 keys.forEach((k,i)=>{const cx=95+i*185;swayFit(x,'prop-tree',cx+92,318,70,82,.02,i);comicFit(x,k,cx,318,170,150)});
 for(let i=0;i<7;i++){const lx=10+i*185;comicFit(x,'prop-lamp',lx,336,20,86);
  x.fillStyle=rgrad(x,lx,262,0,46,[[0,`rgba(255,226,150,${.28+.06*Math.sin(t*3+i)})`],[1,'rgba(255,226,150,0)']]);x.fillRect(lx-46,216,92,92)}
 // A zombie cat shuffles along the street now and then.
 const wt=(t+6)%28;if(wt<21)comicAnimation(x,'zombie-walk',t,1340-wt*68,410,64,46);
 // Lawn and hedge in front of the street; eyes blink in the hedge.
 comicGround(x,'lawn-tile',0,430,1280,290,300,'#879544');
 comicHedge(x,-20,410,1320,56);
 [[205,430,0],[640,428,2.1],[1010,432,4.3]].forEach(([ex,ey,p])=>{const o=Math.sin(t*.9+p);if(o<.15)return;const k=Math.min(1,(o-.15)*5);
  [-8,8].forEach(q=>el(x,ex+q,ey,4,3*k,'#c8ef7d'))});
 for(let i=0;i<5;i++)swayFit(x,'prop-grass',60+i*270+(i%2)*60,700-(i%2)*36,46,28,.08,i);
 comicFit(x,'prop-rocks',600,712,60,40);
 // Babka guards the garden; the granddaughter appears only in the intro, tutorial hints and rewards.
 el(x,420,700,95,14,'rgba(0,0,0,.2)');
 x.save();x.translate(420,702);const bb=RM?0:Math.sin(t*1.3);x.scale(1-bb*.012,1+bb*.022);comicFit(x,'granny',0,0,230,262);x.restore();
 menuCats(x,t);
 hangingSign(x,t);catTree(x,t);almanacBook(x,t);stakeSigns(x,t);survBadge(x,t)}
// Night shift badge: locked until level 6, shows the best wave.
function survBadge(x,t){const r=MENU.items.bSurv,k=hotK('bSurv'),open=save.lvl>=SURV_UNLOCK,cx=r.x+r.w/2,cy=r.y+r.h/2;
 x.save();x.translate(cx,cy+(k&&open?-4:0));if(!open){x.filter='grayscale(1) brightness(.7)';x.globalAlpha=.85}glowOn(x,open?k:0);
 if(!comicFit(x,'survival-badge',0,r.h/2,r.w,r.h))el(x,0,0,r.w/2,r.h/2,'#2b2240');x.shadowBlur=0;x.filter='none';x.globalAlpha=1;
 inkText(x,'НОЧНАЯ СМЕНА',0,r.h/2+12,'700 15px Oswald,Impact,sans-serif','#fff2d9',INK,4);
 inkText(x,open?(save.survBest?'рекорд: волна '+save.survBest:'выживание'):'с 6-го уровня',0,r.h/2+30,'700 12px "Balsamiq Sans",Nunito,sans-serif','#fff2d9',INK,3);x.restore()}
function hotK(id){return MENU.press===id?2:MENU.hot===id?1:0}
function glowOn(x,k){if(!k)return;x.shadowColor=k==2?'#9bf044':'#f4dc8c';x.shadowBlur=k==2?34:22}
function hangingSign(x,t){const sw=RM?0:Math.sin(t*1.1)*.022;x.save();x.translate(270,0);x.rotate(sw);
 const art=hasSprite('menu-sign'),ty=art?78:0;if(art)comicSprite(x,'menu-sign',-250,-14,500,300);
 else{ln(x,'#6d5a48',4,-120,0,-130,58);ln(x,'#6d5a48',4,120,0,130,58);
 inkBox(x,-178,52,356,128,10,'#c98f5c',4);
 for(let i=0;i<4;i++)ln(x,'rgba(110,62,32,.35)',2,-168,72+i*28,168,74+i*28);
 inkBox(x,-160,66,320,100,6,'#fff2d9',3);[[-130,58],[130,58]].forEach(([a,b])=>el(x,a,b,6,6,'#8b8b8b'))}
 inkText(x,'С возвращением,',0,88+ty,'700 19px "Balsamiq Sans",Nunito,sans-serif',INK);
 inkText(x,'бабушка Зина!',0,119+ty,'700 31px Oswald,Impact,sans-serif','#c66382',INK,5);
 const stars=(save.stars||[]).reduce((a,b)=>a+(b||0),0);
 inkText(x,`★ ${stars}  ·  котов: ${save.kills}  ·  листиков: ${save.leaves}`,0,148+ty,'700 14px "Balsamiq Sans",Nunito,sans-serif','#55383e');
 x.restore()}
function sisal(x,cx,y0,y1,w=34){inkBox(x,cx-w/2,y0,w,y1-y0,4,'#e2c99b',3);x.save();x.beginPath();x.rect(cx-w/2,y0,w,y1-y0);x.clip();
 for(let y=y0-w;y<y1;y+=7)ln(x,'#b8975f',2,cx-w/2,y+w*.35,cx+w/2,y);x.restore()}
function slab(x,id,label,sub,tilt){const r=MENU.items[id],k=hotK(id),lift=k?-5:0,cx=r.x+r.w/2,cy=r.y+r.h/2+lift,w=r.w,h=r.h;
 x.save();x.translate(cx,cy);x.rotate(tilt+(k&&!RM?Math.sin(MENU.t*6)*.008:0));
 el(x,0,h/2+10-lift,w*.42,7,'rgba(0,0,0,.18)');
 glowOn(x,k);if(k==2)x.filter='brightness(1.15)';
 if(hasSprite('menu-slab')){comicSprite(x,'menu-slab',-w/2-8,-h/2-4,w+16,h+14);x.filter='none';x.shadowBlur=0}
 else{inkBox(x,-w/2,-h/2+8,w,h-8,9,k==2?'#e7b47e':'#c98f5c',4);x.shadowBlur=0;
 for(let i=1;i<3;i++)ln(x,'rgba(110,62,32,.3)',2,-w/2+12,-h/2+8+(h-8)*i/3,w/2-12,-h/2+10+(h-8)*i/3);
 inkBox(x,-w/2-6,-h/2,w+12,16,8,'#a98bbf',3);
 [-1,1].forEach(q=>el(x,q*(w/2-14),h*.1,4.5,4.5,'#6d6d6d'))}x.filter='none';
 inkText(x,label,0,sub?2:6,`700 ${Math.round(h*.4)}px Oswald,Impact,sans-serif`,'#fff2d9',INK,6);
 if(sub)inkText(x,sub,0,h*.32,`700 ${Math.round(h*.17)}px "Balsamiq Sans",Nunito,sans-serif`,'#fff2d9',INK,3);
 x.restore()}
function catTree(x,t){
 // Posts first, then the base house, then the slabs and the crown with the logo.
 if(hasSprite('menu-cattree')){comicFit(x,'menu-cattree',905,700,560,600)}
 else{sisal(x,850,150,560);sisal(x,972,300,560,30);
 inkBox(x,742,530,336,160,14,'#8f6680',4);inkBox(x,742,530,336,24,10,'#a98bbf',3);
 x.save();x.beginPath();x.ellipse(910,622,46,40,0,0,7);x.fillStyle='#211b22';x.fill();x.lineWidth=4;x.strokeStyle='#5d3f52';x.stroke();x.restore();
 const bl=Math.sin(t*.7)>-.85;if(bl)[-12,12].forEach(q=>el(x,910+q,618,5.5,4.5,'#f2cf60'));
 [[790,600],[1030,650],[800,665]].forEach(([a,b])=>{el(x,a,b,7,6,'#6e4a63');[-7,0,7].forEach(q=>el(x,a+q,b-9,2.6,2.6,'#6e4a63'))})}
 el(x,910,700,190,12,'rgba(0,0,0,.18)');
 slab(x,'bFarm','ОГОРОД',gStored()?`урожай: +${gStored()}`:gDry()?'грядки сохнут!':'мятные грядки',.02);
 slab(x,'bLevels','УРОВНИ','выбор улицы',-.025);
 slab(x,'bPlay','ИГРАТЬ',save.lvl>0?`уровень ${save.lvl+1}`:'начать историю',.012);
 // Crown platform carries the title plate.
 const pop=RM?1:1+Math.max(0,.06-MENU.t*.04)*Math.sin(MENU.t*14),bob=RM?0:Math.sin(t*1.2)*2;
 x.save();x.translate(900,112+bob);x.scale(pop,pop);x.rotate(-.02);
 if(hasSprite('menu-logo'))comicFit(x,'menu-logo',0,86,360,190);
 else{inkBox(x,-214,-78,428,150,12,'#fff2d9',5);
 inkText(x,'БАБКА ПРОТИВ',0,-34,'700 50px Oswald,Impact,sans-serif',INK);
 inkText(x,'ЗОМБИ!',0,26,'700 72px Oswald,Impact,sans-serif','#c66382',INK,8)}
 x.restore()}
function almanacBook(x,t){const r=MENU.items.bAlm,k=hotK('bAlm'),cx=r.x+r.w/2,by=r.y+r.h;
 comicFit(x,'prop-bench',cx,by+6,200,110);
 x.save();x.translate(cx,by-58+(k?-6:0));x.rotate(-.06);x.scale(k?1.05:1,k?1.05:1);glowOn(x,k);
 if(hasSprite('menu-almanac')){comicFit(x,'menu-almanac',0,22,170,110);x.shadowBlur=0;inkText(x,'АЛЬМАНАХ',6,-14,'700 17px Oswald,Impact,sans-serif','#f2cf60',INK,4)}
 else{inkBox(x,-70,-22,140,40,6,'#f3e4cb',3);x.shadowBlur=0;for(let i=0;i<4;i++)ln(x,'#cdb894',1.5,-64,-12+i*7,64,-12+i*7);
 inkBox(x,-74,-34,148,22,6,'#4e6545',3.5);inkBox(x,-74,-34,18,22,4,'#3c4f36',3);
 inkText(x,'АЛЬМАНАХ',8,-23,'700 15px Oswald,Impact,sans-serif','#f2cf60')}
 x.restore()}
function stakeSigns(x,t){[['bSet','Настройки',.05],['bIntro','Заставка',-.06]].forEach(([id,txt,tl])=>{const r=MENU.items[id],k=hotK(id),cx=r.x+r.w/2;
 x.save();x.translate(cx,r.y+r.h/2+(k?-4:0));x.rotate(tl+(RM?0:Math.sin(t*1.4+tl*20)*.012));
 if(hasSprite('menu-stake-sign')){glowOn(x,k);comicFit(x,'menu-stake-sign',0,r.h*1.5,r.w*1.6,r.h*2.6);x.shadowBlur=0}
 else{inkBox(x,-6,0,12,r.h*.9,3,'#8a5a33',2.5);glowOn(x,k);inkBox(x,-r.w/2,-r.h/2,r.w,r.h,7,k==2?'#d6e6a6':'#b7ca83',3.5);x.shadowBlur=0}
 inkText(x,txt,-4,-2,`700 ${Math.round(r.h*.36)}px Oswald,Impact,sans-serif`,INK);x.restore()})}
// Healthy cats come from the art pack (cat-sleep / cat-sit / cat-loaf). Until they exist the scene simply has no cats.
const MENU_CATS=[['mTop','cat-sleep',1010,300,96,62,'sleep'],['mBase','cat-sit',1110,690,86,104,'nice'],['mLawn','cat-loaf',690,706,92,64,'nice']];
function menuCats(x,t){MENU_CATS.forEach(([id,key,cx,by,w,h,kind])=>{if(!COMIC_SPRITES[key]?.image.naturalWidth)return;const p=petProg(id),j=p>0?Math.sin(p*Math.PI)*.12:0,br=RM?0:Math.sin(t*1.6+cx)*.02;
 x.save();x.translate(cx,by);x.scale(1+j-br*.5,1-j+br);comicFit(x,key,0,0,w,h);x.restore();petBubble(x,id,cx,by-h-6,kind)})}
$('#menuCv').addEventListener('pointerdown',e=>{const c=MENU.c;if(!c)return;const r=$('#menuCv').getBoundingClientRect(),px=(e.clientX-r.left-c.ox)/c.s,py=(e.clientY-r.top-c.oy)/c.s;
 MENU_CATS.forEach(([id,key,cx,by,w,h,k])=>{if(COMIC_SPRITES[key]?.image.naturalWidth&&Math.abs(px-cx)<w/2&&py<by&&py>by-h)petReact(id,k)})});
Object.keys(MENU.items).forEach(id=>{const b=$('#'+id);if(!b)return;
 b.addEventListener('pointerenter',()=>MENU.hot=id);b.addEventListener('pointerleave',()=>{if(MENU.hot===id)MENU.hot=null;if(MENU.press===id)MENU.press=null});
 b.addEventListener('focus',()=>MENU.hot=id);b.addEventListener('blur',()=>{if(MENU.hot===id)MENU.hot=null});
 b.addEventListener('pointerdown',()=>MENU.press=id);b.addEventListener('pointerup',()=>MENU.press=null)});
