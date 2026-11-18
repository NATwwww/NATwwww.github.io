(() => {
  'use strict';
  const video = document.querySelector('.cat-video');
  const canvas = document.querySelector('.cat-canvas');
  const ctx = canvas.getContext('2d');
  const mascot = document.querySelector('.mascot');
  const status = document.querySelector('#cat-status');
  const dialog = document.querySelector('#detail-dialog');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const idle = new Image(); idle.src = './assets/cat-idle.png';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  let state = 'loading', busy = false, failed = false, generation = 0;
  let pointer = {x: innerWidth / 2, y: innerHeight / 2}, gaze = {x: 0, y: 0};
  let eyePatches = [], raf = 0, drag = null, suppressedUntil = 0;
  let seekWait = null, playback = null, hoverTimer = 0;
  video.muted = true; video.volume = 0;

  // Timings measured from the supplied 5.088 s video (960 × 960).
  const clips = { invite: 1.85, chew: [2.55, 2.88], swallow: [3.30, 3.58], search: [3.65, 5.02] };
  const setStatus = text => { if (status.textContent !== text) status.textContent = text; };
  function setState(next) { state = next; mascot.dataset.state = next; }
  function drawVideo() {
    if (video.readyState >= 2 && !video.seeking) {
      ctx.fillStyle='#f7f7f9';ctx.fillRect(0,0,960,960);
      ctx.drawImage(video, 48, 48, 864, 864); canvas.classList.add('is-ready');
    }
  }
  function buildEyes() {
    const base = document.createElement('canvas'); base.width = base.height = 960;
    const b = base.getContext('2d', {willReadFrequently: true}); b.drawImage(idle, 0, 0, 960, 960);
    // Keep the original hand-painted texture and eye outlines. Only warp the interior.
    eyePatches = [{x:338,y:383,rx:73,ry:74}, {x:622,y:408,rx:71,ry:72}].map(eye => {
      const size = 170, left = eye.x - 85, top = eye.y - 85;
      const patch = document.createElement('canvas'); patch.width = patch.height = size;
      const p = patch.getContext('2d');
      let src=null;
      try { src=b.getImageData(left,top,size,size); } catch { /* file:// canvas privacy: use drawImage warping below. */ }
      return {...eye, size, left, top, patch, p, base, src, out:p.createImageData(size,size)};
    });
  }
  function drawIdle() {
    if (!idle.complete || !idle.naturalWidth) return;
    ctx.fillStyle='#f7f7f9';ctx.fillRect(0,0,960,960);
    ctx.save();ctx.translate(48,48);ctx.scale(.9,.9);
    ctx.drawImage(idle, 0, 0, 960, 960);
    const rect = canvas.getBoundingClientRect();
    const tx = clamp((pointer.x - rect.left - rect.width * .5) / Math.max(rect.width * .65, 1), -1, 1);
    const ty = clamp((pointer.y - rect.top - rect.height * .4) / Math.max(rect.height * .65, 1), -1, 1);
    gaze.x += (tx - gaze.x) * .18; gaze.y += (ty - gaze.y) * .18;
    for (const eye of eyePatches) {
      const {size,src,out} = eye;
      const shiftX = gaze.x * 22 + (eye.x < 400 ? -8 : 8), shiftY = gaze.y * 20 + 14;
      if(!src){
        for(let y=0;y<size;y+=2)for(let x=0;x<size;x+=2){
          const d=((x-85)/eye.rx)**2+((y-85)/eye.ry)**2;
          if(d>=1)continue;
          const f=(1-d)**1.25;
          ctx.drawImage(eye.base,eye.left+x-shiftX*f,eye.top+y-shiftY*f,2,2,eye.left+x,eye.top+y,2,2);
        }
        continue;
      }
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const d = ((x - 85) / eye.rx) ** 2 + ((y - 85) / eye.ry) ** 2;
        const falloff = Math.max(0, 1 - d) ** 1.25;
        const sx = clamp(Math.round(x - shiftX * falloff), 0, size - 1);
        const sy = clamp(Math.round(y - shiftY * falloff), 0, size - 1);
        const from = (sy * size + sx) * 4, to = (y * size + x) * 4;
        out.data[to] = src.data[from]; out.data[to+1] = src.data[from+1];
        out.data[to+2] = src.data[from+2]; out.data[to+3] = 255;
      }
      eye.p.putImageData(out, 0, 0); ctx.drawImage(eye.patch, eye.left, eye.top);
    }
    ctx.restore();canvas.classList.add('is-ready');
    if (!reduced.matches && (Math.abs(tx-gaze.x)>.01 || Math.abs(ty-gaze.y)>.01)) schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (state === 'idle') drawIdle(); }); }
  function seek(time) {
    video.pause();
    if (seekWait) seekWait.cancel();
    return new Promise((resolve,reject) => {
      let timer;
      const cleanup = () => { clearTimeout(timer); video.removeEventListener('seeked',done); seekWait = null; };
      const done = () => { cleanup(); drawVideo(); resolve(); };
      seekWait = {cancel: () => { cleanup(); reject(new Error('cancelled')); }};
      timer = setTimeout(() => { cleanup(); reject(new Error('video seek timeout')); }, 4000);
      video.addEventListener('seeked',done);
      if (Math.abs(video.currentTime-time)<.015 && video.readyState>=2 && !video.seeking) done();
      else video.currentTime = time;
    });
  }
  async function playClip(start,end,token) {
    await seek(start);
    if (token !== generation) throw new Error('cancelled');
    await video.play();
    await new Promise((resolve,reject) => {
      let frame, timer;
      const finish = error => { cancelAnimationFrame(frame); clearTimeout(timer); video.pause(); playback=null; error ? reject(error) : resolve(); };
      playback = {cancel: () => finish(new Error('cancelled'))};
      const tick = () => {
        if (token !== generation) return finish(new Error('cancelled'));
        drawVideo();
        if (video.currentTime >= end || video.ended) return finish();
        frame = requestAnimationFrame(tick);
      };
      timer=setTimeout(() => finish(new Error('video playback timeout')),6000);
      tick();
    });
  }
  function reset() {
    generation++; clearTimeout(hoverTimer); seekWait?.cancel(); playback?.cancel(); video.pause();
    busy=false; mascot.classList.remove('is-feeding','is-dragging','is-over-mouth');
    setState('idle'); setStatus('把下方小零食拖到嘴边 · 也可点击'); schedule();
  }
  function invite() {
    clearTimeout(hoverTimer);
    if (busy || failed || video.readyState<2 || state === 'invite') return;
    setState('invite');
    setStatus('啊——把零食放到这里！');
    seek(clips.invite).catch(() => {});
  }
  const mouth = () => {
    const r=canvas.getBoundingClientRect(); return {x:r.left+r.width*.48, y:r.top+r.height*.535, radius:r.width*.13};
  };
  function hit(x,y) { const m=mouth(); return Math.hypot(x-m.x,y-m.y)<Math.max(40,m.radius); }
  function animateFood(button) {
    if (reduced.matches) return Promise.resolve();
    const sticker=button.querySelector('.food-image'), r=sticker.getBoundingClientRect(), m=mouth();
    const ghost=sticker.cloneNode(); ghost.className='flying-food'; ghost.alt=''; document.body.append(ghost);
    ghost.style.left=`${r.left+r.width/2}px`; ghost.style.top=`${r.top+r.height/2}px`;
    const a=ghost.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1}, {transform:`translate(calc(-50% + ${m.x-r.left-r.width/2}px),calc(-50% + ${m.y-r.top-r.height/2}px)) scale(.2)`,opacity:0}], {duration:480,easing:'cubic-bezier(.4,0,.25,1)',fill:'forwards'});
    return a.finished.catch(()=>{}).then(()=>ghost.remove());
  }
  async function feed(button, open, fromDrag=false) {
    if (busy || dialog.open) return;
    if (failed || video.readyState===0 || reduced.matches) { open(); return; }
    busy=true; const token=++generation; clearTimeout(hoverTimer);
    mascot.classList.add('is-feeding');
    try {
      // Bring the cat into view for touch users before the animation starts.
      const bounds=canvas.getBoundingClientRect();
      if (!fromDrag && (bounds.top<0 || bounds.bottom>innerHeight)) mascot.scrollIntoView({behavior:'instant',block:'center'});
      setState('invite'); await seek(clips.invite);
      if (!fromDrag) await animateFood(button);
      if(token!==generation)return;
      setState('chewing');
      for(let i=0;i<3;i++) { setStatus(`嚼嚼嚼 · ${i+1} / 3`); await playClip(...clips.chew,token); }
      setState('swallowing'); setStatus('咕噜，吃好啦！'); await playClip(...clips.swallow,token);
      setState('searching'); setStatus('等一下，给你找找我的小纸条…'); await playClip(...clips.search,token);
      if(token!==generation)return;
      setState('presenting'); setStatus('找到啦！请看我的小纸条');
      const m=mouth(); dialog.style.setProperty('--paper-x',`${m.x-innerWidth/2}px`); dialog.style.setProperty('--paper-y',`${m.y+canvas.clientHeight*.2-innerHeight/2}px`);
      open();
    } catch(error) {
      if(token===generation) { setStatus('小纸条已经准备好啦'); open(); }
    } finally { if(token===generation) {busy=false; mascot.classList.remove('is-feeding');} }
  }
  document.querySelectorAll('.ticket').forEach(button => {
    const sticker=button.querySelector('.food-sticker');
    sticker.addEventListener('pointerenter',invite);
    sticker.addEventListener('pointerleave',() => { if(!busy && !drag) hoverTimer=setTimeout(reset,160); });
    button.addEventListener('focus',invite);
    button.addEventListener('blur',() => { if(!busy && !drag) reset(); });
    sticker.addEventListener('pointerdown',event => {
      if(event.button!==0 || busy || dialog.open)return;
      invite(); clearTimeout(hoverTimer); sticker.setPointerCapture(event.pointerId);
      drag={pointerId:event.pointerId,button,sticker,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,ghost:null};
    });
    sticker.addEventListener('pointermove',event => {
      if(!drag || drag.pointerId!==event.pointerId)return;
      drag.x=event.clientX;drag.y=event.clientY;
      if(!drag.ghost && Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>7){
        drag.ghost=sticker.querySelector('img').cloneNode();drag.ghost.className='flying-food';drag.ghost.alt='';document.body.append(drag.ghost);
        mascot.classList.add('is-dragging'); sticker.classList.add('is-picked');
      }
      if(drag.ghost){event.preventDefault();drag.ghost.style.left=`${drag.x}px`;drag.ghost.style.top=`${drag.y}px`;mascot.classList.toggle('is-over-mouth',hit(drag.x,drag.y));}
    });
    function finish(event,cancel=false){
      if(!drag || drag.pointerId!==event.pointerId)return;
      const old=drag;drag=null;
      if(sticker.hasPointerCapture(event.pointerId))sticker.releasePointerCapture(event.pointerId);
      sticker.classList.remove('is-picked');mascot.classList.remove('is-dragging','is-over-mouth');
      if(old.ghost){
        old.ghost.remove();suppressedUntil=performance.now()+500;
        if(!cancel && hit(event.clientX,event.clientY))feed(button,button.openPortfolioDetail,true);
        else reset();
      }else if(cancel)reset();
    }
    sticker.addEventListener('pointerup',event=>finish(event));
    sticker.addEventListener('pointercancel',event=>finish(event,true));
    sticker.addEventListener('lostpointercapture',event=>finish(event,true));
  });
  window.addEventListener('pointermove',event => {pointer={x:event.clientX,y:event.clientY};if(state==='idle')schedule();},{passive:true});
  window.addEventListener('resize',schedule);
  document.documentElement.addEventListener('pointerleave',()=>{pointer={x:innerWidth/2,y:innerHeight/2};schedule();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !dialog.open){
      if(drag){drag.ghost?.remove();drag.sticker.classList.remove('is-picked');drag=null;suppressedUntil=performance.now()+500;}
      reset();
    }
  });
  video.addEventListener('error',()=>{failed=true;document.querySelector('.load-error').hidden=false;reset();});
  idle.onload=()=>{buildEyes();if(state==='loading')reset();else if(state==='idle')schedule();};
  idle.onerror=()=>{if(video.readyState>=2){setState('idle');seek(.1).catch(()=>{});}else document.querySelector('.load-error').hidden=false;};
  if(idle.complete && idle.naturalWidth){buildEyes();reset();}
  window.catInteraction={feed,reset,suppressClick:()=>performance.now()<suppressedUntil};
})();
