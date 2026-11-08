const assert=require('node:assert/strict'),M=require('./dist/network.js');
const fresh=()=>M.load(null,null,0);
const n=fresh();assert.equal(n.version,4);assert.equal(n.restaurants.park.floors,1);assert.equal(n.coins,300);
// Even unlimited money and orders cannot unlock the whole game in one day.
n.coins=1e12;for(let i=0;i<10000;i++)M.completeOrder(n,5,true,1000);
assert.equal(n.restaurants.park.rep,180);assert(M.buyFloor(n));assert.equal(M.buyFloor(n),false);assert.equal(M.purchase(n,'harbor',1000),false);
let restored=M.load(JSON.parse(JSON.stringify(n)),null,2000);M.completeOrder(restored,0,false,2000);assert.equal(restored.restaurants.park.rep,180);
M.completeOrder(n,0,false,M.DAY);assert.equal(n.restaurants.park.rep,181);
// Claims are exactly once, including after reload; daily refresh does not backfill missed days.
const q=fresh();for(let i=0;i<80;i++)M.completeOrder(q,0,false,1000);
const gems=q.gems;assert(M.claimTask(q,'orders30',1000));assert.equal(q.gems,gems+1);assert.equal(M.claimTask(q,'orders30',1000),false);
restored=M.load(JSON.parse(JSON.stringify(q)),null,1000);assert.equal(M.claimTask(restored,'orders30',1000),false);
assert.equal(M.claimTask(q,'rush1',1000),false);M.refresh(q,'park',M.DAY*3);assert.equal(q.restaurants.park.taskOrders,0);assert.equal(q.restaurants.park.rep,90);
// Rush currency is limited across the network, and cooldown survives saves.
const rush=fresh();assert(M.beginRush(rush,0));assert.equal(M.beginRush(rush,1000),false);assert.equal(M.beginRush(M.load(JSON.parse(JSON.stringify(rush)),null,1000),1000),false);
for(let i=0;i<4;i++)M.finishRush(rush,15,i*600000);assert.equal(rush.gems,6);M.finishRush(rush,15,M.DAY);assert.equal(rush.gems,8);
// Every location has independent reputation and the same final floor price.
for(const id of ['park','harbor','sunset']){const x=fresh();x.restaurants[id]={...x.restaurants.park,floors:4,rep:1999};x.active=id;x.coins=1e6;assert.equal(M.floorPrice(x.restaurants[id]),1e6);assert.equal(M.buyFloor(x),false);x.restaurants[id].rep=2000;assert(M.buyFloor(x));assert.equal(x.coins,0)}
const c=fresh();c.restaurants.park.floors=5;c.coins=1e6;assert(M.purchase(c,'harbor',1000));assert.equal(c.restaurants.harbor.rep,0);c.active='harbor';assert.equal(M.buyFloor(c),false);
// Upgrade increases earnings, charges once, and is bounded at level 20.
const u=fresh();const previous=M.orderIncome(u,5),income=M.rate(u,'park');assert(M.upgrade(u,'kitchen',0));assert.equal(u.coins,120);assert(M.orderIncome(u,5)>previous);assert(M.rate(u,'park')>income);u.restaurants.park.kitchen=20;assert.equal(M.upgrade(u,'kitchen'),false);assert.equal(M.upgrade(u,'bogus'),false);
// Passive income cap, no duplicate collection, no reward for backward clock.
const p=fresh();M.accrue(p,M.DAY,true);assert.equal(p.restaurants.park.pending,1920);assert.equal(M.collect(p),1920);assert.equal(M.collect(p),0);M.accrue(p,0,true);assert.equal(p.restaurants.park.pending,0);
// Diamonds: permanent storage, one-time skin purchase, free switching, no reputation bought.
const g=fresh();assert.equal(M.buyGemItem(g,'skin',0),false);g.gems=100;assert(M.buyGemItem(g,'skin',0));assert.equal(g.gems,75);assert(M.buyGemItem(g,'skin',0));assert.equal(g.gems,75);assert.equal(g.restaurants.park.skin,false);assert(M.buyGemItem(g,'storage',0));assert.equal(g.gems,35);assert.equal(M.buyGemItem(g,'storage',0),false);M.accrue(g,M.DAY,true);assert.equal(g.restaurants.park.pending,2880);assert.equal(g.restaurants.park.rep,0);
// Migration preserves earned money/buildings/levels, caps old passive stock, leaves historical orders out of new tasks.
const old={version:3,coins:2e6,gems:55,active:'park',lastAt:0,restaurants:{park:{floors:5,kitchen:35,lift:2,cash:3,served:9999,pending:1e7}}};const m=M.load(old,null,1000);assert.equal(m.coins,2e6);assert.equal(m.restaurants.park.floors,5);assert.equal(m.restaurants.park.kitchen,35);assert.equal(m.restaurants.park.rep,2000);assert.equal(m.restaurants.park.taskOrders,0);assert(m.restaurants.park.pending<=M.rate(m,'park')*480);assert.equal(M.load(JSON.parse(JSON.stringify(m)),null,1000).migrated,false);
// Max income is finite even for older over-levelled saves.
m.restaurants.park.kitchen=m.restaurants.park.cash=m.restaurants.park.lift=1000;assert(M.rate(m,'park')<90);assert(M.orderIncome(m,5)<450);
console.log('PASS: daily reputation bounds, progression gates, task claims/reset/reload, rush cooldown/gem cap, upgrades, storage, diamond purchases and migration');
