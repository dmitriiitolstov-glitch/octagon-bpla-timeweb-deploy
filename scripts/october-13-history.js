(()=>{
 const root=document.querySelector('.history-v2');if(!root)return;
 const links=[...root.querySelectorAll('.history-year-nav a')];
 const sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
 const companyMenu=root.querySelector('.history-company-menu'),mq=matchMedia('(max-width:700px)');
 function adapt(){companyMenu.open=!mq.matches}adapt();mq.addEventListener('change',adapt);
 let queued=false;
 function update(){queued=false;const nav=root.querySelector('.history-year-nav').getBoundingClientRect();const header=document.querySelector('body>header')||document.querySelector('.n-header');const offset=Math.max(190,(header?.getBoundingClientRect().bottom||130)+nav.height+40);let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=offset)current=section;for(const link of links){if(link.hash==='#'+current.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);addEventListener('hashchange',update);update();
})();
