/* Original looping café theme. All notes are synthesized locally. */
(()=>{
 const sound=window.SushiSound,configure=sound.configure.bind(sound),play=sound.play.bind(sound);
 let unlocked=false,timer=null,step=0,next=0;
 const melody=[72,76,79,76,74,0,71,67,69,72,76,72,71,0,67,64,65,69,72,69,67,0,64,60,67,71,74,71,72,0,79,0];
 const roots=[48,45,41,43];
 function note(midi,time,duration,level,type='sine'){
  const c=sound.context,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);
  o.connect(g);g.connect(sound.musicGain);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(level,time+.015);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.start(time);o.stop(time+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};
 }
 function schedule(){
  const c=sound.context;if(!c||c.state!=='running')return;
  while(next<c.currentTime+.18){const i=step%32,root=roots[Math.floor(i/8)];if(melody[i])note(melody[i],next,.32,.13,'triangle');if(i%4===0)note(root,next,.65,.17);if(i%2===0)note(root+12+(i%4?7:0),next,.24,.055);step++;next+=60/96/2;}
 }
 function sync(){
  const active=unlocked&&sound.enabled&&!document.hidden;
  if(!active){clearInterval(timer);timer=null;if(sound.musicGain)sound.musicGain.gain.setValueAtTime(0,sound.context.currentTime);return;}
  try{sound.context??=new(window.AudioContext||window.webkitAudioContext)();const c=sound.context;if(!sound.musicGain){sound.musicGain=c.createGain();sound.musicGain.connect(c.destination);}sound.musicGain.gain.setTargetAtTime(sound.volume*.55,c.currentTime,.04);c.resume().then(()=>{if(!timer&&sound.enabled&&!document.hidden){next=c.currentTime+.04;timer=setInterval(schedule,100);schedule();}}).catch(()=>{});}catch{}
 }
 sound.configure=(enabled,volume)=>{configure(enabled,volume);sync();};
 sound.play=event=>{if(unlocked)play(event);};
 sound.unlock=()=>{unlocked=true;sync();};
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>{unlocked=false;sync();});
 window.addEventListener('pageshow',sync);
})();
