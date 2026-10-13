/* ---------- drawing: everything in local units, origin at feet, cell = 72 ---------- */
function drawUnit(x,u){const t=u.t,lv=u.lv||1,ph=u.ph||0,f=u.fire||0;
 el(x,0,0,24,6,'rgba(0,0,0,.25)');if(u.hurt>0)x.globalAlpha=.7;
 if(t=='wheel')drawWheel(x,lv,ph);else if(t=='ball')drawBallGun(x,lv,f,ph);else if(t=='spr')drawSpr(x,lv,f,ph);
 else if(t=='shock')drawShock(x,lv,f,ph);else if(t=='fence')drawFence(x,u);else if(t=='cuc')drawCuc(x,ph);
 else if(t=='laser')drawLaser(x,u);else if(t=='yarn')drawYarn(x,u,ph);else if(t=='mine')drawMine(x,u,ph);
 x.globalAlpha=1}
function drawWheel(x,lv,ph){const gold=lv>1;
 poly(x,'#8a5a2b',-20,0,-5,-32,-1,-32,-13,0);poly(x,'#8a5a2b',20,0,5,-32,1,-32,13,0);
 rr(x,14,-15,13,11,3,'#607d8b');ln(x,'#ffca28',1.6,20,-15,20,-22,17,-19);
 const R=25,cy=-34,a=ph*4.5;el(x,0,cy,R,R,gold?'#fff1bf':'#f7e3c2');
 for(let i=0;i<8;i++){const q=a+i*Math.PI/4;ln(x,gold?'#e6bb3c':'#c49a6c',2,0,cy,Math.cos(q)*R,cy+Math.sin(q)*R)}
 const st=Math.sin(ph*16);x.save();x.translate(0,cy+R-3);
 ln(x,'#f0a04b',3.5,9,-9,16,-15+st*2);el(x,0,-9,11,7.5,'#f0a04b');el(x,-2,-7,6,4,'#ffe0b2');el(x,-11,-14,7.5,7,'#f0a04b');
 poly(x,'#f0a04b',-17,-17,-16,-25,-10,-19);poly(x,'#f0a04b',-8,-19,-4,-26,-3,-17);poly(x,'#f8a5b5',-15,-18,-15,-22,-12,-19);
 ln(x,'#c97a2e',3.5,-5+st*4,-4,-7+st*6,0);ln(x,'#c97a2e',3.5,6-st*4,-4,8-st*6,0);ln(x,'#c97a2e',1.5,-4,-12,-1,-13);
 el(x,-14,-15,1.4,1.7,'#3a2210');el(x,-17.5,-12,1.3,1,'#d47a8a');x.restore();
 x.strokeStyle=gold?'#d4a017':'#7a4a26';x.lineWidth=5;x.beginPath();x.arc(0,cy,R,0,7);x.stroke();el(x,0,cy,4,4,'#5a3a1c');
 if(gold){const s=Math.max(0,Math.sin(ph*3));if(s>.6)sparkle(x,R*.75,cy-R*.75,6*s,'#fff59d')}}
function sparkle(x,cx,cy,r,c){poly(x,c,cx,cy-r,cx+r*.25,cy-r*.25,cx+r,cy,cx+r*.25,cy+r*.25,cx,cy+r,cx-r*.25,cy+r*.25,cx-r,cy,cx-r*.25,cy-r*.25)}
function drawBallGun(x,lv,f,ph){const rc=f>0?f*22:0,gold=lv==3,body=gold?'#e3ae2a':'#2e7d6b',dark=gold?'#9c7311':'#1b5146',lite=gold?'#f7d677':'#4fa58f';
 el(x,-14,-5,5.5,5.5,'#2b2b2b');el(x,12,-5,5.5,5.5,'#2b2b2b');el(x,-14,-5,2,2,'#aaa');el(x,12,-5,2,2,'#aaa');
 rr(x,-23,-32,42,26,7,body);rr(x,-23,-32,42,7,5,lite);rr(x,-20,-14,22,5,2,dark);
 for(let i=0;i<lv;i++){const by=-22-i*9+(lv-1)*4;rr(x,12-rc,by-4.5,19,9,3,dark);el(x,31-rc,by,2.6,4.5,'#111');
  x.save();x.translate(8,by);x.rotate(ph*25+i);ln(x,'#ddd',1.6,-3.5,0,3.5,0);ln(x,'#ddd',1.6,0,-3.5,0,3.5);x.restore()}
 poly(x,'#90a4ae',-21,-32,-27,-54,15,-54,9,-32);
 const bc=[[-18,-46],[-9,-48],[0,-47],[8,-48],[-13,-39],[-4,-40],[5,-40]];
 bc.forEach(([a,b])=>{el(x,a,b,4.4,4.4,'#d7ef3a');x.strokeStyle='#fff';x.lineWidth=1;x.beginPath();x.arc(a-2.2,b,3,-1,1);x.stroke()});
 x.strokeStyle='#cfd8dc';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(-26+i*8,-54);x.lineTo(-20+i*6,-32);x.stroke()}
 ln(x,'#b0bec5',2.5,-27,-54,15,-54);el(x,-12,-22,4.5,4.5,'#fff');ln(x,'#e53935',1.5,-12,-22,-9.5,-24.5)}
function drawSpr(x,lv,f,ph){const up=lv>1,hy=up?-44:-38;
 if(up){x.strokeStyle='#2e7d32';x.lineWidth=4.5;x.lineCap='round';x.beginPath();x.moveTo(-30,-2);x.quadraticCurveTo(-22,-16,-6,-9);x.stroke()}
 rr(x,-12,-7,24,7,3,'#5d4037');poly(x,'#5d4037',-4,0,4,0,0,6);
 rr(x,-3,hy,6,-hy-7,2,up?'#c9a227':'#9e9e9e');
 x.save();x.translate(0,hy);x.rotate(f>0?Math.sin(ph*16)*.14:0);
 el(x,0,0,11,8,up?'#d4a017':'#43a047');el(x,-3.5,-1.5,2,2.2,'#fff');el(x,3.5,-1.5,2,2.2,'#fff');el(x,-3,-1.2,.9,1.1,'#000');el(x,4,-1.2,.9,1.1,'#000');
 rr(x,7,-3,up?18:11,6,2,'#ffb300');if(up)rr(x,22,-4,4,8,2,'#ff8f00');x.restore();
 if(f>0){const n=(up?3:2)*72-6,sx=up?27:19,a=Math.min(1,f*2);
  for(let i=0;i<22;i++){const q=((i/22)+ph*1.7)%1,px=sx+q*n,py=lerp(hy,-22,q)-Math.sin(q*Math.PI)*(up?12:20)+Math.sin(i*7.3+ph*30)*(up?1.5:4);
   x.globalAlpha=a*(1-q*.4);el(x,px,py,(up?3.2:3.8)-q,(up?2.4:3)-q*.8,'#6ec3ff');el(x,px-.8,py-.8,1,1,'#fff')}
  if(up){x.globalAlpha=a*.35;ln(x,'#9fdcff',5,sx,hy,sx+n*.5,lerp(hy,-22,.5)-12,sx+n,-22)}
  x.globalAlpha=a*.45;el(x,sx+n,-20,14,7,'#cde9ff');x.globalAlpha=1}}
function drawShock(x,lv,f,ph){const up=lv>1;
 rr(x,-22,-8,40,8,3,'#455a64');
 const nb=up?3:2;for(let i=0;i<nb;i++){const bx=-20+i*10;rr(x,bx,-36,9,28,2,i%2?'#f9a825':'#1e88e5');rr(x,bx+2,-39,5,3,1,'#bdbdbd');rr(x,bx,-22,9,4,0,'#263238')}
 ln(x,'#e53935',1.6,-16,-38,-6,-44,8,-40);
 for(let i=0;i<6;i++)el(x,12,-12-i*4,6.5,2.2,i%2?'#d9822b':'#b8651c');
 ln(x,'#9e9e9e',3.5,10,-36,27,-40);ln(x,'#9e9e9e',3.5,10,-28,27,-28);el(x,28,-40,2.8,2.8,'#eceff1');el(x,28,-28,2.8,2.8,'#eceff1');
 if(Math.random()<.55||f>0){const p=[28,-40];for(let i=1;i<4;i++)p.push(28+(Math.random()-.5)*7,-40+i*3);p.push(28,-28);
  ln(x,up?'rgba(206,147,216,.6)':'rgba(255,245,157,.5)',up?6:4,...p);ln(x,up?'#f3e5f5':'#fffde7',up?2.2:1.5,...p)}
 if(up){el(x,12,-42,6,6,'#cfd8dc');el(x,10,-44,2,2,'#fff');if(Math.random()<.45)ln(x,'#ce93d8',1.6,12,-42,12+(Math.random()-.5)*24,-52-Math.random()*10)}
 if(f>0){x.globalAlpha=f*2.5;el(x,28,-34,10,10,'rgba(255,255,200,.6)');x.globalAlpha=1}}
function drawFence(x,u){const dmg=1-u.hp/u.max;x.save();x.rotate(dmg>.66?-.07:0);
 rr(x,-24,-8,48,8,3,'#8d6e63');rr(x,-9,-66,18,60,3,'#e0c79a');
 for(let i=0;i<11;i++)ln(x,'#b8975f',2,-9,-10-i*5,9,-13-i*5);
 rr(x,-22,-72,44,10,4,'#8e5bd1');rr(x,-18,-96,30,25,5,'#a77be0');el(x,-4,-84,7,8,'#4a2a7a');el(x,14,-74,5,4,'#ffca28');ln(x,'#ffca28',1.2,14,-74,14,-62);
 if(dmg>.33){ln(x,'#5a3a1c',2,-7,-30,5,-40);ln(x,'#5a3a1c',2,-5,-24,7,-34)}
 if(dmg>.66){ln(x,'#5a3a1c',2,-8,-50,6,-58);ln(x,'#f5e6c8',2,9,-20,16,-14)}x.restore()}
function drawCuc(x,ph){rr(x,-17,-28,34,28,4,'#e53935');rr(x,-17,-28,34,6,2,'#ffca28');for(let i=0;i<3;i++)el(x,-8+i*8,-12,3,3,'#ffca28');
 const pop=Math.sin(ph*3)*2;ln(x,'#9e9e9e',2,-3,-28,3,-32,-3,-36,3,-40);
 x.save();x.translate(0,-50+pop);x.rotate(.2);rr(x,-8,-14,16,30,8,'#43a047');for(let i=0;i<4;i++)el(x,i%2?5:-5,i*6-4,1.4,1.4,'#2e7d32');
 el(x,-3,-5,2,2.4,'#fff');el(x,3,-5,2,2.4,'#fff');el(x,-3,-5,1,1.3,'#000');el(x,3,-5,1,1.3,'#000');ln(x,'#1b5e20',1.2,-3,2,0,4,3,2);x.restore();
 poly(x,'#c62828',-17,-28,-28,-42,-24,-44,-13,-28)}
function drawLaser(x,u){ln(x,'#90a4ae',3,-8,0,-8,-6);ln(x,'#90a4ae',3,8,0,8,-6);rr(x,-15,-32,30,28,9,'#eceff1');
 el(x,0,-40,13,11,'#cfd8dc');el(x,4,-40,6,6,'#263238');el(x,5,-41,2.8,2.8,'#ff1744');ln(x,'#90a4ae',2,-6,-50,-10,-58);el(x,-10,-59,2.5,2.5,'#ff1744');
 const ch=(u.charges??8)/8;rr(x,-11,-24,22,7,2,'#455a64');rr(x,-10,-23,20*ch,5,1,ch>.3?'#66bb6a':'#ef5350')}
function drawYarn(x,u,ph){const k=u.on?Math.max(.4,u.on/5):1,R=17*k;el(x,0,-R,R,R,'#ec407a');x.strokeStyle='#ad1457';x.lineWidth=1.5;
 for(let i=0;i<4;i++){x.beginPath();x.ellipse(0,-R,R*.9,R*(.25+i*.2),i*.8+ph*(u.on?4:0),0,Math.PI);x.stroke()}
 ln(x,'#ec407a',2,R*.7,-3,R+16,-1,R+24,-4)}
function drawMine(x,u,ph){const armed=!(u.arm>0),sk=armed?0:5;
 if(!armed){el(x,0,-2,18,5,'#6d4c41')}
 rr(x,-14,-22+sk,28,22-sk,4,'#cfd8dc');rr(x,-14,-18+sk,28,12,2,'#e53935');
 el(x,-1,-12+sk,6,3,'#ffeb3b');poly(x,'#ffeb3b',5,-12+sk,10,-15+sk,10,-9+sk);el(x,-4,-12.5+sk,.9,.9,'#000');
 el(x,0,-22+sk,14,3,'#b0bec5');ln(x,'#5d4037',2,6,-23+sk,10,-31+sk);
 if(armed){if((ph*4|0)%2){el(x,10,-32,3.5,3.5,'#ff9800');el(x,10,-32,1.6,1.6,'#fff')}}
 else{x.fillStyle='#fff';x.font='bold 11px Nunito,sans-serif';x.textAlign='left';x.fillText('z',14,-26-(ph*8%10));x.fillText('z',19,-34-(ph*8%10)*.6)}}
function drawBowl(x,food){el(x,0,-1,22,6,'rgba(0,0,0,.25)');poly(x,'#ec407a',-20,-12,20,-12,14,0,-14,0);el(x,0,-12,20,5,'#f48fb1');
 if(food>0)for(let i=0;i<food*4;i++)el(x,-12+(i*7)%24,-13-(i%3)*1.5,3,2,'#8d6e63');el(x,0,-6,5,2.5,'#fff');poly(x,'#fff',4,-6,8,-8,8,-4)}
function drawHydrant(x){rr(x,-9,-28,18,26,4,'#e53935');el(x,0,-29,11,5,'#c62828');rr(x,-13,-20,26,7,3,'#c62828');rr(x,-12,-4,24,4,2,'#8e1b1b');el(x,0,-36,3,3,'#c62828');el(x,-3,-24,2,3,'rgba(255,255,255,.4)')}
function drawPole(x){rr(x,-3,-80,6,80,2,'#6d4c41');ln(x,'#4e342e',3,0,-76,18,-80);rr(x,13,-82,12,6,2,'#37474f');el(x,19,-75,6,3,'#ffee58');ln(x,'#222',1.5,-34,-66,0,-70,34,-64)}
function drawCar(x,k){const L=k=='truck'?118:74;rr(x,-23,-L/2,46,L,10,k=='truck'?'#43a047':'#fdd835');
 if(k=='truck'){rr(x,-20,-L/2+4,40,L-44,6,'#2e7d32');for(let i=0;i<4;i++)ln(x,'#1b5e20',2,-16,-L/2+14+i*16,16,-L/2+14+i*16);rr(x,-19,L/2-34,38,14,4,'#bbdefb')}
 else{rr(x,-19,-4,38,16,4,'#bbdefb');for(let i=0;i<4;i++)rr(x,-21+i*10.5,-L/2+12,5,5,0,'#222');rr(x,-19,-L/2+4,38,6,3,'#bbdefb');rr(x,-8,-12,16,6,2,'#222')}
 el(x,-14,L/2-3,6,3,'#fff59d');el(x,14,L/2-3,6,3,'#fff59d')}
function drawShovel(x){ln(x,'#8d6e63',5,-16,-56,6,-16);poly(x,'#b0bec5',0,-20,16,-6,8,6,-6,-8);ln(x,'#6d4c41',5,-20,-60,-12,-52)}
function drawCoin(x,cx,cy,r,gold){const a=gold?['#b07800','#e0a100','#ffd54f','#fff8e1']:['#6d7a83','#9aa7b0','#dfe6ea','#ffffff'];
 el(x,cx,cy+r*.12,r,r,a[0]);el(x,cx,cy,r,r,a[1]);el(x,cx,cy,r*.8,r*.8,a[2]);
 el(x,cx,cy+r*.18,r*.27,r*.22,a[1]);[-.32,-.11,.11,.32].forEach((q,i)=>el(x,cx+q*r,cy-r*.22-(i==1||i==2?r*.1:0),r*.1,r*.12,a[1]));el(x,cx-r*.35,cy-r*.4,r*.2,r*.12,a[3])}
function drawLeaf(x,cx,cy,r,rot=0){x.save();x.translate(cx,cy);x.rotate(rot);x.fillStyle='#7cd65a';x.beginPath();x.moveTo(0,-r);x.quadraticCurveTo(r*.9,-r*.2,0,r);x.quadraticCurveTo(-r*.9,-r*.2,0,-r);x.fill();ln(x,'#3e8a28',r*.12,0,-r*.8,0,r*.85);x.restore()}
function drawMower(x,go,ph){el(x,0,0,24,5,'rgba(0,0,0,.25)');
 ln(x,'#424242',3,-12,-16,-30,-48);ln(x,'#424242',3,-6,-16,-24,-48);ln(x,'#212121',5,-34,-49,-20,-49);
 rr(x,-20,-20,40,13,6,'#d32f2f');rr(x,-20,-20,40,4,3,'#ef5350');rr(x,-9,-31,19,12,3,'#37474f');rr(x,-5,-35,7,5,1,'#ffca28');ln(x,'#9e9e9e',1.5,10,-26,16,-33);
 [-12,13].forEach(w=>{el(x,w,-5,6.5,6.5,'#212121');el(x,w,-5,2.6,2.6,'#9e9e9e')});
 if(go){x.save();x.translate(-12,-5);x.rotate(ph*25);ln(x,'#bbb',1.2,-5,0,5,0);x.restore()}}
function drawPerson(x,o={}){const ph=o.ph||0,st=Math.sin(ph),run=o.run;const coat=o.coat||'#5c6bc0';
 el(x,0,0,16,4,'rgba(0,0,0,.25)');
 ln(x,'#37474f',6,-3,-32,-4+st*(run?9:4),-3);ln(x,'#37474f',6,3,-32,4-st*(run?9:4),-3);
 el(x,-6+st*(run?9:4),-2,6,3,o.shoe||'#3e2723');el(x,2-st*(run?9:4),-2,6,3,o.shoe||'#3e2723');
 rr(x,-11,-62,22,32,7,coat);
 ln(x,coat,6,-8,-56,run?-20:-16,run?-66+st*4:-40);ln(x,coat,6,8,-56,run?20:16,run?-46-st*4:-40);
 el(x,0,-74,10,11,'#ffccbc');el(x,0,-82,10,5,o.hair||'#5d4037');
 if(o.panic){el(x,-3,-75,2.5,3,'#fff');el(x,3,-75,2.5,3,'#fff');el(x,-3,-75,1,1,'#000');el(x,3,-75,1,1,'#000');el(x,0,-68,2.5,3,'#5d2a1a')}
 else{el(x,-3,-75,1.2,1.2,'#3a2210');el(x,3,-75,1.2,1.2,'#3a2210');ln(x,'#3a2210',1.3,-3,-69,3,-69)}}

/* ---------- cats ---------- */
const PAL={cat:['#a3b18a','#6f7d5c','#d9dfc8'],kit:['#cfe3b0','#93ad74','#eef5e2'],fat:['#9c8f6b','#6e6447','#cfc6a6'],ath:['#d1b06b','#9c7f3e','#efe0b5'],
 vac:['#8ea4b8','#5d7488','#d3dde6'],mom:['#c99aa8','#94667a','#ecd5dc'],lead:['#5f6660','#3a3f3b','#9aa29b'],skate:['#7ab7a6','#4c8576','#c9e6de'],
 swim:['#7aa6c2','#4d7891','#cfe3ef'],basin:['#b9946a','#87653f','#e3cfb2'],robo:['#b0bec5','#78909c','#eceff1'],ghost:['#e3f4ff','#a9cfe6','#ffffff'],box:['#c8955a','#a87a43','#d9ab6c'],
 owner:['#90a4ae','#5c6bc0','#ffccbc'],boss:['#7e57c2','#4527a0','#d1c4e9']};
function drawCat(x,o){const t=o.type;x.save();
 if(o.dying){const d=o.dying,sw={fat:26,boss:74,owner:22,box:26}[t]||20;x.globalAlpha*=1-Math.max(0,d-.55)*2.2;if(t!='ghost')el(x,0,0,sw*(1+Math.min(1,d*2.2)*.35),sw*.25,'rgba(0,0,0,.28)');o=Object.assign({},o,{noShadow:1});if(t!='ghost'&&t!='boss')x.rotate((o.flip?-1:1)*Math.min(1,d*2.2)*1.5)}
 if(o.flip)x.scale(-1,1);
 if(t=='box')boxCat(x,o);else if(t=='owner')ownerCat(x,o);else if(t=='boss')bossCat(x,o);else if(t=='ghost')ghostCat(x,o);else baseCat(x,o);
 x.restore()}
function baseCat(x,o){const t=o.type,P=PAL[t]||PAL.cat,hp=o.hpf??1,ph=o.ph||0;
 let fur=P[0],dk=P[1],bl=P[2];if(o.rust>0&&t=='robo'){fur='#b98a6a';dk='#8a5a3c'}if(o.hit>0){fur='#ffffff';bl='#ffffff'}
 const still=o.eat||o.dying,st=still?0:Math.sin(ph),bob=o.eat?Math.abs(Math.sin(ph*2))*3:Math.abs(Math.cos(ph))*2.5;
 const sc=t=='fat'?1.32:t=='kit'?.62:t=='mom'?1.06:t=='robo'?1.12:t=='basin'?1.05:t=='lead'?1.08:1;
 if(!o.noShadow)el(x,0,0,20*sc,5*sc,'rgba(0,0,0,.28)');
 if(o.boost>0){x.globalAlpha*=.6;for(let i=0;i<3;i++)ln(x,'#fff',2,20+i*3,-12-i*9,36+i*5,-12-i*9);x.globalAlpha/=.6}
 if(t=='skate'&&!o.off){rr(x,-22,-9,44,5,2,'#ff7043');ln(x,'#fff',1.5,-14,-7,14,-7);el(x,-14,-2,3.5,3.5,'#333');el(x,14,-2,3.5,3.5,'#333');x.translate(0,-9);x.rotate(-.06)}
 const onVac=t=='vac'&&!o.off;
 if(onVac){el(x,0,-6,26,9,'#455a64');el(x,0,-9,24,7,'#90a4ae');el(x,0,-11,14,3,'#b0bec5');el(x,-14,-9,2.6,2,(ph*3|0)%2?'#40c4ff':'#0277bd');
  x.save();x.translate(-22,-5);x.rotate(ph*14);ln(x,'#5d4037',1.4,-6,0,6,0);ln(x,'#5d4037',1.4,0,-6,0,6);x.restore();x.translate(0,-13)}
 x.scale(sc,sc);
 if(t=='robo'){ln(x,'#78909c',3,10,-16,20,-24,22,-38);el(x,22,-39,3,3,(ph*2|0)%2?'#ff1744':'#b71c1c')}
 else ln(x,dk,5,10,-16,22,-22+st*3,hp<.25?15:20+(o.scared?6:0),hp<.25?-30:-40+st*4);
 if(!onVac){
  if(t=='robo'){rr(x,-17,-9,34,9,4,'#455a64');for(let i=0;i<5;i++)el(x,-13+i*6.5,-4.5,2.4,2.4,(i+(ph*3|0))%2?'#90a4ae':'#607d8b')}
  else if(t=='swim'){poly(x,'#00c853',-6+st*4,-1,-21+st*4,1,-6+st*4,3);poly(x,'#00c853',6-st*4,-1,-9-st*4,1,6-st*4,3)}
  else{el(x,-6+st*4,-3,5,4,dk);el(x,6-st*4,-3,5,4,dk)}
  if(t=='ath'){el(x,-8+st*4,-2,6.5,3,'#e53935');el(x,4-st*4,-2,6.5,3,'#e53935');ln(x,'#fff',1,-12+st*4,-2,-4+st*4,-2)}}
 const by=-20-bob;
 if(t=='basin'&&o.arm>0){basinShell(x,o,by);return}
 el(x,0,by,14,17,fur);el(x,-4,by+2,8,11,bl);
 if(t=='fat'){el(x,-3,by+4,12,12,bl);ln(x,'#f5f5f5',3,-13,by-2,13,by+4);ln(x,'#e57373',1,-1,by,-1,by+3)}
 if(t=='mom'){poly(x,'#fff',-11,by-6,6,by-6,9,by+13,-13,by+13);ln(x,'#f48fb1',2,-11,by-6,6,by-6);el(x,-2,by+5,2,2,'#f48fb1')}
 if(t=='ath')rr(x,-14,by+3,26,8,3,'#1e88e5');
 if(t=='lead'){ln(x,'#7b1fa2',3,-10,by-12,10,by-10);poly(x,'#7b1fa2',6,by-12,16,by+10,4,by+6)}
 if(t=='robo'){[-6,0,6].forEach(q=>el(x,q,by-7,1.5,1.5,'#78909c'));rr(x,-7,by,11,8,2,'#546e7a');el(x,-1.5,by+4,2,2,(ph*4|0)%2?'#ffeb3b':'#e53935')}
 if(t=='skate')rr(x,-12,by-4,22,14,5,'#ff7043');
 if(hp<.5&&t!='robo')el(x,5,by+6,3.5,3,dk);
 if(o.rust>0&&t=='robo'){el(x,4,by-2,4,3,'#a1665e');el(x,-6,by+8,3,2,'#a1665e')}
 const ay=by-6,pc=t=='robo'?'#546e7a':dk;
 ln(x,t=='robo'?'#90a4ae':fur,6,-6,ay,-20,ay+st*2);ln(x,t=='robo'?'#90a4ae':fur,6,-4,ay+6,-19,ay+6-st*2);el(x,-21,ay+st*2,3.5,3.5,pc);el(x,-20,ay+6-st*2,3.5,3.5,pc);
 catHead(x,o,fur,dk,by)}
function basinShell(x,o,by){const a=clamp(o.arm,0,1),ph=o.ph||0;
 const g=lgrad(x,-24,0,24,0,[[0,'#7d8a94'],[.35,'#dfe6ea'],[.6,'#aab6be'],[1,'#6e7a83']]);
 x.fillStyle=o.hit>0?'#fff':g;x.beginPath();x.ellipse(0,by+6,24,32,0,Math.PI,0);x.fill();
 rr(x,-27,by+3,54,7,3,'#8e9aa3');rr(x,-27,by+3,54,2.5,2,'#eceff1');
 el(x,0,by-26,6,3,'#78909c');
 if(a<.66){el(x,-8,by-10,5,3.5,'#8e9aa3');ln(x,'#6e7a83',1.2,-12,by-12,-5,by-8)}
 if(a<.33){el(x,10,by-2,5,4,'#8e9aa3');ln(x,'#6e7a83',1.2,7,by-5,13,by+1)}
 const bl=(ph*1.3|0)%5;rr(x,-16,by+10,22,6,3,'#1b1b1b');if(bl)[-12,-3].forEach(q=>el(x,q,by+13,1.8,1.8,'#d4ff6a'))}
function catHead(x,o,fur,dk,by){const t=o.type,hp=o.hpf??1,ph=o.ph||0,hy=by-22-(o.raise?4:0);
 x.save();x.translate(-4,hy);x.rotate(o.raise?-.4:Math.sin(ph*.5)*.06);if(t=='kit')x.scale(1.25,1.25);
 if(t=='robo'){poly(x,'#90a4ae',-13,-4,-11,-19,-3,-11);poly(x,'#90a4ae',13,-4,10,-19,2,-11);poly(x,'#607d8b',-11,-7,-10,-15,-5,-10)}
 else{poly(x,fur,-13,-4,-11,-19,-3,-11);if(hp>=.5||t=='kit')poly(x,fur,13,-4,10,-19,2,-11);else poly(x,fur,13,-4,9,-12,2,-9);
  poly(x,'#f8a5b5',-11,-6,-10,-15,-5,-10);if(t=='cat')poly(x,'#2b1a0e',-12,-15,-9.5,-13,-11.5,-11)}
 if(t=='fat')el(x,0,5,15,8,fur);
 el(x,0,0,14,13,t=='robo'?'#cfd8dc':fur);
 if(t=='robo'){rr(x,-12,-5,18,8,4,'#263238');el(x,-6+Math.sin(ph)*3,-1,3,2.5,'#ff1744');ln(x,'#78909c',2,2,-12,6,-22);el(x,6,-23,2.5,2.5,(ph*2|0)%2?'#ff1744':'#b71c1c');[-9,9].forEach(q=>el(x,q,6,1.3,1.3,'#78909c'));ln(x,'#455a64',1.5,-6,8,2,8)}
 else if(o.dying){[-5,4].forEach(q=>{ln(x,'#3a2210',1.8,q-2.5,-3,q+2.5,2);ln(x,'#3a2210',1.8,q-2.5,2,q+2.5,-3)});el(x,-1,7,2.5,2,'#e57373')}
 else if(o.scared){el(x,-6,-1,4.5,5,'#fff');el(x,4,-1,4.5,5,'#fff');el(x,-6,-1,1.3,1.3,'#000');el(x,4,-1,1.3,1.3,'#000');el(x,-1,7,3,3.5,'#3a2210');el(x,10,-8,1.6,3,'#8fd0ff')}
 else{
  if(t=='kit'){el(x,-5,-1,4.5,5,'#f4ffd0');el(x,4,-1,4.5,5,'#f4ffd0');el(x,-6,0,2,2.5,'#1b1b1b');el(x,3,0,2,2.5,'#1b1b1b');ln(x,'#3a4a2e',1.2,-3,6,-1,5,1,6)}
  else{el(x,-5,-1,5,5.5,t=='fat'?'#fff3c4':'#f4ffd0');el(x,-6,-1,2,2.5,'#1b1b1b');
   if(t=='lead'){el(x,4,-1,5,5,'#111');ln(x,'#111',1.5,-12,-6,12,-8)}else{ln(x,'#3a4a2e',2,2,-3,7,1);ln(x,'#3a4a2e',2,2,1,7,-3)}
   el(x,-1,3,1.8,1.3,'#b0707a');ln(x,'#3a4a2e',1.5,-6,7,-3,5,0,7,3,5);rr(x,-2,6,3,3,0,'#fff')}
  if(t=='cat'||t=='basin'){ln(x,'#5d6d4e',1.2,2,-11,10,-8);[4,7].forEach(q=>ln(x,'#5d6d4e',1,q,-12,q+1,-7))}
  if(t=='lead')ln(x,'#e57373',1.5,-10,-6,-6,4)}
 if(t=='ath')rr(x,-14,-9,28,4,2,'#e53935');
 if(t=='lead'){rr(x,-9,-20,18,9,1,'#b0bec5');poly(x,'#b0bec5',-9,-20,-6,-25,-3,-20,0,-25,3,-20,6,-25,9,-20);ln(x,'#78909c',1,-9,-16,9,-16)}
 if(t=='swim'){x.fillStyle='#ff6d00';x.beginPath();x.ellipse(0,-3,15,12,0,Math.PI,0);x.fill();x.strokeStyle='#29b6f6';x.lineWidth=2;x.beginPath();x.arc(-5,-1,4.5,0,7);x.moveTo(8.5,-1);x.arc(4,-1,4.5,0,7);x.stroke()}
 if(t=='mom'){[-7,0,7].forEach(q=>{rr(x,q-3,-15,6,8,3,'#f48fb1');ln(x,'#ad1457',1,q-3,-11,q+3,-11)})}
 if(t=='skate'){x.fillStyle='#1e88e5';x.beginPath();x.ellipse(0,-6,13,8,0,Math.PI,0);x.fill();rr(x,6,-8,14,4,2,'#1565c0')}
 if(t=='vac'){rr(x,-12,-12,24,5,2,'#5d4037');el(x,-5,-10,4,3,'#80deea');el(x,5,-10,4,3,'#80deea')}
 if(t=='basin'){el(x,8,-8,4,3,'#e1bee7');ln(x,'#8e24aa',1,6,-8,10,-8)}
 if(hp<.25&&t!='robo'){rr(x,-12,-12,24,5,2,'#f5f5f5');ln(x,'#e57373',1.5,-2,-12,-2,-7)}
 x.restore();
 if(o.raise||o.scared){rr(x,-10,hy-36,14,18,6,'#fff');x.fillStyle='#e53935';x.font='900 14px Nunito,sans-serif';x.textAlign='center';x.textBaseline='alphabetic';x.fillText('!',-3,hy-22)}
 if(o.soak>0&&t!='swim'&&t!='robo'){el(x,-16,hy+6,1.8,3,'#6ec3ff');el(x,10,hy+14,1.6,2.6,'#6ec3ff');el(x,-2,hy-16,1.6,2.6,'#6ec3ff')}}
function boxCat(x,o){const ph=o.ph||0,dm=1-(o.hpf??1),wob=Math.sin(ph)*.05;
 if(!o.noShadow)el(x,0,0,26,6,'rgba(0,0,0,.28)');for(let i=0;i<4;i++)el(x,-14+i*9+Math.sin(ph*2+i*1.7)*2.5,-2,3.6,2.6,'#6f7d5c');
 x.save();x.rotate(wob);x.translate(0,-Math.abs(Math.sin(ph))*2);
 const W=42,H=34,d=11,y0=-5-H,hit=o.hit>0;
 poly(x,hit?'#fff':'#a87a43',W/2,y0,W/2+d,y0-d*.7,W/2+d,-5-d*.7,W/2,-5);
 poly(x,hit?'#fff':'#dcae70',-W/2,y0,W/2,y0,W/2+d,y0-d*.7,-W/2+d,y0-d*.7);
 poly(x,'#f0d9a8',-W/2+d*.5+W*.42,y0-d*.35-2,-W/2+d*.5+W*.58,y0-d*.35-2,-W/2+d*.5+W*.58,y0-d*.35+2,-W/2+d*.5+W*.42,y0-d*.35+2);
 rr(x,-W/2,y0,W,H,1,hit?'#fff':'#c8955a');rr(x,-3,y0,6,10,0,'#e8cd97');
 x.fillStyle='#7a3d10';x.textAlign='center';x.textBaseline='alphabetic';x.font='900 8px Nunito,sans-serif';x.fillText('МЯУ-',0,y0+20);x.fillText('ЭКСПРЕСС',0,y0+28);
 el(x,-12,y0+31,4,2,'#7a3d10');poly(x,'#7a3d10',-8,y0+31,-5,y0+29,-5,y0+33);
 ln(x,'#7a3d10',1.2,12,y0+27,12,y0+22);ln(x,'#7a3d10',1.2,10,y0+24,12,y0+22,14,y0+24);
 rr(x,-12,y0+4,16,5,2,'#2b1a0e');if((ph*.9|0)%4)[-8,-1].forEach(q=>el(x,q,y0+6.5,1.6,1.6,'#d4ff6a'));
 if(dm>.3){el(x,8,y0+14,7,6,'rgba(70,50,30,.4)');el(x,-14,y0+26,5,4,'rgba(70,50,30,.35)')}
 if(dm>.6){poly(x,'#2b1a0e',W/2-12,y0,W/2,y0,W/2,y0+12);el(x,W/2-4,y0+6,1.6,1.6,'#d4ff6a')}
 x.restore()}
function ghostCat(x,o){const ph=o.ph||0,fl=Math.sin(ph*.8)*4;x.save();
 if(!o.noShadow)el(x,0,0,16,4,'rgba(120,200,255,.18)');x.globalAlpha*=o.hit>0?.95:.72;x.translate(0,-12+fl);
 x.shadowColor='#7fdcff';x.shadowBlur=14;
 const c=o.hit>0?'#ffffff':'#e3f4ff';
 x.fillStyle=c;x.beginPath();x.moveTo(-14,-22);x.quadraticCurveTo(-16,-2,-14,6);
 for(let i=0;i<4;i++){const bx=-14+i*7;x.quadraticCurveTo(bx+1.75,12+Math.sin(ph*3+i)*3,bx+3.5,6);x.quadraticCurveTo(bx+5.25,1,bx+7,6)}
 x.quadraticCurveTo(16,-2,14,-22);x.closePath();x.fill();
 ln(x,c,5,12,-10,22,-16+Math.sin(ph*2)*4,20,-28);
 x.shadowBlur=0;
 x.save();x.translate(-3,-30);poly(x,c,-13,-4,-11,-19,-3,-11);poly(x,c,13,-4,10,-19,2,-11);el(x,0,0,14,13,c);
 el(x,-5,-1,3.5,4.5,'#2a4a66');el(x,4,-1,3.5,4.5,'#2a4a66');el(x,-5,-1,1.4,1.6,'#7fdcff');el(x,4,-1,1.4,1.6,'#7fdcff');
 el(x,0,6,3,3.5,'#2a4a66');x.restore();
 ln(x,c,5,-8,-18,-20,-16+Math.sin(ph)*2);x.restore()}
function ownerCat(x,o){const ph=o.ph||0,st=o.eat?0:Math.sin(ph),bob=Math.abs(Math.cos(ph))*2,hit=o.hit>0;
 if(!o.noShadow)el(x,0,0,22,6,'rgba(0,0,0,.28)');
 ln(x,'#5c6bc0',7,-4,-32,-6+st*5,-4);ln(x,'#5c6bc0',7,4,-32,6-st*5,-4);el(x,-9+st*5,-3,8,4,'#f48fb1');el(x,3-st*5,-3,8,4,'#f48fb1');
 const robe=hit?'#fff':'#90a4ae';rr(x,-15,-70-bob,30,42,9,robe);for(let i=0;i<4;i++)ln(x,'#78909c',2,-13+i*8,-68-bob,-13+i*8,-30-bob);
 ln(x,'#b71c1c',3,-15,-46-bob,15,-46-bob);
 ln(x,robe,7,-8,-62-bob,-32,-60-bob+st*2);ln(x,'#ffccbc',5,-32,-60-bob+st*2,-38,-60-bob+st*2);
 ln(x,robe,7,6,-62-bob,-28,-54-bob-st*2);ln(x,'#ffccbc',5,-28,-54-bob-st*2,-34,-54-bob-st*2);
 const hy=-84-bob;el(x,-2,hy,12,13,hit?'#fff':'#ffccbc');el(x,8,hy+2,3,4,'#ffccbc');
 [-6,2].forEach(q=>{x.strokeStyle='#5d4037';x.lineWidth=1.2;x.beginPath();for(let a=0;a<12;a+=.5){const r=a*.28;x.lineTo(q+Math.cos(a+ph*3)*r,hy-1+Math.sin(a+ph*3)*r)}x.stroke()});
 el(x,-3,hy+7,2.5,3,'#5d2a1a');ln(x,'#9e9e9e',3,-12,hy-8,-14,hy-2);ln(x,'#9e9e9e',3,8,hy-8,10,hy-2);
 x.save();x.translate(0,hy-12);x.scale(.62,.62);
 const P=PAL.cat;ln(x,P[1],5,10,-6,24,-2,26,10);el(x,0,-4,14,11,P[0]);ln(x,P[0],5,-10,-2,-14,14);ln(x,P[0],5,8,-2,10,14);el(x,-14,14,3,3,P[1]);el(x,10,14,3,3,P[1]);
 x.translate(-2,-18);poly(x,P[0],-13,-4,-11,-19,-3,-11);poly(x,P[0],13,-4,10,-19,2,-11);el(x,0,0,13,12,P[0]);el(x,-5,-1,4.5,5,'#f4ffd0');el(x,-6,-1,2,2.4,'#111');ln(x,'#3a4a2e',2,2,-3,7,1);ln(x,'#3a4a2e',2,2,1,7,-3);ln(x,'#3a4a2e',1.4,-5,6,-2,4,1,6);
 x.restore()}
function bossCat(x,o){const ph=o.ph||0,hit=o.hit>0;
 if(!o.noShadow)el(x,0,0,74,14,'rgba(0,0,0,.32)');
 el(x,0,-14,74,22,'#263238');el(x,0,-20,70,18,hit?'#fff':'#546e7a');el(x,0,-25,60,13,'#78909c');el(x,0,-28,40,7,'#90a4ae');
 for(let i=0;i<6;i++)el(x,-50+i*20,-16,3,2,(i+(ph*4|0))%3==0?'#ff1744':'#ffeb3b');
 x.save();x.translate(-66,-8);x.rotate(ph*10);for(let i=0;i<4;i++){x.rotate(Math.PI/4);ln(x,'#5d4037',2,-10,0,10,0)}x.restore();
 x.globalAlpha*=.5;for(let i=0;i<3;i++)el(x,-80-i*8+Math.sin(ph*5+i)*3,-6-i*4,7-i,5-i,'#d7ccc8');x.globalAlpha/=.5;
 rr(x,-26,-46,52,18,6,'#b71c1c');rr(x,-26,-46,52,4,3,'#ef5350');
 x.save();x.translate(2,-40);x.scale(1.45,1.45);
 const pc=PAL.boss;el(x,0,-18,17,20,hit?'#fff':pc[0]);el(x,-4,-15,12,14,pc[2]);
 poly(x,'#c62828',-14,-30,16,-30,22,4,-20,4);poly(x,'#fff',-14,-30,16,-30,14,-26,-12,-26);
 x.translate(-4,-40);poly(x,pc[0],-14,-4,-12,-19,-3,-11);poly(x,pc[0],14,-4,11,-19,2,-11);el(x,0,4,16,9,pc[0]);el(x,0,0,15,14,hit?'#fff':pc[0]);
 el(x,-5,-1,5,5.5,'#fff3c4');el(x,-6,-1,2,2.5,'#111');ln(x,'#311b92',2,2,-3,7,1);ln(x,'#311b92',2,2,1,7,-3);ln(x,'#311b92',1.6,-6,8,-2,6,2,8,5,6);
 poly(x,'#ffc107',-11,-12,-11,-26,-6,-18,0,-30,6,-18,11,-26,11,-12);el(x,0,-20,2.2,2.2,'#e53935');el(x,-8,-16,1.5,1.5,'#29b6f6');el(x,8,-16,1.5,1.5,'#29b6f6');
 x.restore()}
function sleepyCat(x,col,ph){el(x,0,0,24,5,'rgba(0,0,0,.2)');el(x,0,-9,20,11,col);el(x,-14,-12,9,8,col);poly(x,col,-21,-16,-20,-24,-14,-18);poly(x,col,-11,-18,-8,-24,-7,-16);
 ln(x,'#3a2210',1.4,-18,-12,-15,-11);ln(x,'#3a2210',1.4,-12,-12,-9,-11);el(x,-13.5,-9,1.2,.9,'#d47a8a');
 x.strokeStyle=col;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(18,-6);x.quadraticCurveTo(26,4,4,2+Math.sin(ph)*1.5);x.stroke();
 const z=(ph*.6)%3;x.globalAlpha*=1-z/3;x.fillStyle='#fff';x.font='bold 10px Nunito,sans-serif';x.textAlign='left';x.fillText('z',-10+z*4,-26-z*6);x.globalAlpha=1}
function niceCat(x,col,o={}){const ph=o.ph||0;el(x,0,0,16,4,'rgba(0,0,0,.2)');
 x.strokeStyle=col;x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(10,-6);x.quadraticCurveTo(24,-10+Math.sin(ph*2)*4,18,-30+Math.sin(ph*2)*3);x.stroke();
 el(x,0,-12,12,13,col);el(x,-2,-8,6,8,'#fff3e0');el(x,0,-30,12,11,col);poly(x,col,-11,-34,-9,-46,-3,-38);poly(x,col,11,-34,9,-46,3,-38);poly(x,'#f8a5b5',-9,-36,-8,-43,-5,-38);poly(x,'#f8a5b5',9,-36,8,-43,5,-38);
 if(o.blink&&Math.sin(ph*1.3)>.95){ln(x,'#3a2210',1.5,-6,-31,-2,-31);ln(x,'#3a2210',1.5,2,-31,6,-31)}else{el(x,-4,-31,2.2,2.6,'#3a2210');el(x,4,-31,2.2,2.6,'#3a2210');el(x,-3.4,-32,.8,.8,'#fff');el(x,4.6,-32,.8,.8,'#fff')}
 el(x,0,-27,1.5,1.1,'#d47a8a');ln(x,'#3a2210',1,-2,-25,0,-24,2,-25);el(x,-7,-27,2.2,1.3,'rgba(240,120,140,.5)');el(x,7,-27,2.2,1.3,'rgba(240,120,140,.5)')}

/* ---------- grandma ---------- */
function drawGranny(x,o={}){const mood=o.mood||'angry',w=o.wave||0,item=o.item||'pin';
 el(x,0,34,30,20,'#6a1b9a');poly(x,'#8e24aa',-28,26,28,26,0,52);for(let i=0;i<5;i++)ln(x,'#ce93d8',1.2,-24+i*12,28,-20+i*10,46);
 el(x,0,24,10,5,'#f3e5f5');
 el(x,0,-2,20,22,'#d84315');
 el(x,0,0,15,16,'#f6c9a8');
 x.fillStyle='#d84315';x.beginPath();x.ellipse(0,-6,19,14,0,Math.PI,0);x.fill();
 [[-12,-12],[-4,-16],[5,-15],[12,-10],[-15,-3],[15,-2]].forEach(([a,b])=>el(x,a,b,1.6,1.6,'#fff3e0'));
 poly(x,'#bf360c',-6,16,6,16,0,24);el(x,-7,22,5,3,'#d84315');el(x,7,22,5,3,'#d84315');
 el(x,-13,-1,3,4,'#cfd8dc');el(x,13,-1,3,4,'#cfd8dc');
 const ang=mood=='angry';
 if(ang){ln(x,'#9e9e9e',3,-10,-8,-2,-5);ln(x,'#9e9e9e',3,10,-8,2,-5)}
 else if(mood=='shock'){ln(x,'#9e9e9e',2.5,-10,-11,-3,-12);ln(x,'#9e9e9e',2.5,10,-11,3,-12)}
 else{ln(x,'#9e9e9e',2.5,-9,-8,-3,-9);ln(x,'#9e9e9e',2.5,9,-8,3,-9)}
 x.strokeStyle='#5d4037';x.lineWidth=1.7;x.beginPath();x.arc(-5.5,0,4.6,0,7);x.moveTo(10.1,0);x.arc(5.5,0,4.6,0,7);x.moveTo(-1,0);x.lineTo(1,0);x.stroke();
 if(ang){ln(x,'#3a2210',1.8,-8,0,-3,1);ln(x,'#3a2210',1.8,8,0,3,1);el(x,-5,1,1.1,1.1,'#3a2210');el(x,5,1,1.1,1.1,'#3a2210');ln(x,'rgba(255,255,255,.8)',1.2,-8,-2,-6,-3.5)}
 else if(mood=='shock'){el(x,-5.5,0,2.4,2.8,'#fff');el(x,5.5,0,2.4,2.8,'#fff');el(x,-5.5,0,1.1,1.1,'#000');el(x,5.5,0,1.1,1.1,'#000')}
 else{ln(x,'#3a2210',1.6,-8,0,-5.5,-1.5,-3,0);ln(x,'#3a2210',1.6,3,0,5.5,-1.5,8,0)}
 el(x,0,5,2.6,2.2,'#e0a98a');el(x,-10,7,3.2,2,'rgba(240,120,120,.45)');el(x,10,7,3.2,2,'rgba(240,120,120,.45)');
 ln(x,'#c08a6a',1,-12,4,-10,5);ln(x,'#c08a6a',1,12,4,10,5);
 if(ang){rr(x,-5,9,10,3.5,1.5,'#fff');ln(x,'#5d2a1a',1.6,-6,9,6,9);ln(x,'#5d2a1a',1.4,-6,12.5,-8,14);ln(x,'#5d2a1a',1.4,6,12.5,8,14)}
 else if(mood=='shock')el(x,0,11,3,3.8,'#5d2a1a');
 else{x.strokeStyle='#5d2a1a';x.lineWidth=1.5;x.beginPath();x.arc(0,8,4.5,.3,Math.PI-.3);x.stroke()}
 x.save();x.translate(22,26);x.rotate(-1.2+Math.sin(w)*.35);rr(x,-4,-24,8,24,4,'#8e24aa');el(x,0,-25,5,5,'#f6c9a8');
 if(item=='pin'){x.save();x.translate(0,-26);x.rotate(.3);rr(x,-4,-30,8,40,4,'#c8955a');rr(x,-2.5,-38,5,9,2,'#8d5524');rr(x,-2.5,8,5,9,2,'#8d5524');ln(x,'#e6c48a',1,-2,-24,-2,4);x.restore()}
 else if(item=='slipper'){x.save();x.translate(0,-30);x.rotate(-.4);el(x,0,0,7,14,'#ec407a');el(x,0,-4,6,6,'#fff');x.restore()}
 x.restore();
 if(item=='knit'){ln(x,'#9e9e9e',1.5,-16,30,4,18);ln(x,'#9e9e9e',1.5,16,30,-4,18);el(x,0,30,9,6,'#26a69a');el(x,-18,40,6,6,'#ef5350')}}
