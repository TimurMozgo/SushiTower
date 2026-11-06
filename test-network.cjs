const assert=require('node:assert/strict'),M=require('./dist/network.js');
const n=M.load(null,{coins:5000,gems:7,floors:5,kitchen:4,lift:2,cash:3,served:90,best:18,sound:false},1000);
assert.equal(n.restaurants.park.kitchen,4);assert.equal(n.coins,5000);assert.equal(n.sound,false);
assert.equal(M.purchase(n,'sunset'),false);assert.equal(M.purchase(n,'harbor'),true);assert.equal(n.coins,3800);assert.equal(n.restaurants.harbor.floors,1);assert.equal(n.restaurants.harbor.kitchen,1);assert.equal(M.purchase(n,'harbor'),false);
n.active='harbor';const s=M.view(n);s.kitchen=2;assert.equal(n.restaurants.park.kitchen,4);assert.equal(n.restaurants.harbor.kitchen,2);n.coins=100000;assert(M.buyFloor(n));assert.equal(s.floors,2);assert(M.buyFloor(n));assert(M.unlocked(n,'sunset'));
const before=n.coins;M.accrue(n,61000);assert.equal(n.restaurants.harbor.pending,0);assert(n.restaurants.park.pending>0);const collected=M.collect(n);assert.equal(n.coins,before+collected);assert.equal(M.collect(n),0);
M.accrue(n,61000+24*3600000,true);assert(n.restaurants.harbor.pending<=M.rate(n,'harbor')*480);const pending=n.restaurants.harbor.pending;M.accrue(n,61000+24*3600000,true);assert.equal(n.restaurants.harbor.pending,pending);
const restored=M.load(JSON.parse(JSON.stringify(n)),null,n.lastAt);assert.equal(restored.active,'harbor');assert.equal(restored.restaurants.harbor.floors,3);assert.equal(restored.restaurants.park.floors,5);
const poor=M.load(null,null,0);assert.equal(M.purchase(poor,'harbor'),false);poor.coins=0;assert.equal(M.buyFloor(poor),false);assert.equal(poor.restaurants.park.floors,3);
console.log('PASS: migration, unlocking, purchases, isolated upgrades, floors, income, cap, collection and reload');

for(const id of ['park','harbor','sunset']){
 const x=M.load(null,null,0);x.restaurants[id]={...x.restaurants.park,floors:4};x.active=id;x.coins=999999;
 assert.equal(M.floorPrice(x.restaurants[id]),1000000);assert.equal(M.buyFloor(x),false);x.coins++;assert(M.buyFloor(x));assert.equal(x.coins,0);
 for(const kind of ['kitchen','lift','cash']){const income=M.orderIncome(x),passive=M.rate(x,id);x.restaurants[id][kind]++;assert(M.orderIncome(x)>income);assert(M.rate(x,id)>passive);}
}
console.log('PASS: million-price final floor at every location and income growth for every upgrade');
