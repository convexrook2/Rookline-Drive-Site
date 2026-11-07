/* Website playback only: recorded estimate snapshots, recorded player GPS,
   and explicitly simulated traffic. This does not run the product's model. */
(() => {
  'use strict';
  const root = document.getElementById('storm-replay');
  if (!root) return;
  const asset = new URL('assets/interlagos-storm.json', document.currentScript.src);
  const byId = id => document.getElementById(id);
  const ns = 'http://www.w3.org/2000/svg';
  const timeline = byId('storm-timeline'), play = byId('storm-play');
  const speed = byId('storm-speed'), trafficToggle = byId('storm-show-traffic');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [...root.querySelectorAll('[data-storm-time]')];
  const palette = [[0, [245, 246, 247]], [.125, [115, 236, 217]], [.25, [89, 212, 237]],
    [.4, [72, 172, 245]], [.7, [39, 137, 239]], [1, [52, 120, 230]]];
  let data, time = 0, intent = !reduced.matches, visible = false, raf = 0;
  let previous = null, fieldStamp = -Infinity, loading = false, activeChapter = '';
  let fields = [], traffic = [];

  function element(tag, attrs, parent) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    parent.appendChild(node);
    return node;
  }
  function locate(rows, t) {
    let low = 0, high = rows.length - 1;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (rows[mid][0] <= t) low = mid; else high = mid - 1;
    }
    const a = rows[low], b = rows[Math.min(low + 1, rows.length - 1)];
    return [a, b, b[0] > a[0] ? Math.max(0, Math.min(1, (t-a[0])/(b[0]-a[0]))) : 0];
  }
  function colour(w) {
    let i = 1;
    while (i < palette.length - 1 && palette[i][0] < w) i++;
    const [lo, a] = palette[i-1], [hi, b] = palette[i];
    const q = Math.max(0, Math.min(1, (w-lo)/(hi-lo)));
    return `rgb(${a.map((v, j) => Math.round(v+(b[j]-v)*q)).join(',')})`;
  }
  function wetAt(frame, fraction) {
    const count = frame.length - 2, at = fraction*count-.5, i = Math.floor(at), q = at-i;
    const a = frame[2+((i%count)+count)%count], b = frame[2+(((i+1)%count)+count)%count];
    return (a+(b-a)*q)/10000;
  }
  function clock(t) {
    const total = Math.floor(t);
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  }
  function buildMap() {
    const points = data.points;
    const d = 'M'+points.map(p => `${p[0]} ${p[1]}`).join(' L')+' Z';
    byId('storm-edge').setAttribute('d', d);
    byId('storm-tarmac').setAttribute('d', d);
    const definitions = byId('storm-gradients'), surface = byId('storm-surface');
    const segments = data.frames[0].length - 2;
    fields = [];
    for (let i = 0; i < segments; i++) {
      const from = i*4, to = (i+1)*4, a = points[from], b = points[to];
      const gradient = element('linearGradient', {id:`storm-wet-${i}`, gradientUnits:'userSpaceOnUse',
        x1:a[0], y1:a[1], x2:b[0], y2:b[1]}, definitions);
      const stops = [element('stop', {offset:0}, gradient), element('stop', {offset:1}, gradient)];
      element('path', {d:'M'+points.slice(from, to+1).map(p=>`${p[0]} ${p[1]}`).join(' L'),
        stroke:`url(#storm-wet-${i})`}, surface);
      fields.push({stops, fractions:[a[2], b[2]]});
    }
    traffic = [0,1,2].map(i => {
      const g = element('g', {}, byId('storm-traffic'));
      element('circle', {r:8, class:'storm-demo-marker'}, g);
      element('text', {'text-anchor':'middle', 'dominant-baseline':'central', class:'storm-demo-number'}, g).textContent = i+1;
      return g;
    });
  }
  function updateTraffic() {
    const layer = byId('storm-traffic');
    layer.hidden = !trafficToggle.checked;
    // SVG uses display rather than relying on HTMLElement.hidden behavior.
    layer.setAttribute('display', trafficToggle.checked ? 'inline' : 'none');
    if (!trafficToggle.checked) return;
    traffic.forEach((node, i) => {
      const period = data.trafficLapSeconds*[.95,1.03,1.09][i];
      const phase = ((time-data.start)/period+[.18,.48,.76][i])%1;
      const [a,b,q] = locate(data.trafficLap, phase*data.trafficLapSeconds);
      const fraction = a[1]+(b[1]-a[1])*q;
      const at = fraction*(data.points.length-1), j = Math.floor(at), blend = at-j;
      const p = data.points[j], next = data.points[Math.min(j+1,data.points.length-1)];
      node.setAttribute('transform', `translate(${(p[0]+(next[0]-p[0])*blend).toFixed(3)} ${(p[1]+(next[1]-p[1])*blend).toFixed(3)})`);
    });
  }
  function paint(force = false) {
    if (!data) return;
    const [a,b,q] = locate(data.frames, time);
    if (force || Math.abs(time-fieldStamp) >= .5) {
      fields.forEach(({stops, fractions}) => stops.forEach((stop, i) => {
        const before = wetAt(a, fractions[i]), after = wetAt(b, fractions[i]);
        stop.setAttribute('stop-color', colour(before+(after-before)*q));
      }));
      fieldStamp = time;
    }
    const [car,next,blend] = locate(data.car, time);
    // Interpolate coordinates only across continuous native samples.
    const lerp = next[0]-car[0] <= .5 ? blend : 0;
    const x = car[1]+(next[1]-car[1])*lerp, y = car[2]+(next[2]-car[2])*lerp;
    byId('storm-car').setAttribute('transform',`translate(${x.toFixed(3)} ${y.toFixed(3)})`);
    updateTraffic();
    timeline.value = time.toFixed(1);
    const condition = a[1] > .7 ? 'Storm passing' : a[1] > 0 ? 'Rain falling' : time < 30 ? 'Dry start' : 'Drying line';
    byId('storm-condition').textContent = condition;
    byId('storm-time').textContent = clock(time);
    timeline.setAttribute('aria-valuetext', `${clock(time)} of ${clock(data.end)}. ${condition}.`);
    const chapter = time < 90 ? '7.2' : time < 706 ? '200.2' : '1000';
    if (chapter !== activeChapter) {
      chapters.forEach(button => {
        if (button.dataset.stormTime === chapter) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      activeChapter = chapter;
    }
  }
  function canRun() { return data && intent && visible && !document.hidden; }
  function playbackState() {
    play.textContent = time >= (data?.end ?? Infinity) ? 'Replay' : intent ? 'Pause' : 'Play';
    play.setAttribute('aria-label', `${play.textContent} storm replay`);
    if (canRun() && !raf) raf = requestAnimationFrame(tick);
    if (!canRun() && raf) { cancelAnimationFrame(raf); raf = 0; }
    previous = null;
  }
  function tick(now) {
    raf = 0;
    if (!canRun()) { previous = null; return; }
    if (previous !== null) time = Math.min(data.end, time+(now-previous)/1000*Number(speed.value));
    previous = now;
    paint();
    if (time >= data.end) { intent = false; playbackState(); return; }
    raf = requestAnimationFrame(tick);
  }
  function seek(t) {
    if (!data) return;
    time = Math.max(data.start, Math.min(data.end, t));
    previous = null;
    paint(true);
    playbackState();
  }
  play.addEventListener('click', () => {
    if (time >= data.end) { time = data.start; paint(true); }
    intent = !intent;
    playbackState();
  });
  timeline.addEventListener('input', () => seek(Number(timeline.value)));
  speed.addEventListener('change', () => { previous = null; });
  trafficToggle.addEventListener('change', updateTraffic);
  chapters.forEach(button => button.addEventListener('click', () => seek(Number(button.dataset.stormTime))));
  document.addEventListener('visibilitychange', playbackState);
  reduced.addEventListener('change', () => { if (reduced.matches) intent = false; playbackState(); });

  async function load() {
    if (loading || data) return;
    loading = true;
    byId('storm-error').hidden = true;
    try {
      const response = await fetch(asset);
      if (!response.ok) throw new Error('Replay unavailable');
      const candidate = await response.json();
      if (candidate.schema !== 1 || !candidate.frames?.length || candidate.points?.length !== 685 || !candidate.car?.length)
        throw new Error('Replay invalid');
      data = candidate;
      time = data.start;
      timeline.min = data.start; timeline.max = data.end;
      buildMap(); paint(true);
      byId('storm-map').hidden = false;
      byId('storm-map').removeAttribute('hidden');
      byId('storm-poster').hidden = true;
      byId('storm-controls').hidden = false;
      playbackState();
    } catch {
      data = null;
      byId('storm-error').hidden = false;
    } finally { loading = false; }
  }
  byId('storm-retry').addEventListener('click', load);
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (visible) load();
    playbackState();
  }, {threshold:.15});
  observer.observe(root);
  window.addEventListener('pagehide', () => { if (raf) cancelAnimationFrame(raf); raf = 0; previous = null; });
  window.addEventListener('pageshow', playbackState);
})();
