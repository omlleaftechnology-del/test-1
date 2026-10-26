// Apply saved listings to the existing visitor catalog and gallery.
Pivert.applyListings = records => {
  const container=document.querySelector('.properties');container.replaceChildren();
  const tags={residential:'RÉSIDENTIEL',commercial:'COMMERCIAL'};
  const stateLabels={available:'Disponible',reserved:'Réservé',rented:'Loué',project:'Projet'};
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  for(const record of records.filter(r=>r.publication==='published')){
    const fr=record.text.fr, title=fr.title;
    const requestValue=(record.seed && Pivert.details[record.seed]?.[3]) || title;
    for(const lang of ['en','ru','es']){
      const t=record.text[lang]||{};
      for(const [key,value] of Object.entries(fr)){
        if(key==='features')continue;
        if(value&&t[key])Pivert.locales[lang][value]=t[key];
      }
      const originals=(fr.features||'').split('\n'),translated=(t.features||'').split('\n');
      originals.forEach((value,i)=>{if(value&&translated[i])Pivert.locales[lang][value]=translated[i];});
    }
    const seed=record.seed?Pivert.properties[record.seed]:{};
    Pivert.details[record.id]=[record.status==='project'?'PROJET SUR PLANS · MODÈLE 3D':tags[record.type],title,fr.description,requestValue];
    Pivert.properties[record.id]={...seed,model:record.model||null,address:record.address,area:record.area||'À confirmer',price:record.price||'Sur demande',availability:['reserved','rented'].includes(record.status)?stateLabels[record.status]:(fr.availability||stateLabels[record.status]),photos:record.photos.length?record.photos:['assets/listing-placeholder.svg'],features:(fr.features||'').split('\n').filter(Boolean),realPhotos:record.realPhotos};
    const option=document.createElement('option');option.value=requestValue;option.textContent=title;
    if(![...document.querySelector('#request').options].some(o=>o.value===requestValue))document.querySelector('#request').append(option);
    const card=el('article','property');card.dataset.type=record.type;
    const picture=el('button','property-picture');picture.type='button';picture.dataset.detail=record.id;
    const image=el('img');image.src=record.photos[0]||'assets/listing-placeholder.svg';image.alt=title;image.loading='lazy';picture.append(image,el('span','tag',record.status==='project'?'PROJET · 3D':tags[record.type]),el('span','round','↗'));
    const arrow=picture.querySelector('.round');arrow.textContent='';arrow.innerHTML='<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
    picture.append(el('span','picture-note',record.realPhotos?'Photos du local':(seed.galleryNote||'Photo d’ambiance')));
    card.append(picture,el('p','location',record.city),el('h3','',title),el('p','card-description',fr.summary||fr.description.slice(0,110)),el('p','spec',record.area||'À confirmer'),el('p','card-address',record.address));
    const price=el('div','price');price.append(el('strong','',record.price||'Sur demande'),el('span','listing-state',stateLabels[record.status]));card.append(price);container.append(card);
  }
};
