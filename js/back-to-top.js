// A small scroll shortcut; hidden at the top and while a dialog is open.
(() => {
  if(new URLSearchParams(location.search).has('admin'))return;
  const button=document.createElement('button');button.type='button';button.className='back-to-top';button.hidden=true;
  button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 11 6-6 6 6M12 5v14"/></svg>';
  const labels={fr:'Retour en haut',en:'Back to top',ru:'Наверх',es:'Volver arriba'};
  function update(){button.hidden=window.scrollY<500;button.setAttribute('aria-label',labels[document.documentElement.lang]||labels.fr);}
  button.onclick=()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.body.append(button);addEventListener('scroll',update,{passive:true});
  new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});update();
})();
