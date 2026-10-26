// Prototype management interface. No authentication or server publication yet.
Pivert.initAdmin = async () => {
  document.body.classList.add('admin-mode');
  document.documentElement.lang='fr';document.title='Pivert — Mes propriétés';
  const root=document.createElement('div');root.id='admin-root';
  root.innerHTML=`<aside class="admin-sidebar"><img src="assets/logo.png" alt="Pivert"><span class="admin-workspace">УПРАВЛЕНИЕ НЕДВИЖИМОСТЬЮ</span><button class="admin-nav active">▦ <span>Мои объекты</span></button><a href="?" target="_blank" rel="noopener">↗ <span>Посмотреть сайт</span></a><div class="admin-sidebar-bottom"><strong>Локальная версия</strong><p>Рабочее место на этом устройстве.</p></div></aside>
  <main class="admin-main"><div class="admin-top"><div><p class="admin-eyebrow">КАБИНЕТ PIVERT</p><h1>Мои объекты</h1><p>Объявления, фотографии и доступность — в одном месте.</p></div><button class="admin-primary" id="admin-add">＋ Добавить объект</button></div>
  <div class="admin-local-notice"><span>◉</span><p><strong>Изменения сохраняются только в этом браузере.</strong> Вход и публикацию для всех посетителей подключим на следующем этапе. Скачивайте резервную копию, чтобы сохранить свои изменения.</p></div>
  <div class="admin-stats" id="admin-stats"></div><div class="admin-toolbar"><div class="admin-filters"><button data-admin-filter="all" class="active">Все</button><button data-admin-filter="published">На сайте</button><button data-admin-filter="draft">Черновики</button><button data-admin-filter="archived">Архив</button></div><input id="admin-search" placeholder="Поиск по названию или адресу" aria-label="Поиск объектов"></div>
  <div id="admin-list"></div><div class="admin-backup"><button id="admin-export">↓ Скачать резервную копию</button><label>↑ Импортировать копию<input type="file" id="admin-import" accept="application/json,.json" hidden></label></div><p id="admin-status" role="status"></p>
  </main>
  <dialog id="admin-editor"><form id="admin-form"><div class="editor-heading"><div><p class="admin-eyebrow">ОБЪЕКТ НЕДВИЖИМОСТИ</p><h2 id="editor-title">Новый объект</h2></div><button type="button" id="editor-close" aria-label="Закрыть">×</button></div>
  <div class="editor-body"><div class="admin-fields"><label>Тип объекта<select name="type"><option value="residential">Жилая недвижимость</option><option value="commercial">Коммерческая недвижимость</option></select></label><label>Доступность<select name="status"><option value="available">Свободно</option><option value="reserved">Зарезервировано</option><option value="rented">Сдано</option><option value="project">Проект</option></select></label><label>Город<input name="city" required maxlength="120" placeholder="Drummondville"></label><label>Адрес<input name="address" required maxlength="240" placeholder="500 rue Marchand"></label><label>Площадь<input name="area" maxlength="100" placeholder="85 m²"></label><label>Стоимость аренды<input name="price" maxlength="100" placeholder="1 295 $ / mois"></label></div>
  <section class="editor-section"><h3>Фотографии</h3><p>Первая фотография будет обложкой. До 12 изображений; JPG, PNG или WebP.</p><label class="photo-upload">＋ Добавить фотографии<input id="admin-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden></label><div id="admin-photo-list"></div><label class="inline-check"><input name="realPhotos" type="checkbox">Это фотографии объекта, а не визуализации</label></section>
  <section class="editor-section"><h3>3D-модель</h3><p>Самодостаточный файл GLB до 30 МБ. Модель сохраняется в этом браузере и в резервной копии.</p><label class="photo-upload">＋ Загрузить GLB<input id="admin-model" type="file" accept=".glb,model/gltf-binary" hidden></label><p id="admin-model-info"></p><button type="button" id="admin-model-remove">Убрать модель</button></section><section class="editor-section"><div class="editor-language-heading"><h3>Описание объявления</h3><div class="editor-languages"><button type="button" data-editor-language="fr" class="active">FR</button><button type="button" data-editor-language="en">EN</button><button type="button" data-editor-language="ru">RU</button><button type="button" data-editor-language="es">ES</button></div></div><p>Французский — основной. Остальные переводы заполняются отдельно. Если перевода нет, посетитель увидит французский текст.</p><label>Название<input name="title" maxlength="180" placeholder="Appartement lumineux · rue Marchand"></label><label>Короткое описание<input name="summary" maxlength="220" placeholder="Для карточки в каталоге"></label><label>Подробное описание<textarea name="description" rows="5" maxlength="12000"></textarea></label><label>Характеристики<textarea name="features" rows="4" placeholder="Каждая характеристика с новой строки" maxlength="6000"></textarea></label><label>Условия доступности<input name="availability" maxlength="300" placeholder="Disponible immédiatement"></label></section>
  <p id="editor-status" role="status"></p></div><div class="editor-footer"><button type="button" id="editor-preview">Предпросмотр</button><div><button type="submit" name="intent" value="draft">Сохранить черновик</button><button type="submit" name="intent" value="published" class="admin-primary">Показать на сайте здесь</button></div></div></form></dialog>`;
  document.body.append(root);
  const list=root.querySelector('#admin-list'),dialog=root.querySelector('#admin-editor'),form=root.querySelector('#admin-form');
  let records=await Pivert.listings.all(),filter='all',query='',editing=null,language='fr',photos=[],texts={},photoBusy=false,modelFile=null,modelBusy=false;
  const fields=['title','summary','description','features','availability'];
  const text=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=value;return n;};
  const notice=(message)=>root.querySelector('#admin-status').textContent=message;
  const publications={published:'На сайте здесь',draft:'Черновик',archived:'В архиве'};
  const states={available:'Свободно',reserved:'Зарезервировано',rented:'Сдано',project:'Проект'};
  function render(){
    root.querySelector('#admin-stats').replaceChildren(...[
      ['Всего объектов',records.filter(r=>r.publication!=='archived').length],['Свободно',records.filter(r=>r.publication==='published'&&r.status==='available').length],['Черновики',records.filter(r=>r.publication==='draft').length]
    ].map(([label,count])=>{const n=text('div','admin-stat','');n.append(text('span','',label),text('strong','',count));return n;}));
    list.replaceChildren();
    const shown=records.filter(r=>(filter==='all'?r.publication!=='archived':r.publication===filter)&&`${r.text.fr.title} ${r.address} ${r.city}`.toLowerCase().includes(query));
    if(!shown.length){list.append(text('div','admin-empty','Пока нет объектов. Добавьте новое объявление или измените фильтр.'));return;}
    for(const r of shown){
      const row=text('article','admin-listing',''),image=document.createElement('img');image.src=r.photos[0]||'assets/listing-placeholder.svg';image.alt='';
      const info=text('div','admin-listing-info','');const badges=text('div','admin-badges','');badges.append(text('span','badge '+r.publication,publications[r.publication]),text('span','badge state-'+r.status,states[r.status]));
      info.append(badges,text('h3','',r.text.fr.title),text('p','',r.address+', '+r.city));
      const meta=text('div','admin-listing-meta','');meta.append(text('strong','',r.price||'Цена не указана'),text('span','',r.area||'Площадь не указана'));
      const actions=text('div','admin-row-actions','');const edit=text('button','','Редактировать');edit.onclick=()=>openEditor(r);const preview=text('a','','Открыть');preview.href='?preview='+encodeURIComponent(r.id)+'#espaces';preview.target='_blank';preview.rel='noopener';
      const archive=text('button','quiet',r.publication==='archived'?'Восстановить':'В архив');archive.onclick=async()=>{try{await Pivert.listings.save({...r,publication:r.publication==='archived'?'draft':'archived'});records=await Pivert.listings.all();render();notice('Изменения сохранены на этом устройстве.');}catch(e){notice('Не удалось сохранить: '+e.message);}};
      actions.append(edit,preview,archive);row.append(image,info,meta,actions);list.append(row);
    }
  }
  function stash(){for(const key of fields)texts[language][key]=form.elements[key].value;}
  function fillLanguage(){for(const key of fields)form.elements[key].value=texts[language][key]||'';root.querySelectorAll('[data-editor-language]').forEach(b=>b.classList.toggle('active',b.dataset.editorLanguage===language));}
  function renderPhotos(){
    const container=root.querySelector('#admin-photo-list');container.replaceChildren();
    photos.forEach((src,index)=>{const box=text('div','admin-photo',''),image=document.createElement('img');image.src=src;image.alt='Фото '+(index+1);box.append(image);
      if(!index)box.append(text('span','photo-cover','Обложка'));
      const actions=text('div','photo-actions','');const cover=text('button','','↑');cover.type='button';cover.title='Сделать обложкой';cover.disabled=index===0;cover.onclick=()=>{photos.unshift(photos.splice(index,1)[0]);renderPhotos();};
      const remove=text('button','','×');remove.type='button';remove.setAttribute('aria-label','Убрать фото '+(index+1));remove.onclick=()=>{photos.splice(index,1);renderPhotos();};actions.append(cover,remove);box.append(actions);container.append(box);
    });
  }
  function openEditor(record){
    editing=record?structuredClone(record):null;photos=[...(record?.photos||[])];texts={};for(const lang of ['fr','en','ru','es'])texts[lang]={...(record?.text[lang]||{})};language='fr';
    modelFile=record?.model||null;renderModel();form.reset();for(const key of ['type','status','city','address','area','price'])form.elements[key].value=record?.[key]||({type:'residential',status:'available'}[key]||'');form.elements.realPhotos.checked=record?.realPhotos??true;
    root.querySelector('#editor-title').textContent=record?'Редактировать объект':'Новый объект';root.querySelector('#editor-status').textContent='';fillLanguage();renderPhotos();dialog.setAttribute("tabindex","-1");dialog.showModal();root.querySelector(".editor-body").scrollTop=0;dialog.focus({preventScroll:true});
  }
  function readRecord(publication){
    if(modelBusy)throw Error('Дождитесь загрузки 3D-модели.');
    if(photoBusy)throw Error('Дождитесь завершения загрузки фотографий.');
    stash();if(!texts.fr.title?.trim())throw Error('Укажите название объявления на французском (FR).');
    if(!form.elements.city.value.trim()||!form.elements.address.value.trim())throw Error('Укажите город и адрес.');
    const result={...(editing||{}),id:editing?.id||crypto.randomUUID(),createdAt:editing?.createdAt||Date.now(),order:editing?.order??records.length,type:form.elements.type.value,status:form.elements.status.value,publication,model:modelFile,photos:[...photos],realPhotos:form.elements.realPhotos.checked,text:structuredClone(texts)};
    for(const key of ['city','address','area','price'])result[key]=form.elements[key].value.trim();return result;
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();const status=root.querySelector('#editor-status');
    try{const record=readRecord(event.submitter?.value||'draft');await Pivert.listings.save(record);records=await Pivert.listings.all();dialog.close();render();notice('Сохранено на этом устройстве. '+(record.publication==='draft'?'Объявление осталось черновиком.':'Изменения видны в локальном каталоге.'));}catch(e){status.textContent=e.message;}
  });
  root.querySelector('#editor-preview').onclick=async()=>{
    try{const record=readRecord(editing?.publication||'draft');await Pivert.listings.save(record);editing=record;records=await Pivert.listings.all();render();window.open('?preview='+encodeURIComponent(record.id)+'#espaces','_blank','noopener');}catch(e){root.querySelector('#editor-status').textContent=e.message;}
  };
  root.querySelector('#editor-close').onclick=()=>dialog.close();
  root.querySelector('#admin-add').onclick=()=>openEditor(null);
  root.querySelectorAll('[data-editor-language]').forEach(button=>button.onclick=()=>{stash();language=button.dataset.editorLanguage;fillLanguage();});
  root.querySelectorAll('[data-admin-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.adminFilter;root.querySelectorAll('[data-admin-filter]').forEach(b=>b.classList.toggle('active',b===button));render();});
  root.querySelector('#admin-search').oninput=event=>{query=event.target.value.toLowerCase().trim();render();};
  root.querySelector('#admin-photos').onchange=async event=>{
    const files=[...event.target.files],status=root.querySelector('#editor-status');
    if(photos.length+files.length>12){status.textContent='Можно добавить не больше 12 фотографий.';return;}
    photoBusy=true;status.textContent='Подготавливаю фотографии…';
    try{
      for(const file of files){
        if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw Error('Выберите JPG, PNG или WebP размером до 20 МБ.');
        const image=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);photos.push(canvas.toDataURL('image/jpeg',.84));image.close();
      }
      renderPhotos();status.textContent='Фотографии добавлены. Сохраните объявление.';
    }catch(e){status.textContent=e.message;}finally{photoBusy=false;event.target.value='';}
  };
  function renderModel(){
    root.querySelector('#admin-model-info').textContent=modelFile?`${modelFile.name} · ${(modelFile.size/1024/1024).toFixed(1)} МБ`:(editing?.seed==='foucault'?'Используется текущая модель Multi 661.':'Модель не добавлена.');
    root.querySelector('#admin-model-remove').hidden=!modelFile;
  }
  root.querySelector('#admin-model-remove').onclick=()=>{modelFile=null;renderModel();};
  root.querySelector('#admin-model').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;modelBusy=true;
    const status=root.querySelector('#editor-status');status.textContent='Проверяю 3D-модель…';
    try{modelFile=await Pivert.readGLB(file);renderModel();status.textContent='Модель добавлена. Сохраните объявление.';}catch(error){status.textContent=error.message;}finally{modelBusy=false;event.target.value='';}
  };
  root.querySelector('#admin-export').onclick=async()=>{
    const blob=new Blob([JSON.stringify({format:'pivert-listings',version:1,exportedAt:new Date().toISOString(),records:await Pivert.listings.all()},null,2)],{type:'application/json'});const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download='Pivert-backup-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('Резервная копия подготовлена. Храните её вместе с файлами сайта.');
  };
  root.querySelector('#admin-import').onchange=async event=>{
    try{const file=event.target.files[0];if(!file)return;if(file.size>100*1024*1024)throw Error('Файл слишком большой.');const backup=JSON.parse(await file.text());if(backup.format!=='pivert-listings'||backup.version!==1||!Array.isArray(backup.records))throw Error('Это не резервная копия Pivert.');await Pivert.listings.importRecords(backup.records);records=await Pivert.listings.all();render();notice('Объекты из резервной копии сохранены на этом устройстве.');}catch(e){notice('Не удалось импортировать: '+e.message);}event.target.value='';
  };
  render();
  Pivert.initAdminLanguage(root);
};
