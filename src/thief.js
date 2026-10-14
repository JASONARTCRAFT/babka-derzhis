/* ---------- kitten thief ----------
 A small kitten runs out of a house door, grabs a coin lying on the ground and runs back.
 Tap it and the coin drops back. No messages: everything is visible on the street. */
const THIEF={run:2.6,flee:2,grab:.5,tap:.5};
function setupThieves(i){S.thieves=[];S.thiefPlan=[];if(i<3)return;
 const end=S.spawns.length?S.spawns[S.spawns.length-1].t:60,R=rng(i*331+7),n=i>=7?2:1;
 for(let k=0;k<n;k++)S.thiefPlan.push({t:end*(n==1?.45:.3+k*.4)+R()*8,d:Math.floor(R()*S.lv.doors.length)})}
function thiefDoor(di){const d=S.lv.doors[di],at=S.doorAt&&S.doorAt[di];
 return at?{x:at.x,y:at.y+C*.1}:{x:FX(d.c+.5),y:d.s=='t'?FY(0)-C*.15:FY(S.rows)+C*.55}}
function thiefCoin(th){const free=S.coins.filter(c=>!c.fly&&!c.done&&!c.thief);if(!free.length)return null;
 const c=free.sort((a,b)=>Math.hypot(a.x-th.x,a.ground-th.y)-Math.hypot(b.x-th.x,b.ground-th.y))[0];c.thief=th;return c}
function updThieves(dt){if(!S.thieves)return;
 // A planned thief waits until there is a coin to steal.
 if(S.phase=='play'&&S.thiefPlan.length&&S.thiefPlan[0].t<=S.t&&S.coins.some(c=>!c.fly&&!c.done)){const p=S.thiefPlan.shift(),h=thiefDoor(p.d);
  S.doorOpen[p.d]=1.3;const th={x:h.x,y:h.y,home:h,state:'run',ph:0,t:0,coin:null,loot:null};th.coin=thiefCoin(th);S.thieves.push(th)}
 S.thieves.forEach(th=>{th.ph+=dt;th.t+=dt;
  if(th.state=='run'){const c=th.coin;
   if(!c||c.done||c.fly){th.coin=thiefCoin(th);if(!th.coin){th.state='flee'}return}
   const dx=c.x-th.x,dy=c.ground-th.y,d=Math.hypot(dx,dy),st=THIEF.run*C*dt;th.dir=Math.sign(dx)||th.dir||-1;
   if(d<=st){th.x=c.x;th.y=c.ground;th.state='grab';th.t=0}else{th.x+=dx/d*st;th.y+=dy/d*st}}
  else if(th.state=='grab'){if(th.t>=THIEF.grab){const c=th.coin;if(c&&!c.done&&!c.fly){c.done=1;th.loot={val:c.val,gold:c.gold}}th.state='flee'}}
  else{const h=th.home,dx=h.x-th.x,dy=h.y-th.y,d=Math.hypot(dx,dy),st=(th.state=='scared'?THIEF.run*1.3:THIEF.flee)*C*dt;th.dir=Math.sign(dx)||th.dir;
   if(d<=st)th.state='gone';else{th.x+=dx/d*st;th.y+=dy/d*st}}});
 S.thieves=S.thieves.filter(th=>th.state!='gone')}
// Returns true when the tap hit a thief (taps on thieves win over coins).
function tapThief(wx,wy){if(!S.thieves)return false;
 const th=S.thieves.find(th=>th.state!='scared'&&Math.hypot(wx-th.x,wy-(th.y-C*.2))<C*THIEF.tap);if(!th)return false;
 if(th.loot)dropCoin(th.x,th.y-C*.35,th.y,th.loot.val);
 if(th.coin)th.coin.thief=null;th.loot=null;th.coin=null;th.state='scared';th.hit=.15;SFX.coin(false);return true}
function thiefItems(items){if(!S.thieves)return;const s=C/72;
 S.thieves.forEach(th=>items.push([th.y,()=>{const run=th.state!='grab',fr=RM||!run?0:(Math.floor(th.ph*3)%2)*2,bob=run&&!RM?Math.abs(Math.sin(th.ph*6))*C*.03:0;
  g.save();g.translate(th.x,th.y-bob);g.scale(s*(th.dir>0?-.55:.55),s*.55);
  el(g,0,0,20,4,'rgba(0,0,0,.25)');if(th.hit>0)th.hit-=1/60;g.filter=th.hit>0?'brightness(1.8)':'brightness(.85) saturate(.75) hue-rotate(160deg)';
  comicFit(g,'zombie-walk-'+fr,0,0,58,42);g.filter='none';
  rr(g,-27,-34,22,6,2,'#1c1719');el(g,-22,-31,2,2,'#f2cf60');el(g,-12,-31,2,2,'#f2cf60');
  g.restore();
  if(th.loot){g.save();g.translate(th.x,th.y-C*.45-bob);drawCoin(g,0,0,C*(th.loot.gold?.12:.1),th.loot.gold);g.restore()}}]))}
