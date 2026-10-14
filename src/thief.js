/* ---------- cat thief ----------
 A fast cat runs out of a house door, grabs a coin from the ground or a device from the lawn, and runs back.
 Tap it in time: the loot comes back plus a bonus coin. If it gets home, the loot is gone.
 Not lane-bound: it moves freely in world pixels, so it lives in its own list and ignores devices. */
const THIEF={run:2.5,flee:1.9,grab:.55,tap:.55};
function setupThieves(i){S.thieves=[];S.thiefPlan=[];if(i<3)return;
 const end=S.spawns.length?S.spawns[S.spawns.length-1].t:60,R=rng(i*331+7),n=i>=7?2:1;
 for(let k=0;k<n;k++)S.thiefPlan.push({t:end*(n==1?.45:.3+k*.4)+R()*8,d:Math.floor(R()*S.lv.doors.length)})}
function thiefDoor(di){const d=S.lv.doors[di],at=d.s=='t'&&S.doorAt&&S.doorAt[di];
 return at?{x:at.x,y:at.y+C*.1}:{x:FX(d.c+.5),y:d.s=='t'?FY(0)-C*.15:FY(S.rows)+C*.55}}
function thiefTarget(th){
 const free=S.coins.filter(c=>!c.fly&&!c.done&&!c.thief);
 if(free.length){const c=free.sort((a,b)=>Math.hypot(a.x-th.x,a.ground-th.y)-Math.hypot(b.x-th.x,b.ground-th.y))[0];c.thief=th;return{kind:'coin',c}}
 const us=S.units.filter(u=>!u.dead&&u.t!='fence'&&!u.stolen);
 if(us.length){const u=us.sort((a,b)=>U[b.t].cost-U[a.t].cost||b.c-a.c)[0];u.stolen=th;return{kind:'unit',u}}
 return null}
function spawnThief(p){const h=thiefDoor(p.d);S.doorOpen[p.d]=1.3;
 const th={x:h.x,y:h.y,home:h,state:'run',ph:0,t:0,loot:null,target:null,id:S.id++};th.target=thiefTarget(th);if(!th.target)th.state='flee';
 S.thieves.push(th);banner('Кот-вор! Ткни его!');SFX.sting();if(!save.seen.thief){save.seen.thief=1;persist()}}
function thiefGoal(th){const g=th.target;if(!g)return null;
 if(g.kind=='coin'){if(g.c.done||g.c.fly)return null;return{x:g.c.x,y:g.c.ground}}
 if(g.u.dead)return null;return{x:FX(g.u.c+.5),y:FY(g.u.r)+C*.88}}
function updThieves(dt){if(!S.thieves)return;
 while(S.phase=='play'&&S.thiefPlan.length&&S.thiefPlan[0].t<=S.t)spawnThief(S.thiefPlan.shift());
 S.thieves.forEach(th=>{th.ph+=dt;th.t+=dt;if(th.hit>0)th.hit-=dt;
  if(th.state=='run'){let goal=thiefGoal(th);
   if(!goal){if(th.target?.u)th.target.u.stolen=null;th.target=thiefTarget(th);goal=thiefGoal(th);if(!goal){th.state='flee';return}}
   const dx=goal.x-th.x,dy=goal.y-th.y,d=Math.hypot(dx,dy),st=THIEF.run*C*dt;
   th.dir=Math.sign(dx)||th.dir||-1;
   if(d<=st){th.x=goal.x;th.y=goal.y;th.state='grab';th.t=0}else{th.x+=dx/d*st;th.y+=dy/d*st}}
  else if(th.state=='grab'){if(th.t>=THIEF.grab){const g=th.target;
    if(g.kind=='coin'&&!g.c.done&&!g.c.fly){g.c.done=1;th.loot={coin:g.c.val,gold:g.c.gold}}
    else if(g.kind=='unit'&&!g.u.dead){g.u.dead=1;th.loot={unit:g.u}}
    if(th.loot){SFX.cloth?SFX.cloth():SFX.place();txt({x:(th.x-X0)/C,y:(th.y-oy-TOPH)/C-.9},'Хап!','#ffcf3f')}
    th.state='flee';th.t=0}}
  else if(th.state=='flee'||th.state=='scared'){const h=th.home,dx=h.x-th.x,dy=h.y-th.y,d=Math.hypot(dx,dy),st=(th.state=='scared'?THIEF.run*1.4:THIEF.flee)*C*dt;
   th.dir=Math.sign(dx)||th.dir;
   if(d<=st){th.state='gone';if(th.loot&&th.loot.unit){S.toasts.push({type:'cat',txt:`Кот-вор унёс «${U[th.loot.unit.t].n}»`,life:4})}
    else if(th.loot)S.toasts.push({type:'cat',txt:'Кот-вор унёс монету',life:3})}
   else{th.x+=dx/d*st;th.y+=dy/d*st}}});
 S.thieves=S.thieves.filter(th=>th.state!='gone')}
// Returns true when the tap hit a thief (taps on thieves win over coins).
function tapThief(wx,wy){if(!S.thieves)return false;
 const th=S.thieves.find(th=>th.state!='scared'&&Math.hypot(wx-th.x,wy-(th.y-C*.3))<C*THIEF.tap);if(!th)return false;
 const L=th.loot;th.loot=null;th.state='scared';th.hit=.2;
 if(th.target?.u&&!L)th.target.u.stolen=null;
 if(L&&L.unit){const u=L.unit;u.stolen=null;if(!unitAt(u.r,u.c)){u.dead=0;u.pop=.1;S.units.push(u)}else dropCoin(th.x,th.y-C*.4,th.y,U[u.t].cost)}
 else if(L&&L.coin)dropCoin(th.x,th.y-C*.4,th.y,L.coin);
 dropCoin(th.x+C*.2,th.y-C*.5,th.y,L?25:10);
 burst(th.x,th.y-C*.3,'#ffcf3f',10);P({k:'txt',txt:L?'Отдай!':'Кыш!',x:th.x,y:th.y-C*.9,vy:-C*.5,life:1.1,col:'#ffcf3f'});SFX.clang(0);return true}
function thiefItems(items){if(!S.thieves)return;const s=C/72;
 S.thieves.forEach(th=>items.push([th.y,()=>{const run=th.state!='grab',fr=RM||!run?0:(Math.floor(th.ph*3.2)%2)*2,bob=run&&!RM?Math.abs(Math.sin(th.ph*6.4))*C*.04:0;
  // Tap target ring so the player knows it can be poked.
  if(th.state!='scared'){const p=.5+.5*Math.sin(S.t*8);g.strokeStyle=`rgba(255,207,63,${.5+.4*p})`;g.lineWidth=2.5;g.setLineDash([5,4]);g.beginPath();g.ellipse(th.x,th.y-C*.05,C*.34,C*.12,0,0,7);g.stroke();g.setLineDash([])}
  g.save();g.translate(th.x,th.y-bob);g.scale(s*(th.dir>0?-.82:.82),s*.82);if(th.state=='scared')g.globalAlpha=.75;
  el(g,0,0,20,4,'rgba(0,0,0,.25)');g.filter=th.hit>0?'brightness(1.8)':'brightness(.8) saturate(.7) hue-rotate(160deg)';
  comicFit(g,'zombie-walk-'+fr,0,0,58,42);g.filter='none';
  rr(g,-27,-34,22,6,2,'#1c1719');el(g,-22,-31,2,2,'#f2cf60');el(g,-12,-31,2,2,'#f2cf60');
  g.restore();
  const L=th.loot;if(L){g.save();g.translate(th.x,th.y-C*.62-bob);if(L.unit){g.scale(s*.5,s*.5);g.rotate(Math.sin(th.ph*8)*.12);drawUnit(g,{...L.unit,fire:0,hurt:0,pop:null})}else drawCoin(g,0,0,C*(L.gold?.14:.11),L.gold);g.restore()}}]))}
