
(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Navbar shrink on scroll
  const nav = document.querySelector('.nav-compact');
  const onScroll = () => {
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Intersection Observer for reveal
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    })
  }, {threshold: .15});
  $$('.reveal-up').forEach(el=>obs.observe(el));

  // Smooth scroll for internal links
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if (id.length>1){
        const el = document.querySelector(id);
        if (el){
          e.preventDefault();
          window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - 72, behavior:'smooth'});
          history.replaceState(null, '', id);
        }
      }
    })
  })

  // Current year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();


  // Dynamic SEO: update title + meta description based on visible section
  const sections = [
    { id:'#inicio', title:'BTA WEB — Soluciones web para negocios de fumigación', desc:'Páginas, PWAs y PDFs con firma para digitalizar tu operación.' },
    { id:'#servicios', title:'Servicios — BTA WEB', desc:'Aplicaciones a medida, PWAs para constancias, PDFs con firma y más.' },
    { id:'#por-que', title:'¿Por qué digitalizar? — BTA WEB', desc:'Ahorra tiempo, reduce errores, trabaja offline y mejora la experiencia.' },
    { id:'#trabajos', title:'Trabajos — BTA WEB', desc:'Interfaces limpias y flujos listos para campo.' },
    { id:'#precios', title:'Precios — BTA WEB', desc:'Planes claros en MXN y opciones ajustadas a tu presupuesto.' },
    { id:'#faq', title:'Preguntas frecuentes — BTA WEB', desc:'Tiempos, PDFs con firma, modalidades y presupuesto.' },
    { id:'#contacto', title:'Contacto — BTA WEB', desc:'Arma tu mensaje y contáctanos por WhatsApp.' }
  ];
  const metaDesc = document.querySelector('meta[name="description"]');
  const seoObs = new IntersectionObserver((ents)=>{
    ents.forEach(ent=>{
      if (ent.isIntersecting){
        const s = sections.find(x=> x.id === '#' + ent.target.id);
        if (s){
          document.title = s.title;
          if (metaDesc) metaDesc.setAttribute('content', s.desc);
        }
      }
    })
  }, { threshold: 0.6 });
  sections.forEach(s=>{ const el = $(s.id); if (el) seoObs.observe(el); });

  // WhatsApp-ready form
  const btn = $('#btnWhats');
  if (btn){
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const nombre = $('#cNombre').value.trim();
      const empresa = $('#cEmpresa').value.trim();
      const servicio = $('#cServicio').value;
      const presupuesto = $('#cPresupuesto').value.trim();
      const mensaje = $('#cMensaje').value.trim();
      if (!nombre){
        alert('Por favor, ingresa tu nombre.');
        return;
      }
      const parts = [
        `Hola BTA WEB, soy ${nombre}.`,
        empresa ? `Empresa: ${empresa}.` : '',
        servicio ? `Me interesa: ${servicio}.` : '',
        presupuesto ? `Presupuesto aprox: $${presupuesto} MXN.` : '',
        mensaje ? `Detalles: ${mensaje}` : ''
      ].filter(Boolean);
      const full = encodeURIComponent(parts.join(' '));
      const url = `https://wa.me/527551277694?text=${full}`;
      window.open(url, '_blank', 'noopener');
    });
  }

  // --- Micro-interacciones: SERVICIOS (spotlight + tilt + ripple) ---
{
  const cards = $$('#servicios .service-card');
  if (cards.length) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    cards.forEach(card => {
      let raf = null;

      function onMove(e){
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${pointerX}px`);
        card.style.setProperty('--my', `${pointerY}px`);

        if (reduce) return;

        // Tilt 3D ligerísimo (máx. ~6°), GPU-safe
        if (!raf) {
          raf = requestAnimationFrame(() => {
            const rx = ((pointerY / rect.height) - 0.5) * -6;
            const ry = ((pointerX / rect.width)  - 0.5) *  6;
            // No pisamos tu reveal: sobre el estado actual sólo añadimos rotación
            const base = card.matches(':hover, :focus-visible') ? 'translateY(-2px)' : '';
            card.style.transform = `${base} rotateX(${rx}deg) rotateY(${ry}deg)`;
            raf = null;
          });
        }
      }

      function resetTilt(){
        card.style.transform = ''; // vuelve al estado base (tu CSS + reveal)
      }

      // Spotlight/tilt
      card.addEventListener('pointermove', onMove, {passive:true});
      card.addEventListener('pointerleave', resetTilt);

      // Accesibilidad teclado: al enfocar, centramos el spotlight y marcamos visible si aplica
      card.addEventListener('focus', () => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${rect.width/2}px`);
        card.style.setProperty('--my', `${rect.height/2}px`);
        card.classList.add('visible'); // compatible con tu reveal existente
      }, true);

      // Ripple click sutil (opcional)
      card.addEventListener('click', (e) => {
        const r = document.createElement('span');
        r.className = 'svc-ripple';
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        r.style.width = r.style.height = size + 'px';
        r.style.left = (e.clientX - rect.left - size/2) + 'px';
        r.style.top  = (e.clientY - rect.top  - size/2) + 'px';
        card.appendChild(r);
        setTimeout(() => r.remove(), 450);
      });
    });
  }
}

})();
