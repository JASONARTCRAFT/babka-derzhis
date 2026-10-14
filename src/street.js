/* ---------- street scenery ----------
 Top strip: distant city -> big street-front houses -> sidewalk. Road rows. Bottom strip: sidewalk -> foreground roofs with gateways.
 Board coordinates are unchanged; only static things move here, by skew and scale (no frame atlases). */
const hash1=n=>{n=Math.sin(n*127.1+311.7)*43758.5453;return n-Math.floor(n)};
const SKY={day:{s0:'#bcd0cc',s1:'#efe0c2',far:'#b3bccb',mid:'#97a3b6',win:'#d9dfe6',ink:'rgba(36,30,37,.22)'},
 dusk:{s0:'#5f5b8f',s1:'#f0b07c',far:'#8e7f9f',mid:'#6f6688',win:'#f6d98f',ink:'rgba(36,30,37,.28)'},
 night:{s0:'#232742',s1:'#4b3d5e',far:'#373c58',mid:'#2b2f47',win:'#f3d27e',ink:'rgba(0,0,0,.35)'}};
const swalk=()=>C*.34;
// Sway a sprite around its base with a horizontal skew: cheap "wind" for trees, grass and lamps.
function swayFit(ctx,key,cx,bottom,w,h,amp,phase){ctx.save();ctx.translate(cx,bottom);
 if(!RM){const t=performance.now()/1000;ctx.transform(1,0,Math.sin(t*1.3+phase)*amp,1+Math.sin(t*1.1+phase*1.7)*amp*.25,0,0)}
 const ok=comicFit(ctx,key,0,0,w,h);ctx.restore();return ok}
function skylineLayer(ctx,viewX,top,width,height,unit,par,col,win,ink,hmax,seed,night){
 const step=unit*.62,shift=viewX*(1-par),i0=Math.floor((viewX-shift)/step)-2,i1=Math.ceil((viewX+width-shift)/step)+2,base=top+height;
 for(let i=i0;i<=i1;i++){const r=hash1(i*3.17+seed),bw=step*(.78+r*.55),bh=height*hmax*(.38+hash1(i*7.31+seed)*.62),bx=i*step+shift;
  ctx.fillStyle=col;ctx.fillRect(bx,base-bh,bw,bh);
  const kind=hash1(i*1.91+seed*2);
  if(kind<.18){ctx.fillRect(bx+bw*.38,base-bh-unit*.22,bw*.24,unit*.22);ctx.fillRect(bx+bw*.47,base-bh-unit*.42,bw*.06,unit*.2)}
  else if(kind<.32){ctx.beginPath();ctx.moveTo(bx-1,base-bh);ctx.lineTo(bx+bw/2,base-bh-unit*.2);ctx.lineTo(bx+bw+1,base-bh);ctx.fill()}
  ctx.strokeStyle=ink;ctx.lineWidth=1.2;ctx.strokeRect(bx,base-bh,bw,bh);
  const ww=unit*.06,wh=unit*.08,gx=unit*.13,gy=unit*.16;
  let row=0;for(let y=base-bh+gy*.7;y<base-gy*.6;y+=gy,row++)for(let col=0,x=bx+gx*.55;x<bx+bw-ww-2;x+=gx,col++){const lit=hash1(i*13.7+row*7.31+col*3.97+seed);
   if(night?lit<.45:lit<.75){ctx.globalAlpha=night?.85:.45;ctx.fillStyle=win;ctx.fillRect(x,y,ww,wh)}}
  ctx.globalAlpha=1}}
function districtParallax(ctx,viewX,viewY,width,height,unit,time,night=false){
 const P=night=='dusk'?SKY.dusk:night?SKY.night:SKY.day;night=!!night&&night!=='dusk';ctx.save();ctx.beginPath();ctx.rect(viewX,viewY,width,height);ctx.clip();
 ctx.fillStyle=lgrad(ctx,0,viewY,0,viewY+height,[[0,P.s0],[1,P.s1]]);ctx.fillRect(viewX,viewY,width,height);
 if(night)for(let i=0;i<24;i++){const sx=viewX+((hash1(i)*width*1.3-viewX*.02)%width+width)%width;el(ctx,sx,viewY+hash1(i+9)*height*.45,1,1,'rgba(255,248,220,.7)')}
 else{const sx=viewX+width*.82-viewX*.01;el(ctx,sx,viewY+height*(P===SKY.dusk?.55:.26),unit*(P===SKY.dusk?.45:.28),unit*(P===SKY.dusk?.45:.28),P===SKY.dusk?'rgba(255,214,150,.9)':'rgba(255,244,205,.85)')}
 for(let i=0;i<7;i++){const span=width+unit*6,px=viewX+(((i*unit*3.3+time*unit*.07-viewX*.08)%span)+span)%span-unit*3;
  ctx.globalAlpha=night?.12:.55;comicFit(ctx,'prop-cloud',px,viewY+height*(.3+(i%3)*.07),unit*1.8,unit*.55)}
 ctx.globalAlpha=1;
 skylineLayer(ctx,viewX,viewY,width,height,unit,.08,P.far,P.win,P.ink,.78,11,night);
 ctx.fillStyle=lgrad(ctx,0,viewY+height*.4,0,viewY+height,[[0,'rgba(239,224,194,0)'],[1,night?'rgba(75,61,94,.55)':'rgba(239,224,194,.5)']]);ctx.fillRect(viewX,viewY,width,height);
 skylineLayer(ctx,viewX,viewY,width,height,unit,.22,P.mid,P.win,P.ink,.52,47,night);
 // A row of distant treetops softens the skyline base.
 const ts=unit*1.1,tsh=viewX*.6;ctx.filter=night?'brightness(.5) saturate(.6)':'saturate(.55) brightness(1.08)';
 for(let i=Math.floor((viewX-tsh)/ts)-1;i<Math.ceil((viewX+width-tsh)/ts)+1;i++){if(hash1(i*4.7)<.45)continue;ctx.globalAlpha=.8;
  swayFit(ctx,'prop-tree',i*ts+tsh+hash1(i)*ts*.4,viewY+height+unit*.06,unit*.5,unit*(.32+hash1(i+3)*.18),.015,i)}
 ctx.filter='none';ctx.globalAlpha=1;ctx.restore()}
function paveBand(ctx,x0,x1,y,h,curbTop){rr(ctx,x0,y,x1-x0,h,0,'#d8cdb2');
 const k=C*.42;for(let x=Math.floor(x0/k)*k;x<x1;x+=k)ln(ctx,'rgba(130,118,96,.35)',1,x,y+2,x,y+h-2);
 ln(ctx,'rgba(130,118,96,.3)',1,x0,y+h*.5,x1,y+h*.5);
 const cy=curbTop?y+h-C*.05:y;rr(ctx,x0,cy,x1-x0,C*.05,0,'#a49b88')}
// Foreground city roofs seen from above: flat tar roofs with parapets, vents, chimneys and skylights.
const ROOF_COL=[['#7d7280','#968b98'],['#8a6f62','#a3877a'],['#66727a','#7f8b93'],['#7a7a62','#93937a']];
function roofStrip(ctx,x0,x1,y,h,seed){const ink='#241e25';
 ctx.save();ctx.beginPath();ctx.rect(x0,y,x1-x0,h);ctx.clip();
 let x=x0,i=0;while(x<x1){const r=hash1(seed*1.7+i*3.3),w=C*(1.1+r*1.4),[base,lite]=ROOF_COL[Math.floor(hash1(seed+i)*4)];
  rr(ctx,x,y,w,h,0,lite);rr(ctx,x+C*.07,y+C*.07,w-C*.14,h-C*.11,2,base);
  ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
  ctx.strokeStyle='rgba(36,30,37,.18)';ctx.lineWidth=1;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(x+C*.08,y+h*k/4);ctx.lineTo(x+w-C*.08,y+h*k/4+1);ctx.stroke()}
  const kind=hash1(seed*5+i*1.3),px=x+w*(.2+hash1(i+seed)*.5),py=y+h*.32;
  if(kind<.35){rr(ctx,px,py-C*.12,C*.18,C*.26,2,'#a45a44');ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.strokeRect(px,py-C*.12,C*.18,C*.26);rr(ctx,px+C*.03,py-C*.09,C*.12,C*.07,1,'#2b2224')}
  else if(kind<.6){rr(ctx,px,py,C*.34,C*.22,3,'#c9d7da');ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.strokeRect(px,py,C*.34,C*.22);ln(ctx,'#8fa6ad',1.5,px+C*.17,py+2,px+C*.17,py+C*.2)}
  else if(kind<.8){el(ctx,px,py+C*.08,C*.1,C*.1,'#b9b7ad');ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px,py+C*.08,C*.1,0,7);ctx.stroke();el(ctx,px,py+C*.08,C*.04,C*.04,'#4d4a48')}
  else{rr(ctx,px,py,C*.26,C*.2,2,'#9aa3a6');ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.strokeRect(px,py,C*.26,C*.2);for(let k=0;k<3;k++)ln(ctx,'#5e676a',1,px+C*.04,py+C*(.05+k*.05),px+C*.22,py+C*(.05+k*.05))}
  x+=w;i++}
 ctx.restore();ln(ctx,'#2b2328',2.5,x0,y,x1,y)}
// Back yards: ground, a neighbour fence and trees; the far city starts above it.
function backYards(x0,x1,y,h){comicGround(g,'lawn-tile',x0,y,x1-x0,h,C*3,'#879544');g.fillStyle='rgba(40,52,24,.18)';g.fillRect(x0,y,x1-x0,h);
 const fy=y+h*.32,k=C*.32;rr(g,x0,fy-C*.2,x1-x0,C*.06,0,'#9c7a55');rr(g,x0,fy-C*.06,x1-x0,C*.06,0,'#9c7a55');
 for(let x=Math.floor(x0/k)*k;x<x1;x+=k){rr(g,x,fy-C*.3,C*.07,C*.36,1,'#b48d63');ln(g,'rgba(36,30,37,.45)',1,x,fy-C*.3,x,fy+C*.06)}
 ln(g,'rgba(36,30,37,.4)',1.5,x0,fy+C*.06,x1,fy+C*.06);
 const ts=C*1.35;for(let i=Math.floor(x0/ts);i<x1/ts;i++){if(hash1(i*2.3+S.i)<.35)continue;swayFit(g,'prop-tree',i*ts+hash1(i)*ts*.5,fy+C*.12,C*.9,C*.95,.012,i)}}
function gateway(ctx,x,y,w,h){rr(ctx,x,y,w,h,0,'#3a3036');rr(ctx,x+w*.12,y,w*.76,h,0,'#221b20');
 ctx.fillStyle='rgba(255,230,160,.06)';ctx.fillRect(x+w*.12,y,w*.76,h*.35);ln(ctx,'#14100f',2,x,y,x+w,y)}
function drawOverheadField(){
 const rt=FY(0),rb=FY(S.rows),sw=swalk(),cr=S.lv.cross||[],night=S.lv.night,gx=FX(YC),xr=Math.max(WW,camX+VW)+C;
 // Garden lawn (left) and the asphalt street (right).
 comicGround(g,'lawn-tile',0,rt-sw,gx,FH-TOPH+sw,C*3,'#879544');
 comicGround(g,'road-tile',gx,rt,xr-gx,S.rows*C,C*3,'#777078');
 for(let r=0;r<S.rows;r++)for(let c=0;c<YC;c++){
  g.fillStyle=(r+c)%2?'rgba(255,244,181,.09)':'rgba(34,43,21,.065)';g.fillRect(FX(c),FY(r),C,C);
  g.strokeStyle='rgba(46,55,30,.13)';g.lineWidth=1;g.strokeRect(FX(c),FY(r),C,C)}
 const pathX=X0-C*.6;rr(g,pathX,rt,C*.6,S.rows*C,1,'#c5ba97');
 for(let r=0;r<S.rows;r++)ln(g,'#a4987c',1.2,pathX,FY(r)+C*.5,X0,FY(r)+C*.5);
 rr(g,gx-C*.09,rt,C*.18,S.rows*C,2,'#d2c8ae');
 g.setLineDash([C*.3,C*.25]);for(let r=1;r<S.rows;r++)ln(g,'rgba(249,231,204,.4)',2,gx+C*.2,FY(r),xr,FY(r));g.setLineDash([]);
 // Road wear: manholes, oil stains and leaves at fixed spots per level.
 for(let c=YC+1;c<COLS;c++){const h=hash1(c*5.3+S.i),r=Math.floor(hash1(c*2.1+S.i)*S.rows);if(cr.includes(c))continue;
  if(h<.16)comicFit(g,'prop-manhole',FX(c+.5),FY(r)+C*.68,C*.36,C*.26);
  else if(h<.34){g.fillStyle='rgba(40,34,44,.18)';g.beginPath();g.ellipse(FX(c+.4),FY(r)+C*.6,C*.22,C*.09,.3,0,7);g.fill()}
  else if(h<.5){for(let k=0;k<3;k++)el(g,FX(c+hash1(c+k)),FY(r)+C*hash1(c*3+k),C*.035,C*.02,['#c98a45','#a6763c','#d3a052'][k])}}
 // Sky with the distant city, then a strip of back yards so nothing stands in the air.
 const yb=rt-sw-C*.85;districtParallax(g,camX,oy,VW,yb-oy,C,districtTime(),night);
 backYards(0,xr,yb,rt-sw-yb);
 // Sidewalks along the street.
 paveBand(g,gx,xr,rt-sw,sw,true);paveBand(g,gx,xr,rb,C*.46,false);
 // Babka's garden is fenced by hedges; the street side has none.
 comicHedge(g,X0-C*.35,rt-sw*1.05,gx-X0+C*.35,sw*1.05);
 comicHedge(g,X0-C*.35,rb+C*.04,gx-X0+C*.35,C*.42);
 lawnDecor(rt,rb);
 streetFront(rt,sw);
 foregroundRoofs(rb+C*.46,FH-S.rows*C-TOPH-C*.46);
 cr.forEach(c=>{comicGround(g,'road-tile',FX(c),oy,C,FH+C*4,C*3,'#777078');for(let y=rt+C*.1;y<rb;y+=C*.28)rr(g,FX(c)+C*.12,y,C*.76,C*.13,0,'#eee2ca')});
 drawHome();
 (S.lv.pipes||[]).forEach(([r,c])=>{g.save();g.translate(FX(c+.22),FY(r)+C*.9);g.scale(C/72*.8,C/72*.8);drawHydrant(g);g.restore()});
 S.wglow.forEach(w=>{const a=Math.min(1,w.life*3);g.fillStyle=w.lv>1?'rgba(206,147,216,'+(.35*a)+')':'rgba(255,245,157,'+(.35*a)+')';g.fillRect(FX(w.c0),FY(w.r)+C*.2,(w.c1-w.c0)*C,C*.6)});
 drawDoors();
 if(night){g.fillStyle='rgba(20,24,57,.35)';g.fillRect(0,oy,xr,FH+C*4);
  (S.lv.poles||[]).forEach(([r,c])=>{const px=FX(c+.8),py=FY(r)+C*.4;g.fillStyle=rgrad(g,px,py,0,C*1.4,[[0,'rgba(255,229,161,.24)'],[1,'rgba(255,229,161,0)']]);g.fillRect(px-C*1.4,py-C*1.4,C*2.8,C*2.8)});
  streetLamps(rt,sw,true)}}
function lawnDecor(rt,rb){
 for(let r=0;r<S.rows;r++)for(let c=0;c<YC;c++){const h=hash1(r*31+c*7+S.i*3);if(h>.3)continue;
  const x=FX(c+(h<.15?.1:.9)),y=FY(r)+C*(h<.08?.12:.95);g.globalAlpha=.85;swayFit(g,'prop-grass',x,y,C*.2,C*.12,.08,r+c);g.globalAlpha=1}
 swayFit(g,'prop-grass',X0-C*.45,rt+C*.2,C*.24,C*.14,.08,1);comicFit(g,'prop-rocks',X0-C*.1,rb-C*.02,C*.22,C*.16)}
// New flat-front houses (front-house-1..8) on both sides of the road; the old pitched-roof shops are retired.
const BUILD_KEYS=[1,2,3,4,5,6,7,8].map(n=>'front-house-'+n);
function streetFront(rt,sw){const base=rt-sw*.6,maxH=rt-sw*.6-oy-C*.08;S.doorAt=S.doorAt||{};
 S.houses.forEach((h,i)=>{const key=BUILD_KEYS[(i*3+S.i)%BUILD_KEYS.length],s=COMIC_SPRITES[key];if(!s)return;
  const slot=h.w*C,sc=Math.min(slot*.96/s.w,maxH/s.h),w=s.w*sc,spare=slot-w;
  // A zombie door inside this lot: shift the house so its painted front door sits on that column.
  const di=S.lv.doors.findIndex(d=>d.s=='t'&&d.c>=h.c0&&d.c<h.c0+h.w),nk=key+'-night',has=k=>COMIC_SPRITES[k]?.image.naturalWidth;
  let cx=FX(h.c0+h.w/2),drawKey=S.lv.night&&has(nk)?nk:key;
  if(di>=0){cx=clamp(FX(S.lv.doors[di].c+.5),FX(h.c0)+w/2,FX(h.c0+h.w)-w/2);
   // Active house: open-door art when it exists; the door anchor comes from the manifest ("door":[x,y] in source pixels).
   if(has(drawKey+'-open'))drawKey+='-open';
   S.doorAt[di]=doorAnchor(drawKey,cx,base,sc)||{x:cx,y:base-s.h*sc*.14,w:w*.12,h:s.h*sc*.15,code:drawKey==key}}
  // Leftover width becomes a yard with a tree, so houses never float in empty lawn.
  if(spare>C*.5){const side=cx-FX(h.c0)>FX(h.c0+h.w)-cx?-1:1,tx=cx+side*(w/2+spare/4);swayFit(g,'prop-tree',tx,base+C*.04,Math.min(spare*.55,C*1.1),C*1.15,.02,i)}
  comicFit(g,drawKey,cx,base,w,s.h*sc);
  const pk=hash1(i*9+S.i);if(pk<.5)comicFit(g,pk<.25?'prop-bin':'prop-crate',FX(h.c0)+C*.22,rt-sw*.12,C*.24,C*.28);
  else if(pk<.7)comicFit(g,'prop-mailbox',FX(h.c0+h.w)-C*.2,rt-sw*.1,C*.18,C*.36)});
 streetLamps(rt,sw,false)}
// Door centre of a sprite placed with comicFit(cx,bottom) at scale sc; null if the manifest has no door.
function doorAnchor(key,cx,bottom,sc){const s=COMIC_SPRITES[key];if(!s?.door)return null;
 return{x:cx-s.w*sc/2+(s.door[0]-s.x)*sc,y:bottom-s.h*sc+(s.door[1]-s.y)*sc,w:s.w*sc*.1,h:s.h*sc*.12,code:false}}
function streetLamps(rt,sw,glow){for(let c=YC+1;c<COLS;c+=4){if((S.lv.cross||[]).includes(c))continue;const x=FX(c)+C*.05,y=rt-C*.04;
 if(glow){g.fillStyle=rgrad(g,x,y-C*.95,0,C*1.1,[[0,'rgba(255,229,161,.32)'],[1,'rgba(255,229,161,0)']]);g.fillRect(x-C*1.1,y-C*2,C*2.2,C*2.4)}
 else comicFit(g,'prop-lamp',x,y,C*.24,C*1.05)}}
function foregroundRoofs(y,h){if(COMIC_SPRITES['front-house-1']?.image.naturalWidth)return frontHouses(y,h);const gx=0,xr=Math.max(WW,camX+VW)+C,doors=S.lv.doors.filter(d=>d.s=='b').map(d=>d.c),cr=S.lv.cross||[];
 h=Math.max(h,C*.5);
 // One continuous terrace of roofs, cut by gateways (zombie doors) and crossings.
 const cuts=[...doors,...cr].sort((a,b)=>a-b);let x=gx;
 cuts.forEach(c=>{const cx0=FX(c),cx1=FX(c+1);if(cx0>x)roofStrip(g,x,cx0,y,h,c+S.i);if(!cr.includes(c))gateway(g,cx0,y,cx1-cx0,h);x=cx1});
 if(x<xr)roofStrip(g,x,xr,y,h,99+S.i);
 // A thin margin below in case of rounding; the camera never shows more (see minZoom).
 roofStrip(g,gx,xr,y+h,C*.6,13+S.i)}
// Near side of the road: a row of houses (front-house-1..8), open where cats come out, yards between them.
function frontHouses(y,h){const xr=Math.max(WW,camX+VW)+C,night=S.lv.night,doors=S.lv.doors.map((d,i)=>[d,i]).filter(([d])=>d.s=='b');
 const keys=[1,2,3,4,5,6,7,8].map(n=>'front-house-'+n).filter(hasSprite),bt=y+h+C*.04;S.doorAt=S.doorAt||{};
 const variant=(k,open)=>{let v=k+(night&&hasSprite(k+'-night')?'-night':'');if(open&&hasSprite(v+'-open'))v+='-open';return v};
 // Near-side houses are turned 180° so their fronts (and doors) face the road.
 const top0=y+C*.02,put=(key,cx,w,di)=>{const s=COMIC_SPRITES[key],sc=Math.min(w/s.w,(h+C*.04)/s.h);
  g.save();g.translate(cx,top0);g.rotate(Math.PI);comicFit(g,key,0,0,s.w*sc,s.h*sc);g.restore();
  if(di!=null){const lx=s.door?-s.w*sc/2+(s.door[0]-s.x)*sc:0,ly=s.door?-s.h*sc+(s.door[1]-s.y)*sc:-C*.3;
   S.doorAt[di]={x:cx-lx,y:top0-ly,w:s.w*sc*.1,h:s.h*sc*.12,code:!s.door}}};
 // Open houses sit exactly on their door columns; the gaps between them are packed with closed houses, leftovers with yards.
 const W=C*2,opens=doors.map(([d,di])=>({cx:FX(d.c+.5),di})).sort((a,b)=>a.cx-b.cx),fill=(a,b,seed)=>{let n=Math.floor((b-a)/W),x=a+((b-a)-n*W)/2;
  for(let q=a;q<x-1;q+=C*.5)comicFit(g,'front-gap-yard',q+C*.25,bt,C*.5,h+C*.04);
  for(let q=x+n*W;q<b-1;q+=C*.5)comicFit(g,'front-gap-yard',q+C*.25,bt,C*.5,h+C*.04);
  for(let k=0;k<n;k++){const hx=x+k*W+W/2,idx=Math.floor(hx/W);put(variant(keys[(idx*3+S.i)%keys.length],false),hx,W*.98,null);
   const pk=hash1(idx*7.7+S.i);if(hx>FX(YC)&&pk<.4)comicFit(g,['front-prop-bench','front-prop-bin','front-prop-bike','front-prop-planter'][Math.floor(pk*10)%4],hx,y-C*.02,C*.5,C*.36)}};
 let x=0;opens.forEach((o,k)=>{fill(x,o.cx-W/2,k);put(variant(keys[(Math.floor(o.cx/W)*3+S.i+1)%keys.length],true),o.cx,W*.98,o.di);x=o.cx+W/2});fill(x,xr,99)}
function districtBuildings(){}function districtProps(){}
