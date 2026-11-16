(()=>{

const video=document.querySelector('video'), canvas=document.querySelector('canvas');
const ctx=canvas.getContext('2d'), errorMessage=document.querySelector('.load-error');
const frame=document.createElement('canvas'); frame.width=frame.height=900;
const source=frame.getContext('2d');
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const lookLeftTime=1.72, lookRightTime=1.96;
let pointerX=innerWidth/2,pointerY=innerHeight/2;
let pendingFrame=null,requestedTime=null,frameReady=false,vertical=0;
// Source-frame coordinates. Displacement fades to zero at the eye boundary.
const eyes=[
  {x:358,y:301,rx:34,ry:43,angle:0.51},
  {x:498,y:339,rx:29,ry:43,angle:0.08}
];
function drawEye(eye,offset){
  const c=Math.cos(eye.angle),s=Math.sin(eye.angle),radius=52,step=2;
  for(let y=eye.y-radius;y<eye.y+radius;y+=step){
    for(let x=eye.x-radius;x<eye.x+radius;x+=step){
      const dx=x+step/2-eye.x,dy=y+step/2-eye.y;
      const u=(dx*c+dy*s)/eye.rx,v=(-dx*s+dy*c)/eye.ry;
      const distance=u*u+v*v;
      if(distance>=1)continue;
      const shift=offset*Math.pow(1-distance,1.4);
      ctx.drawImage(frame,x,y-shift,step,step,x,y,step,step);
    }
  }
}
// Feathered background clones remove both watermarks in the page rendering.
// The original MP4 is intentionally preserved.
function makePatch(sx,sy,sw,sh,x,y,w,h){
  const patch=document.createElement('canvas');patch.width=w;patch.height=h;
  const p=patch.getContext('2d');
  return ()=>{
    p.globalCompositeOperation='source-over';p.clearRect(0,0,w,h);
    p.drawImage(frame,sx,sy,sw,sh,0,0,w,h);
    p.globalCompositeOperation='destination-in';
    for(const horizontal of [true,false]){
      const length=horizontal?w:h;
      const gradient=p.createLinearGradient(0,0,horizontal?w:0,horizontal?0:h);
      const edge=5/length;
      gradient.addColorStop(0,'transparent');gradient.addColorStop(edge,'#000');
      gradient.addColorStop(1-edge,'#000');gradient.addColorStop(1,'transparent');
      p.fillStyle=gradient;p.fillRect(0,0,w,h);
    }
    ctx.drawImage(patch,x,y);
  };
}
const cleanTop=makePatch(12,105,145,85,12,8,145,85);
const cleanBottom=makePatch(780,785,115,54,723,834,174,54);
function scheduleDraw(){
  if(pendingFrame===null)pendingFrame=requestAnimationFrame(update);
}
function update(){
  pendingFrame=null;
  if(video.error||video.readyState<2)return;
  const progress=clamp(pointerX/Math.max(1,innerWidth-1),0,1);
  const time=lookLeftTime+progress*(lookRightTime-lookLeftTime);
  if(!video.seeking&&(requestedTime===null||Math.abs(time-requestedTime)>0.001)){
    requestedTime=time;video.currentTime=time;
  }
  if(!frameReady)return;
  const rect=canvas.getBoundingClientRect(),eyeY=rect.top+rect.height*0.355;
  const range=pointerY<eyeY?Math.max(1,eyeY):Math.max(1,innerHeight-eyeY);
  const target=clamp((pointerY-eyeY)/range,-1,1)*12;
  vertical+=(target-vertical)*0.24;
  ctx.drawImage(frame,0,0);cleanTop();cleanBottom();
  for(const eye of eyes)drawEye(eye,vertical);
  canvas.classList.add('is-ready');
  if(Math.abs(target-vertical)>0.03)scheduleDraw();
}
window.addEventListener('pointermove',event=>{
  pointerX=event.clientX;pointerY=event.clientY;scheduleDraw();
},{passive:true});
window.addEventListener('resize',scheduleDraw);
document.documentElement.addEventListener('pointerleave',()=>{
  pointerX=innerWidth/2;
  const rect=canvas.getBoundingClientRect();pointerY=rect.top+rect.height*0.355;
  scheduleDraw();
});
video.addEventListener('loadeddata',scheduleDraw);
video.addEventListener('seeked',()=>{
  source.drawImage(video,0,0,900,900);frameReady=true;scheduleDraw();
});
function showLoadError(){canvas.classList.remove('is-ready');errorMessage.hidden=false}
video.addEventListener('error',showLoadError);
if(video.error)showLoadError();else scheduleDraw();

})();
