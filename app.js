'use strict';
const INSTRUMENTS=[
  {
    "id": "speedo",
    "name": "The driving instrument.",
    "category": "CAR STATE",
    "image": "assets/speedo.jpg",
    "alt": "Current Drive Speedo with synthetic gear 4, speed 173 km/h, fuel, virtual energy, electronics and temperature values.",
    "description": "The familiar speed/gear/RPM hierarchy sits alongside integrated electronics, fuel/energy range, thermal and damage feedback. Custom manufacturer appearances add an original visual identity.",
    "takeaway": "Keep related information together."
  },
  {
    "id": "tyres",
    "name": "Four corners, understood.",
    "category": "TYRES + BRAKES",
    "image": "assets/tyres.jpg",
    "alt": "Current Drive tyre panel showing four soft tyres with synthetic condition, pressure, estimated rubber temperature and brake temperatures.",
    "description": "Condition, compound, pressure, estimated rubber temperature and brake temperatures sit together. Surface-temperature colour research remains distinct from the estimated numeric tyre readout.",
    "takeaway": "Make the type of measurement clear."
  },
  {
    "id": "timing",
    "name": "The lap, in context.",
    "category": "TIMING + FEEDBACK",
    "image": "assets/timing.jpg",
    "alt": "Drive lap timing panel with synthetic lap times, sectors and a green negative delta.",
    "description": "The Lap, Last, Best and Current stack, sector feedback and directional delta were refined against reference screenshots and driving video.",
    "takeaway": "Reproduce the behavior as well as the layout."
  },
  {
    "id": "standings",
    "name": "Your place in the field.",
    "category": "RACE POSITION",
    "image": "assets/standings.jpg",
    "alt": "Drive standings tower with synthetic Hypercar entries, the highlighted player in position 4, tyre and energy indicators.",
    "description": "The multiclass tower shows nearby cars in your class and the leaders of the other classes. See timing, tyres, energy and penalties, and switch views with your bindings.",
    "takeaway": "Keep race context within a glance."
  },
  {
    "id": "map",
    "name": "Traffic and track conditions.",
    "category": "TRACK AWARENESS",
    "image": "assets/track-map.jpg",
    "alt": "Drive Long Beach circuit map with synthetic cars and a cyan player marker.",
    "description": "All cars, Your class and Follow your car provide three perspectives. In Follow mode the player points up while the circuit and traffic move together. Choose a player marker style, follow estimated wetting and drying, compare online pace patterns and spot active yellow sectors.",
    "takeaway": "Let the camera change; keep orientation readable."
  },
  {
    "id": "weather",
    "name": "Weather and road conditions.",
    "category": "WEATHER + FORECAST",
    "image": "assets/weather.jpg",
    "alt": "Drive weather renderer with synthetic current conditions and a five-period forecast.",
    "description": "Live current conditions and a five-period session forecast sit alongside one another. Measured track wetness remains distinct from forecast information.",
    "takeaway": "Current observations and predictions mean different things."
  },
  {
    "id": "flags",
    "name": "Signals that earn their space.",
    "category": "FLAGS + MESSAGES",
    "image": "assets/compact-flags.png",
    "alt": "Current production review fixture with synthetic blue and yellow flags, green pit-service wrench, small chequered flag and Leader Finished message.",
    "description": "Two compact animated flag surfaces, a small green pit wrench and messages outside the cloth give each signal a defined role. During a stop, the pit service card below shows the estimate, elapsed time and job status.",
    "takeaway": "Fit the warning to the space available.",
    "compact": true
  }
];
const RESEARCH=[
  {
    "id": "engine-context",
    "title": "That doesn’t sound right.",
    "image": "assets/damage-engine.jpg",
    "alt": "Drive engine-warning example with red engine and oil indications, using demonstration data.",
    "copy": "Heat and suspected engine failure get their own cues."
  },
  {
    "id": "tyre-research",
    "title": "Four little contact patches.",
    "image": "assets/tyres.jpg",
    "alt": "Drive tyre panel showing all four tyres with wear and temperature information, using demonstration data.",
    "copy": "A quick glance at the rubber doing all the hard work."
  },
  {
    "id": "wetness-evolution",
    "title": "After the rain.",
    "image": "assets/interlagos-local-fade-poster.png",
    "alt": "Interlagos development preview with different stretches coloured white, teal and blue.",
    "copy": "The road keeps changing while you’re parked. Surface colours are estimates; this preview’s drying times are illustrative."
  }
];
const el=id=>document.getElementById(id);
let activePanel=0;
const tabs=[...document.querySelectorAll('[data-panel]')];
const stage=document.querySelector('.instrument-stage');
stage.id='instrument-panel';stage.setAttribute('role','tabpanel');stage.setAttribute('aria-labelledby','instrument-speedo');
tabs.forEach(tab=>tab.setAttribute('aria-controls','instrument-panel'));
function choosePanel(index,focus=false){
  activePanel=(index+INSTRUMENTS.length)%INSTRUMENTS.length;
  const item=INSTRUMENTS[activePanel];
  tabs.forEach((tab,i)=>{const active=i===activePanel;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
  stage.setAttribute('aria-labelledby','instrument-'+item.id);
  el('plate-number').textContent='INSTRUMENT '+String(activePanel+1).padStart(2,'0')+' / 07';
  el('plate-category').textContent=item.category;
  el('plate-image').src=item.image;el('plate-image').alt=item.alt;el('plate-image').classList.toggle('compact',!!item.compact);
  el('plate-title').textContent=item.name;el('plate-description').textContent=item.description;
  el('plate-takeaway').replaceChildren(Object.assign(document.createElement('span'),{textContent:'KEY POINT'}),document.createTextNode(item.takeaway));
  el('open-image').setAttribute('aria-label','Enlarge '+item.name.replace(/\.$/,'')+' screenshot');
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>choosePanel(index));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight'||event.key==='ArrowDown')next=index+1;
    if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=index-1;
    if(event.key==='Home')next=0;if(event.key==='End')next=INSTRUMENTS.length-1;
    if(next!==undefined){event.preventDefault();choosePanel(next,true);}
  });
});
el('previous-panel').addEventListener('click',()=>choosePanel(activePanel-1));
el('next-panel').addEventListener('click',()=>choosePanel(activePanel+1));
function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
for(const note of RESEARCH){
 const article=node('article','visual-note');article.id='research-'+note.id;
 const image=node('img');image.src=note.image;image.alt=note.alt;image.loading='lazy';
 image.width=1363;image.height=936;
 article.append(image,node('h3','',note.title),node('p','',note.copy));
 el('research-notes').append(article);
}
const indexDialog=el('index-dialog'),imageDialog=el('image-dialog');
function lockScroll(){document.body.style.overflow='hidden';}
function unlockScroll(){if(!indexDialog.open&&!imageDialog.open)document.body.style.overflow='';}
document.querySelector('.index-trigger').addEventListener('click',()=>{indexDialog.showModal();lockScroll();});
el('close-index').addEventListener('click',()=>indexDialog.close());
indexDialog.addEventListener('close',unlockScroll);
indexDialog.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>indexDialog.close()));
el('open-image').addEventListener('click',()=>{
 const item=INSTRUMENTS[activePanel];el('image-title').textContent=item.name.toUpperCase();el('dialog-image').src=item.image;el('dialog-image').alt=item.alt;el('dialog-image').classList.toggle('compact',!!item.compact);
 el('dialog-caption').textContent=item.compact?'Drive gallery · demonstration notices':'Drive gallery · demonstration telemetry';
 imageDialog.showModal();lockScroll();
});
el('close-image').addEventListener('click',()=>imageDialog.close());
imageDialog.addEventListener('close',unlockScroll);
imageDialog.addEventListener('click',event=>{if(event.target===imageDialog){const r=imageDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)imageDialog.close();}});
function openEvidenceForHash(hash){
 const target=document.getElementById(hash.slice(1));if(!target)return;
 let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
 if(target.tagName==='DETAILS')target.open=true;
}
document.addEventListener('click',event=>{
 const a=event.target.closest('a[href^="#"]');if(a)openEvidenceForHash(a.getAttribute('href'));
});
window.addEventListener('hashchange',()=>openEvidenceForHash(location.hash));
if(location.hash)openEvidenceForHash(location.hash);
const railLinks=[...document.querySelectorAll('.chapter-rail nav a')];
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible){railLinks.forEach(a=>{const active=a.dataset.section===visible.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-12% 0px -45% 0px',threshold:0});
 document.querySelectorAll('section[id]').forEach(section=>observer.observe(section));
}
let scrollQueued=false;
function updateProgress(){const max=document.documentElement.scrollHeight-window.innerHeight;document.querySelector('.reading-progress').style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,window.scrollY/max)):0)+')';scrollQueued=false;}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
choosePanel(0);


// Portfolio-only image comparisons; all images are captures of the production renderer.
const CONDITION_STATES=[
 {id:'corners',title:'Localise the damage.',image:'assets/damage-corners.jpg',alt:'Drive car diagram with front and left body damage plus independently coloured suspension corners.',description:'The car diagram keeps eight bodywork locations and all four suspension corners independent. This example combines front and left body damage with different suspension severities at three corners.',takeaway:'Location, severity and component presence need separate signals.'},
 {id:'puncture',title:'Recognise a puncture.',image:'assets/damage-puncture.jpg',alt:'Drive Speedo with an amber warning on the front-left tyre, captured at the strong warning phase.',description:'A native flat-tyre state produces an amber pulse at that corner. Its fading phase reveals the live thermal colour underneath. Low positive wear has its own steady warning rules.',takeaway:'Actual flatness and remaining wear should not be confused by a rounded number.'},
 {id:'detachment',title:'See the whole affected corner.',image:'assets/damage-detachment.jpg',alt:'Drive Speedo with coordinated red front-left tyre, brake and suspension warnings and a separate rear-wing warning.',description:'A confirmed missing wheel coordinates red tyre, brake and suspension overlays at the same corner. This example also shows the separate rear-wing warning from Drive’s implemented body-detachment mapping.',takeaway:'A lost component should remain recognisable across every representation of it.'},
 {id:'overheating',title:'Read the thermal warning.',image:'assets/damage-overheating.jpg',alt:'Drive Speedo with an orange engine indicator and red oil-temperature indication for raw overheating.',description:'An orange engine symbol and red oil feedback call out overheating. Suspected engine failure has its own red engine warning.',takeaway:'See which engine warning needs your attention.'},
 {id:'engine',title:'Interpret the stopped engine.',image:'assets/damage-engine.jpg',alt:'Drive Speedo at zero speed and neutral with the red inferred engine-failure indicator.',description:'A red engine warning represents the admitted inferred-failure state. The underlying logic considers heat, impact and lifecycle context, protects stalls, pit power-off and fuel exhaustion, and permits correction after a successful restart.',takeaway:'The display needs the cause and context, not just zero RPM.'}
];
const SPEEDO_STYLES=[
 {id:'bmw',title:'BMW M Hybrid V8',design:'72 ANGLED SEGMENTS',description:'Angled segments and a blue/cyan palette give the BMW profile its character. Speed, gear and warning cues stay in familiar places.'},
 {id:'ferrari',title:'Ferrari 499P',design:'60 CIRCULAR LEDS',description:'Circular LEDs move through yellow, amber, orange and red, paired with the Ferrari profile’s warm rim and shift-light palette.'},
 {id:'aston',title:'Aston Martin Valkyrie',design:'CONTINUOUS COLOUR BAND',description:'An unbroken arc uses green, lime, amber and red zones. Its continuous geometry gives the same driving information a different visual rhythm.'},
 {id:'porsche',title:'Porsche 963',design:'60 FINE ROUNDED BLOCKS',description:'Fine rounded blocks progress from silver through cyan to blue. The manufacturer identity changes the appearance while the warning and RPM states retain their meaning.'},
 {id:'cadillac',title:'Cadillac V-Series.R',design:'40 BROAD CURVED BLOCKS',description:'Broad curved blocks and a silver, gold, amber and red palette create a more widely spaced instrument treatment.'},
 {id:'alpine',title:'Alpine A424',design:'120 FINE RADIAL TICKS',description:'A dense set of fine radial ticks uses blue, white and red, demonstrating the sixth original RPM-arc family.'}
].map(s=>({...s,image:'assets/custom-speedo-'+s.id+'.jpg',alt:'Production Drive custom '+s.title+' Speedo, '+s.design.toLowerCase()+', using demonstration telemetry.'}));
let conditionIndex=0,skinIndex=0;
function setChoiceTabs(selector,index,panelId,focus=false){
 const list=[...document.querySelectorAll(selector)];
 list.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.setAttribute('aria-controls',panelId);tab.tabIndex=i===index?0:-1;if(i===index&&focus)tab.focus();});
 el(panelId).setAttribute('aria-labelledby',list[index].id);
}
function chooseCondition(index,focus=false){
 conditionIndex=(index+CONDITION_STATES.length)%CONDITION_STATES.length;const c=CONDITION_STATES[conditionIndex];
 setChoiceTabs('[data-condition]',conditionIndex,'condition-panel',focus);
 el('condition-image').src=c.image;el('condition-image').alt=c.alt;el('condition-title').textContent=c.title;el('condition-description').textContent=c.description;
 el('condition-takeaway').replaceChildren(Object.assign(document.createElement('span'),{textContent:'TAKEAWAY'}),document.createTextNode(c.takeaway));
}
function chooseSkin(index,focus=false){
 skinIndex=(index+SPEEDO_STYLES.length)%SPEEDO_STYLES.length;const c=SPEEDO_STYLES[skinIndex];
 setChoiceTabs('[data-skin]',skinIndex,'custom-speedo-panel',focus);
 el('skin-image').src=c.image;el('skin-image').alt=c.alt;el('skin-title').textContent=c.title;el('skin-design').textContent=c.design;el('skin-description').textContent=c.description;
}
function bindChoiceTabs(selector,choose){
 const list=[...document.querySelectorAll(selector)];list.forEach((tab,i)=>{
  tab.addEventListener('click',()=>choose(i));
  tab.addEventListener('keydown',e=>{let n;if(['ArrowRight','ArrowDown'].includes(e.key))n=i+1;if(['ArrowLeft','ArrowUp'].includes(e.key))n=i-1;if(e.key==='Home')n=0;if(e.key==='End')n=list.length-1;if(n!==undefined){e.preventDefault();choose(n,true);}});
 });
}
bindChoiceTabs('[data-condition]',chooseCondition);bindChoiceTabs('[data-skin]',chooseSkin);
function inspectPortfolioImage(item,caption){el('image-title').textContent=item.title.toUpperCase();el('dialog-image').src=item.image;el('dialog-image').alt=item.alt;el('dialog-image').classList.remove('compact');el('dialog-caption').textContent=caption;imageDialog.showModal();lockScroll();}
el('open-condition').addEventListener('click',()=>inspectPortfolioImage(CONDITION_STATES[conditionIndex],'Drive production renderer · synthetic condition example · 5 November 2026'));
el('open-skin').addEventListener('click',()=>inspectPortfolioImage(SPEEDO_STYLES[skinIndex],'Original custom Speedo design by ConvexRook · production renderer · demonstration telemetry'));
chooseCondition(0);chooseSkin(0);

const trackFadeVideo=el('track-fade-video');
const trackFadeMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function applyTrackFadeMotion(){
 if(trackFadeMotion.matches){trackFadeVideo.autoplay=false;trackFadeVideo.pause();}
 else {trackFadeVideo.autoplay=true;trackFadeVideo.play().catch(()=>{});}
}
trackFadeMotion.addEventListener('change',applyTrackFadeMotion);
applyTrackFadeMotion();

const replayTrackFade=el('replay-track-fade');
replayTrackFade.hidden=false;
replayTrackFade.addEventListener('click',()=>{
 trackFadeVideo.currentTime=0;
 trackFadeVideo.play().catch(()=>{});
});
