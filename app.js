(() => {
  const qs=(s,c=document)=>c.querySelector(s), qsa=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const state={motion:!reduce.matches, mode:'particles'};
  document.body.classList.toggle('no-motion',!state.motion);
  qs('#motionReadout').textContent=state.motion?'ENABLED':'REDUCED';
  qs('#year').textContent=new Date().getFullYear();

  const progress=qs('.page-progress span');
  const updateProgress=()=>{ const max=document.documentElement.scrollHeight-innerHeight; progress.style.width=`${max?scrollY/max*100:0}%`; };
  addEventListener('scroll',updateProgress,{passive:true}); updateProgress();

  const glow=qs('.cursor-glow');
  addEventListener('pointermove',e=>{
    glow.style.transform=`translate(${e.clientX-220}px,${e.clientY-220}px)`;
    qs('#pointerReadout').textContent=`x: ${(e.clientX/innerWidth).toFixed(2)} / y: ${(e.clientY/innerHeight).toFixed(2)}`;
  },{passive:true});
  const viewport=()=>qs('#viewportReadout').textContent=`${innerWidth} × ${innerHeight}`; addEventListener('resize',viewport);viewport();

  const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-visible',e.isIntersecting)),{threshold:.15});
  qsa('.reveal').forEach(el=>io.observe(el));

  qsa('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{ if(!state.motion)return; const r=el.getBoundingClientRect(); const x=(e.clientX-r.left-r.width/2)*.18; const y=(e.clientY-r.top-r.height/2)*.18; el.style.transform=`translate(${x}px,${y}px)`; });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });

  qsa('.tilt').forEach(card=>{
    card.addEventListener('pointermove',e=>{ if(!state.motion)return; const r=card.getBoundingClientRect(); const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; card.style.setProperty('--mx',`${px*100}%`); card.style.setProperty('--my',`${py*100}%`); card.style.transform=`perspective(900px) rotateX(${(py-.5)*-5}deg) rotateY(${(px-.5)*7}deg) translateY(-3px)`; });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });

  qsa('[data-spotlight]').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--sx',`${(e.clientX-r.left)/r.width*100}%`);el.style.setProperty('--sy',`${(e.clientY-r.top)/r.height*100}%`)}));

  addEventListener('scroll',()=>{ if(!state.motion)return; qsa('.parallax-layer').forEach(el=>{const d=+el.dataset.depth||.2; el.style.translate=`0 ${scrollY*d*.16}px`;}); },{passive:true});

  const canvas=qs('#heroCanvas'),ctx=canvas.getContext('2d'); let pts=[],last=performance.now(),fpsFrames=0,fpsTime=last;
  function size(){const d=Math.min(devicePixelRatio,2);canvas.width=innerWidth*d;canvas.height=Math.max(innerHeight,900)*d;canvas.style.width='100%';canvas.style.height='100%';ctx.setTransform(d,0,0,d,0,0);pts=Array.from({length:Math.min(95,Math.floor(innerWidth/14))},()=>({x:Math.random()*innerWidth,y:Math.random()*Math.max(innerHeight,900),vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.6+.3}));}
  function frame(t){ const dt=Math.min(32,t-last);last=t;ctx.clearRect(0,0,innerWidth,Math.max(innerHeight,900)); if(state.mode!=='quiet'){ for(const p of pts){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>Math.max(innerHeight,900))p.vy*=-1;ctx.beginPath();ctx.fillStyle='rgba(106,247,255,.55)';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();} if(state.mode==='particles'){ctx.strokeStyle='rgba(106,247,255,.06)';for(let i=0;i<pts.length;i+=2){for(let j=i+1;j<pts.length;j+=7){const a=pts[i],b=pts[j],dx=a.x-b.x,dy=a.y-b.y,ds=dx*dx+dy*dy;if(ds<17000){ctx.globalAlpha=1-ds/17000;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}}ctx.globalAlpha=1;} if(state.mode==='grid'){ctx.strokeStyle='rgba(106,247,255,.055)';for(let x=0;x<innerWidth;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,Math.max(innerHeight,900));ctx.stroke();}}} fpsFrames++; if(t-fpsTime>700){qs('#frameReadout').textContent=`~${Math.round((t-fpsTime)/fpsFrames)} ms`;fpsTime=t;fpsFrames=0;} requestAnimationFrame(frame);}
  size();addEventListener('resize',size);requestAnimationFrame(frame);
  qsa('.chip').forEach(btn=>btn.addEventListener('click',()=>{qsa('.chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.mode=btn.dataset.mode;}));

  const palette=qs('#commandPalette'), input=qs('#commandInput');
  const openPalette=()=>{palette.showModal();setTimeout(()=>input.focus(),20)}; qs('#commandBtn').onclick=openPalette; qs('#openCommandBtn').onclick=openPalette;
  addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()} if(!palette.open){const k=e.key.toLowerCase();if(k==='h')location.hash='#top';if(k==='l')location.hash='#lab';if(k==='w')location.hash='#work';}});
  qsa('[data-command]').forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.command;if(c==='top'||c==='lab'||c==='work')location.hash=`#${c}`;if(c==='motion'){state.motion=!state.motion;document.body.classList.toggle('no-motion',!state.motion);qs('#motionReadout').textContent=state.motion?'ENABLED':'REDUCED'}if(c==='contrast')document.body.classList.toggle('high-contrast');palette.close()}));
  input.addEventListener('input',()=>{const v=input.value.toLowerCase();qsa('[data-command]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(v));});

  const data={aurora:{title:'Aurora Systems',text:'A fictitious immersive brand concept built around luminous depth, oversized editorial type and a soft technical atmosphere.',focus:'Immersive brand',technique:'Layered SVG + motion'},monolith:{title:'Monolith Objects',text:'A fictitious commerce concept using restraint, whitespace and warm material cues to prove premium does not require visual noise.',focus:'Editorial commerce',technique:'Minimal grid + typography'},kinetic:{title:'Kinetic Division',text:'A fictitious performance-data concept using hard geometry, dense hierarchy and fast visual rhythm for high-information environments.',focus:'Sport / data',technique:'Rhythm + data hierarchy'}};
  const dialog=qs('#projectDialog');
  qsa('[data-modal]').forEach(b=>b.addEventListener('click',()=>{const d=data[b.dataset.modal];qs('#dialogTitle').textContent=d.title;qs('#dialogText').textContent=d.text;qs('#dialogFocus').textContent=d.focus;qs('#dialogTechnique').textContent=d.technique;dialog.showModal()}));
  qs('.dialog-close').onclick=()=>dialog.close();

  const counterIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return; const el=e.target,target=+el.dataset.counter; let n=0; const dur=700,start=performance.now(); const tick=t=>{const p=Math.min(1,(t-start)/dur);n=Math.round(target*(1-Math.pow(1-p,3)));el.textContent=n;if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);counterIO.unobserve(el)}),{threshold:.6});qsa('[data-counter]').forEach(el=>counterIO.observe(el));

  qs('#replayBtn').onclick=()=>{scrollTo({top:0,behavior:state.motion?'smooth':'auto'});};
  qs('#tourBtn').onclick=()=>{qs('#capabilities').scrollIntoView({behavior:state.motion?'smooth':'auto'});};
})();
