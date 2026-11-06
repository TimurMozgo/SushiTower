/* Background recording supplied by the game owner. */
(()=>{
 const sound=window.SushiSound,configure=sound.configure.bind(sound),play=sound.play.bind(sound);
 const music=document.createElement('audio');music.src='audio/calm.mp3';music.loop=true;music.preload='metadata';music.hidden=true;music.id='background-music';document.body.append(music);
 let unlocked=false,pending=false;
 function sync(){
  music.volume=Math.max(0,Math.min(1,sound.volume*.6));
  if(!unlocked||!sound.enabled||document.hidden){music.pause();return;}
  if(music.paused&&!pending){pending=true;music.play().catch(()=>{}).finally(()=>{pending=false;if(!sound.enabled||document.hidden)music.pause();});}
 }
 sound.configure=(enabled,volume)=>{configure(enabled,volume);sync();};
 sound.play=event=>{if(unlocked)play(event);};
 sound.unlock=()=>{unlocked=true;sync();};
 document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>{unlocked=false;music.pause();});
 window.addEventListener('pageshow',sync);
})();
