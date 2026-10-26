// Local-only CMS storage. IndexedDB holds text and uploaded photos on this device.
Pivert.listings = (() => {
  let db;
  const requestResult = request => new Promise((resolve,reject) => {request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
  const transact = (mode,action) => new Promise((resolve,reject) => {
    const tx=db.transaction('listings',mode);let result;
    try {result=action(tx.objectStore('listings'));}catch(error){reject(error);return;}
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Storage aborted'));
  });
  const translated=(text,lang)=>lang==='fr'?text:(Pivert.locales[lang]?.[text]||text);
  async function init(){
    const open=indexedDB.open('pivert-listings-v1',1);
    open.onupgradeneeded=()=>open.result.createObjectStore('listings',{keyPath:'id'});
    db=await requestResult(open);
    const records=await all();
    if(!records.length){
      const seeds=['commercial','residential','foucault'].map((id,index)=>{
        const property=Pivert.properties[id],detail=Pivert.details[id],card=document.querySelector(`[data-detail="${id}"]`).closest('article');
        const text={};
        for(const lang of ['fr','en','ru','es'])text[lang]={title:translated(detail[1],lang),description:translated(detail[2],lang),summary:translated(card.querySelector('.card-description')?.textContent||'',lang),availability:translated(property.availability||'',lang),features:(property.features||[]).map(t=>translated(t,lang)).join('\n')};
        return {id,order:index,type:id==='commercial'?'commercial':'residential',publication:'published',status:id==='foucault'?'project':'available',city:card.querySelector('.location').textContent,address:property.address,area:property.area,price:property.price,text,photos:[...property.photos],realPhotos:!!property.realPhotos,seed:id,createdAt:Date.now(),updatedAt:Date.now()};
      });
      await transact('readwrite',store=>seeds.forEach(item=>store.put(item)));
    }
  }
  async function all(){const items=await requestResult(db.transaction('listings').objectStore('listings').getAll());return items.sort((a,b)=>(a.order??100)-(b.order??100)||b.createdAt-a.createdAt);}
  async function save(record){record.updatedAt=Date.now();await transact('readwrite',store=>store.put(record));}
  async function importRecords(records){
    const languages=['fr','en','ru','es'];
    for(const r of records){
      if(typeof r.id!=='string'||typeof r.text?.fr?.description!=='string'||!r.text?.fr?.title||!['commercial','residential'].includes(r.type)||!Array.isArray(r.photos)||r.photos.some(src=>typeof src!=='string'||!(/^(assets\/|data:image\/(jpeg|png|webp);base64,|https:\/\/)/.test(src))))throw Error('Invalid backup');
      if(r.model)Pivert.validateGLBRecord(r.model);
      if(!['draft','published','archived'].includes(r.publication))throw Error('Invalid state');
      if(!['available','reserved','rented','project'].includes(r.status)||!(/^[a-zA-Z0-9_-]{1,100}$/.test(r.id)))throw Error('Invalid listing');
      for(const key of ['city','address','area','price'])if(typeof r[key]!=='string')throw Error('Invalid field');
      if(r.photos.length>12)throw Error('Too many photographs');
      for(const language of languages){for(const value of Object.values(r.text[language]||{})){if(typeof value!=='string')throw Error('Invalid text');}}
    }
    await transact('readwrite',store=>records.forEach(r=>store.put(r)));
  }
  return {init,all,save,importRecords};
})();
