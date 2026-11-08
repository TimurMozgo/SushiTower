// Deterministic pacing estimate: 30 active minutes/day, 18 served orders/minute,
// one successful rush per owned cafe, one offline collection/day. No paid currency or clock manipulation.
const M=require('./dist/network.js');const n=M.load(null,null,0),milestones=[];
for(let day=0;day<120;day++){
 const now=day*M.DAY;M.accrue(n,now,true);M.collect(n);
 for(const id of Object.keys(n.restaurants)){
  n.active=id;M.refresh(n,id,now);
  const minutes=30/Object.keys(n.restaurants).length;
  for(let i=0;i<Math.floor(minutes*18);i++)M.completeOrder(n,5,false,now);
  M.finishRush(n,15,now);for(const t of M.TASKS)M.claimTask(n,t.id,now);
  while(M.buyFloor(n))milestones.push({day:day+1,cafe:id,floors:n.restaurants[id].floors});
  for(const k of ['kitchen','lift','cash'])if(n.restaurants[id][k]<6&&n.coins>M.upgradePrice(n.restaurants[id],k)*4)M.upgrade(n,k,now);
 }
 for(const c of M.CAFES)if(M.purchase(n,c.id,now))milestones.push({day:day+1,cafe:c.id,floors:1});
 if(Object.keys(n.restaurants).length===3&&Object.values(n.restaurants).every(r=>r.floors===5))break;
}
console.log(JSON.stringify(milestones,null,2));

