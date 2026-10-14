/* Generated comic sprites. Sources: assets/comic/*.webp. */
const COMIC_SPRITES={};
let comicSpritesReady=false;
// Badly cut art waits for a re-cut from the uncut packs (see ASSETS-AUDIT.md); the game uses fallbacks meanwhile.
const ART_BROKEN=new Set();
function comicSprite(ctx,key,left,top,width,height){
 const s=ART_BROKEN.has(key)?null:COMIC_SPRITES[key];if(!s||!s.image.complete||!s.image.naturalWidth)return false;
 ctx.drawImage(s.image,s.x,s.y,s.w,s.h,left,top,width,height);return true}
function comicFit(ctx,key,cx,bottom,maxWidth,maxHeight){
 const s=COMIC_SPRITES[key];if(!s||!s.image.complete||!s.image.naturalWidth)return false;
 const scale=Math.min(maxWidth/s.w,maxHeight/s.h);
 return comicSprite(ctx,key,cx-s.w*scale/2,bottom-s.h*scale,s.w*scale,s.h*scale)}
const hasSprite=k=>!ART_BROKEN.has(k)&&!!COMIC_SPRITES[k]?.image.naturalWidth;
// Upgraded devices have their own art; the key depends on type and level.
function unitKey(t,lv){lv=lv||1;
 if(t=='wheel')return lv>1&&hasSprite('wheel-gold')?'wheel-gold':'wheel';
 if(t=='ball')return lv>=3&&hasSprite('ball-launcher-3')?'ball-launcher-3':lv==2&&hasSprite('ball-launcher-2')?'ball-launcher-2':'ball-launcher';
 if((t=='spr'||t=='shock')&&lv>1&&hasSprite(t+'-2'))return t+'-2';return t}
// Muzzle points in local units (sprite fitted 58x60, feet at 0,0), measured on the art.
const MUZZLE={'ball-launcher':[[22,-39]],'ball-launcher-2':[[20,-47],[23,-34]],'ball-launcher-3':[[15,-54],[20,-42],[23,-30]],
 spr:[[26,-47]],'spr-2':[[12,-32]],shock:[[27,-35]],'shock-2':[[6,-50]],laser:[[22,-39]]};
function muzzle(t,lv){return MUZZLE[unitKey(t,lv)]||MUZZLE[t]||[[22,-39]]}
function comicUnit(ctx,u){
 const key=unitKey(u.t,u.lv);if(!COMIC_SPRITES[key]?.image.naturalWidth)return false;
 const ph=u.ph||0,lv=u.lv||1;ctx.save();
 // Procedural life: pop-in, breathing, recoil and hurt squash. Origin is at the feet, so scale keeps them planted.
 const anim=!RM,f=Math.max(0,u.fire||0);let sx=1,sy=1,rot=0,dx=0,dy=0;
 if(anim){
  if(u.pop!=null&&u.pop<.4){const q=u.pop/.4,b=1+2.2*Math.pow(q-1,3)+1.2*Math.pow(q-1,2);sx*=b;sy*=b}
  const br=Math.sin(ph*2.2+(u.c||0));sy*=1+br*.022;sx*=1-br*.014;
  if(u.hurt>0){sx*=1.06;sy*=.94;dx+=(Math.random()-.5)*2}
  if(u.t=='ball'&&f>0){const k=f/.18;sx*=1+k*.12;sy*=1-k*.1;dx-=k*4}
  if(u.t=='spr'&&f>0){rot+=Math.sin(ph*28)*.035;sy*=1+Math.sin(ph*14)*.03}
  if(u.t=='shock'){if(f>0){dx+=(Math.random()-.5)*2.5;sx*=1+f*.25;sy*=1+f*.25}else rot+=Math.sin(ph*9)*.006}
  if(u.t=='cuc'){const sp=Math.sin(ph*3.4);sy*=1+sp*.06;sx*=1-sp*.03;rot+=Math.sin(ph*1.7)*.05}
  if(u.t=='laser')rot+=Math.sin(ph*1.3)*.03;
  if(u.t=='yarn'){rot+=Math.sin(ph*(u.on?9:2))*(u.on?.12:.04)}
  if(u.t=='mine'){if(u.arm>0){sy*=.92+Math.sin(ph*1.5)*.02}else{const t=Math.max(0,Math.sin(ph*7));sx*=1+t*.04;sy*=1+t*.05}}
  if(u.t=='fence'&&u.hp/u.max<.35)rot-=.06;
  if(u.t=='wheel'){const w=Math.sin(ph*2.4);sy*=1+w*.025;sx*=1-w*.015}}
 if(u.hurt>0)ctx.globalAlpha*=.75;
 if(u.t=='yarn'&&u.on){const k=Math.max(.45,u.on/5);sx*=k;sy*=k}
 ctx.translate(dx,dy);ctx.rotate(rot);ctx.scale(sx,sy);
 comicFit(ctx,key,0,0,58,u.t=='cuc'?63:60);
 if(lv>1){rr(ctx,14,-13,16,12,3,'#ffdb67');ctx.fillStyle='#1d181d';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(lv,22,-3)}
 if(u.t=='shock'&&u.fire>0){const [mx,my]=muzzle('shock',lv)[0];ln(ctx,'#ffe974',2.5,mx-6,my-10,mx+3,my-5,mx-3,my+1,mx+7,my+6)}
 if(u.t=='spr'&&u.fire>0){const [mx,my]=muzzle('spr',lv)[0];for(let i=0;i<3;i++)el(ctx,mx+2+i*5,my+1+i*3,1.5,2.5,'#9bdbed')}
 if(u.t=='laser'){ln(ctx,'#e8495f',1.5,23,-39,34,-39)}
 if(u.t=='mine'&&!(u.arm>0)){el(ctx,14,-39,2+Math.sin(ph*5),2,'#f2cb55')}
 ctx.restore();return true}
// Fit box (local units) per zombie type; feet at 0,0, facing left.
const ZFIT={cat:[58,42],kit:[40,30],fat:[74,56],ath:[58,44],mom:[60,46],lead:[62,48],skate:[58,44],swim:[62,44],basin:[60,46],vac:[64,48],
 box:[54,46],ghost:[62,50],robo:[64,48],owner:[50,96],boss:[150,96],thief:[52,30]};
function zombieKey(o){const t=o.type;
 if(t=='vac'&&o.off||t=='basin'&&!(o.arm>0))return 'zombie-cat';
 return hasSprite('zombie-'+t)?'zombie-'+t:null}
function comicZombie(ctx,o){const key=zombieKey(o);if(!key)return false;
 const type=key.slice(7),ph=o.ph||0,still=o.eat||o.dying,[fw,fh]=ZFIT[type]||ZFIT.cat,step=RM||still?0:Math.sin(ph*.45*Math.PI);
 ctx.save();if(!o.noShadow)el(ctx,0,0,fw*.42,4.5*fw/58,type=='ghost'?'rgba(120,200,255,.18)':'rgba(0,0,0,.24)');
 let lift=0;if(o.type=='skate'&&!o.off){comicFit(ctx,'zombie-skate-board',0,1,fw*.9,12);lift=-7}
 if(type=='ghost'){lift=-10+Math.sin(ph*.8)*4;ctx.globalAlpha*=o.hit>0?.95:.82}
 ctx.translate(0,lift-(still?0:Math.abs(step)*1.4));ctx.rotate(still?0:step*.02);
 // Calm procedural gait: a soft squash on each step instead of extra frames (base cat keeps its 2 slow frames).
 if(o.hit>0&&!RM)ctx.scale(1.09,.92);else if(!RM&&!o.dying)ctx.scale(1-Math.abs(step)*.025,1+Math.abs(step)*.035);
 if(o.hit>0)ctx.filter='brightness(1.6)';else if(o.soak>0&&type!='swim')ctx.filter='saturate(.7) brightness(.92)';else if(o.rust>0&&type=='robo')ctx.filter='sepia(.6)';
 const k=type=='cat'&&!still&&!RM&&hasSprite('zombie-walk-0')?'zombie-walk-'+(Math.floor(ph*.45)%2)*2:key;
 comicFit(ctx,k,0,0,fw,fh);ctx.filter='none';
 if(o.soak>0&&type!='swim'&&type!='robo')[[-14,-fh*.7],[8,-fh*.9],[-2,-fh*.55]].forEach(([a,b])=>el(ctx,a,b,1.7,2.8,'#6ec3ff'));
 if(o.raise||o.scared){rr(ctx,-8,-fh-20,14,17,6,'#fff');ctx.fillStyle='#e53935';ctx.font='900 13px Nunito,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText('!',-1,-fh-7)}
 ctx.restore();return true}


/* Overhead comic environment; board coordinates stay unchanged. */
const COMIC_TILES=new Map();
function comicGround(ctx,key,x,y,w,h,tileSize,fallback){
 const s=COMIC_SPRITES[key];if(!s?.image.naturalWidth){ctx.fillStyle=fallback;ctx.fillRect(x,y,w,h);return}
 const cacheKey=key+':'+Math.round(tileSize);let tile=COMIC_TILES.get(cacheKey);
 if(!tile){tile=document.createElement('canvas');tile.width=tile.height=Math.max(32,Math.round(tileSize));comicSprite(tile.getContext('2d'),key,0,0,tile.width,tile.height);COMIC_TILES.set(cacheKey,tile)}
 ctx.save();ctx.translate(x,y);ctx.fillStyle=ctx.createPattern(tile,'repeat');ctx.fillRect(0,0,w,h);ctx.restore()}
function comicHedge(ctx,x,y,w,h){
 for(let px=x;px<x+w;px+=h*6){const part=Math.min(h*6,x+w-px);ctx.save();ctx.beginPath();ctx.rect(px,y,part,h);ctx.clip();
 if(!comicSprite(ctx,'hedge',px,y,h*6,h)){rr(ctx,px,y,part,h,10,'#667c43')}ctx.restore()}}
function overheadRoof(ctx,x,y,w,h){
 if(comicSprite(ctx,'house-roof',x,y,w,h))return;
 poly(ctx,'#914950',x,y+h*.04,x+w*.86,y,x+w,y+h*.93,x+w*.15,y+h);
 ln(ctx,'#33272d',3,x+w*.46,y,x+w*.57,y+h*.95);
 for(let i=1;i<12;i++)ln(ctx,'#693f47',1,x,y+h*i/12,x+w,y+h*i/12)}
function drawOverheadHome(){
 const right=X0-C*.63;overheadRoof(g,-C*.16,oy+C*.02,right+C*.16,FH-C*.04);
 // A short entrance path under the roof edge; no repeated facade/windows.
 const y=FY(S.rows)-C*.35;rr(g,right-C*.02,y,C*.62,C*.24,2,'#d2c6ac');
 ln(g,'#8a8272',1,right,y+C*.1,X0,y+C*.1)}


/* Atlas animation and layered district scenery. */
function comicAnimation(ctx,group,seconds,cx,bottom,w,h,moving=true){
 const frame=RM||!moving?0:(Math.floor(seconds*2)%2)*2;return comicFit(ctx,group+'-'+frame,cx,bottom,w,h)}
function districtTime(){return performance.now()/1000}
// COMIC_DATA (bounds and door anchors) is generated from assets/comic/manifest.json by build.sh; images load from assets/comic/.
const comicLoading=Object.entries(COMIC_DATA).map(([key,data])=>new Promise(resolve=>{
 const image=new Image();COMIC_SPRITES[key]={...data,image};image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=data.src||('assets/comic/'+data.file)}));
Promise.all(comicLoading).then(()=>{comicSpritesReady=true;
 if(typeof renderIcon==='function'){
 document.querySelectorAll('.card[data-k] canvas').forEach(c=>renderIcon(c,iconKind(c.parentElement.dataset.k),c.parentElement.dataset.k));
 document.querySelectorAll('canvas[data-k]').forEach(c=>renderIcon(c,iconKind(c.dataset.k),c.dataset.k));
 const money=document.querySelector('#money canvas');if(money){const x=money.getContext('2d');x.clearRect(0,0,money.width,money.height);drawCoin(x,30,30,24,true)}
 }});
