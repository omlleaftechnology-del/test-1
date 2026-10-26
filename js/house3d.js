// A fresh iframe per opening prevents stale close/load events clearing a model.
Pivert.initHouse3D = () => {
  const gallery=document.querySelector('.detail-gallery'),dialog=document.querySelector('#detail');
  const controls=document.createElement('div');controls.className='model-tabs';
  controls.innerHTML='<button type="button" id="show-photos" aria-pressed="true">Photos</button><button type="button" id="show-model" aria-pressed="false">Modèle 3D</button>';
  gallery.prepend(controls);
  const panel=document.createElement('div');panel.className='model-panel supplied-model';panel.hidden=true;gallery.append(panel);
  const stage=gallery.querySelector('.gallery-stage'),thumbs=document.querySelector('#gallery-thumbnails');
  const photos=document.querySelector('#show-photos'),model=document.querySelector('#show-model');
  let frame=null,timer=null,uploadedModel=null;
  const messages={fr:['Chargement du modèle…','Réessayer'],en:['Loading 3D model…','Retry'],ru:['Загрузка 3D-модели…','Повторить'],es:['Cargando modelo 3D…','Reintentar']};
  function release(){clearTimeout(timer);panel.replaceChildren();frame=null;}
  function mount(){
    release();
    const text=messages[Pivert.language]||messages.fr;
    const status=document.createElement('div');status.className='model-loading-state';status.setAttribute('role','status');
    const label=document.createElement('span');label.textContent=text[0];status.append(label);
    const retry=document.createElement('button');retry.type='button';retry.textContent=text[1];retry.hidden=true;retry.onclick=mount;status.append(retry);
    frame=document.createElement('iframe');frame.id='supplied-house-model';frame.title='Multi 661 — 3D';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('allow','fullscreen');frame.allowFullscreen=true;
    panel.append(frame,status);
    frame.srcdoc=uploadedModel?Pivert.getGLBDocument(uploadedModel):Pivert.getModelDocument();
    timer=setTimeout(()=>{retry.hidden=false;},18000);
  }
  addEventListener('message',event=>{
    if(!frame||event.source!==frame.contentWindow)return;
    if(event.data?.type==='pivert-model-ready'){
      clearTimeout(timer);panel.querySelector('.model-loading-state')?.remove();
    }else if(event.data?.type==='pivert-model-error'){
      const retry=panel.querySelector('.model-loading-state button');if(retry)retry.hidden=false;
    }
  });
  function setView(show){
    panel.hidden=!show;stage.hidden=show;thumbs.hidden=show;
    dialog.classList.toggle('model-open',show);photos.setAttribute('aria-pressed',!show);model.setAttribute('aria-pressed',show);
    if(show){if(!frame)mount();}else release();
  }
  photos.onclick=()=>setView(false);model.onclick=()=>setView(true);
  // close is queued by the browser; ignore an old close event after reopening.
  dialog.addEventListener('close',()=>{if(!dialog.open)release();});
  Pivert.refreshModelLanguage=()=>{if(frame&&!panel.hidden)mount();};
  Pivert.setModelAvailable=(available,file)=>{release();uploadedModel=file||null;controls.hidden=!available;setView(available);};
  controls.hidden=true;
};
