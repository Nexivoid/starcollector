(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });

  const scoreEl = document.getElementById('scoreVal');
  const timeEl = document.getElementById('timeVal');
  const restartBtn = document.getElementById('restart');

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  let score = 0;
  let timeLeft = 60;
  let running = true;
  let lastTime = performance.now();
  let starSpawnTimer = 0;
  let enemySpawnTimer = 0;
  let difficulty = 1;

  const player = {
    x: 100, y: 100, radius: 18, speed: 220, dx: 0, dy: 0
  };

  const stars = [];
  const enemies = [];

  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

  function bindTouch(id, key) {
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('pointerdown', (e)=> { e.preventDefault(); keys[key] = true; });
    el.addEventListener('pointerup',   (e)=> { e.preventDefault(); keys[key] = false; });
    el.addEventListener('pointercancel',(e)=> { e.preventDefault(); keys[key] = false; });
    el.addEventListener('pointerleave',(e)=> { e.preventDefault(); keys[key] = false; });
  }
  bindTouch('left','arrowleft'); bindTouch('right','arrowright'); bindTouch('up','arrowup'); bindTouch('down','arrowdown');

  restartBtn.addEventListener('click', initGame);

  let audioCtx = null;
  function playCollectSound() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 900;
    gain.gain.value = 0.0001;
    oscillator.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    oscillator.start(now);
    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    oscillator.stop(now + 0.26);
  }

  function rand(min, max){ return Math.random() * (max - min) + min; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function spawnStar() {
    stars.push({
      x: rand(30, window.innerWidth-30),
      y: rand(30, window.innerHeight-30),
      radius: 10 + Math.random()*6,
      wobble: Math.random()*Math.PI*2
    });
  }

  function spawnEnemy() {
    const side = Math.floor(rand(0,4));
    let x, y;
    if(side===0){ x=-30; y=rand(0,window.innerHeight); }
    else if(side===1){ x=window.innerWidth+30; y=rand(0,window.innerHeight); }
    else if(side===2){ x=rand(0,window.innerWidth); y=-30; }
    else { x=rand(0,window.innerWidth); y=window.innerHeight+30; }
    enemies.push({
      x, y,
      width: 24 + Math.random()*18,
      height: 24 + Math.random()*18,
      speed: 60 + Math.random()*80 + difficulty*12,
      vx: 0, vy:0
    });
  }

  function initGame(){
    score = 0;
    timeLeft = 60;
    running = true;
    stars.length = 0;
    enemies.length = 0;
    player.x = window.innerWidth/2;
    player.y = window.innerHeight/2;
    starSpawnTimer = 0;
    enemySpawnTimer = 0;
    difficulty = 1;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
    lastTime = performance.now();
    for(let i=0;i<5;i++) spawnStar();
  }

  function update(dt){
    if(!running) return;

    timeLeft -= dt;
    if(timeLeft <= 0){
      timeLeft = 0;
      running = false;
      return;
    }
    timeEl.textContent = Math.ceil(timeLeft);


    let vx=0, vy=0;
    if(keys['arrowleft'] || keys['a']) vx -=1;
    if(keys['arrowright'] || keys['d']) vx +=1;
    if(keys['arrowup'] || keys['w']) vy -=1;
    if(keys['arrowdown'] || keys['s']) vy +=1;
    const len = Math.hypot(vx,vy) || 1;
    player.dx = (vx/len)*player.speed;
    player.dy = (vy/len)*player.speed;

    player.x += player.dx*dt;
    player.y += player.dy*dt;
    player.x = clamp(player.x, player.radius, window.innerWidth-player.radius);
    player.y = clamp(player.y, player.radius, window.innerHeight-player.radius);

    starSpawnTimer += dt;
    if(starSpawnTimer > Math.max(0.45,1.6 - difficulty*0.09)){
      spawnStar();
      starSpawnTimer = 0;
    }
    enemySpawnTimer += dt;
    if(enemySpawnTimer > Math.max(0.6,2.8 - difficulty*0.12)){
      spawnEnemy();
      enemySpawnTimer = 0;
    }

    for(let i=stars.length-1;i>=0;i--){
      const s = stars[i];
      s.wobble += dt*6;
      const dx = s.x - player.x, dy = s.y - player.y;
      if(dx*dx + dy*dy < (s.radius+player.radius-2)*(s.radius+player.radius-2)){
        stars.splice(i,1);
        score += 10;
        timeLeft = Math.min(300, timeLeft+1.8);
        playCollectSound();
        difficulty += 0.02;
        scoreEl.textContent = score;
      }
    }


    for(let i=enemies.length-1;i>=0;i--){
      const e = enemies[i];
      const angle = Math.atan2(player.y - e.y, player.x - e.x);
      e.vx = Math.cos(angle)*e.speed;
      e.vy = Math.sin(angle)*e.speed;
      e.x += e.vx*dt;
      e.y += e.vy*dt;

      if(e.x<-150 || e.x>window.innerWidth+150 || e.y<-150 || e.y>window.innerHeight+150){
        enemies.splice(i,1);
        continue;
      }

      const closestX = clamp(player.x, e.x - e.width/2, e.x + e.width/2);
      const closestY = clamp(player.y, e.y - e.height/2, e.y + e.height/2);
      const dx = player.x - closestX;
      const dy = player.y - closestY;
      if(dx*dx + dy*dy < player.radius*player.radius){
        running = false;
      }
    }

    difficulty += dt*0.01;
  }

  function render(){
    ctx.fillStyle = '#071428';
    ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

    for(const s of stars){
      const glow = 6 + Math.sin(s.wobble)*3;
      const gradient = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.radius+glow);
      gradient.addColorStop(0,'rgba(255,255,210,0.95)');
      gradient.addColorStop(0.45,'rgba(255,235,150,0.55)');
      gradient.addColorStop(1,'rgba(255,200,80,0.02)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.radius+glow,0,Math.PI*2);
      ctx.fill();

      ctx.save();
      ctx.translate(s.x,s.y);
      ctx.rotate(s.wobble*0.4);
      ctx.fillStyle='#fff9e6';
      ctx.beginPath();
      for(let i=0;i<5;i++){
        ctx.lineTo(Math.cos(i*2*Math.PI/5)*s.radius*0.6, Math.sin(i*2*Math.PI/5)*s.radius*0.6);
        ctx.lineTo(Math.cos((i*2+1)*Math.PI/5)*s.radius*0.25, Math.sin((i*2+1)*Math.PI/5)*s.radius*0.25);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.beginPath();
    ctx.fillStyle='rgba(0,0,0,0.18)';
    ctx.ellipse(player.x+4,player.y+6,player.radius*1.05,player.radius*0.55,0,0,Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle='#63b3ff';
    ctx.arc(player.x,player.y,player.radius,0,Math.PI*2);
    ctx.fill();

    const pg = ctx.createLinearGradient(player.x-player.radius,player.y-player.radius,player.x+player.radius,player.y+player.radius);
    pg.addColorStop(0,'rgba(255,255,255,0.55)');
    pg.addColorStop(0.6,'rgba(255,255,255,0.05)');
    ctx.fillStyle=pg;
    ctx.beginPath();
    ctx.arc(player.x-player.radius*0.25,player.y-player.radius*0.25,player.radius*0.7,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    for(const e of enemies){
      ctx.save();
      ctx.translate(e.x,e.y);
      ctx.rotate(Math.sin(performance.now()/500 + e.x + e.y)*0.08);
      ctx.fillStyle='rgba(0,0,0,0.12)';
      ctx.fillRect(-e.width/2,-e.height/2+6,e.width,e.height);
      ctx.fillStyle='#ff6b6b';
      ctx.fillRect(-e.width/2,-e.height/2,e.width,e.height);
      ctx.strokeStyle='rgba(0,0,0,0.15)';
      ctx.strokeRect(-e.width/2,-e.height/2,e.width,e.height);
      ctx.restore();
    }

    if(!running){
      ctx.fillStyle='rgba(2,6,12,0.6)';
      ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
      ctx.fillStyle='#fff';
      ctx.textAlign='center';
      ctx.font='bold 42px system-ui,Arial';
      ctx.fillText('Game Over', window.innerWidth/2, window.innerHeight/2-10);
      ctx.font='600 20px system-ui,Arial';
      ctx.fillText(`Score: ${score}`, window.innerWidth/2, window.innerHeight/2+26);
      ctx.font='400 15px system-ui,Arial';
      ctx.fillText('Press "Replay" button to play again', window.innerWidth/2, window.innerHeight/2+56);
    }
  }

  function loop(now){
    const dt = Math.min(0.05,(now-lastTime)/1000);
    lastTime=now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  initGame();
  requestAnimationFrame(loop);

  window.addEventListener('keydown',(e)=>{
    if(e.key===' '){ running = !running; e.preventDefault(); }
    if(e.key.toLowerCase()==='r') initGame();
  });

})();