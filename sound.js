/* Replace an event with a local recording by setting files.order = 'audio/order.mp3', etc. */
window.SushiSound={
 files:{order:null,build:null,upgrade:null,lift:null,rush:null,finish:null,collect:null,tap:null},context:null,enabled:true,volume:.35,last:{},
 configure(enabled,volume){this.enabled=enabled;this.volume=volume;},
 play(event){if(!this.enabled||document.hidden)return;const now=performance.now();if(now-(this.last[event]||-10000)<(event==='lift'?1800:80))return;this.last[event]=now;
 if(this.files[event]){const a=new Audio(this.files[event]);a.volume=this.volume;a.play().catch(()=>{});return}
 try{this.context??=new(window.AudioContext||window.webkitAudioContext)();const c=this.context;if(c.state!=='running')c.resume();const recipes={tap:[[520,0,.045]],order:[[1320,0,.09],[1760,.07,.14]],build:[[180,0,.1],[220,.13,.1],[523,.28,.18],[659,.4,.2],[784,.52,.3]],upgrade:[[440,0,.1],[554,.09,.12],[659,.18,.2]],lift:[[620,0,.1],[830,.12,.15]],rush:[[392,0,.12],[523,.12,.12],[659,.24,.14],[784,.38,.3]],finish:[[523,0,.15],[659,.15,.15],[784,.3,.15],[1047,.48,.4]],collect:[[880,0,.1],[1175,.08,.12],[1568,.16,.2]]};for(const [freq,delay,duration] of recipes[event]||recipes.tap){const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=event==='build'&&freq<300?'triangle':'sine';o.frequency.value=freq;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(this.volume*.13,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.start(t);o.stop(t+duration+.01);o.onended=()=>{o.disconnect();g.disconnect()}}}catch{}
 }
};
