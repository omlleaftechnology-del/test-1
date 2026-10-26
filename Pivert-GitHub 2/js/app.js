(async () => {
// Small entry point. Load feature files before this script.
const params=new URLSearchParams(location.search);
try {
  await Pivert.listings.init();
  const records=await Pivert.listings.all();
  if(params.has('admin')){await Pivert.initAdmin();return;}
  const preview=params.get('preview');
  if(preview){
    const selected=records.find(r=>r.id===preview);
    if(selected)selected.publication='published';
    const banner=document.createElement('div');banner.className='local-preview-banner';banner.textContent='Предпросмотр на этом устройстве · черновик не публикуется для других посетителей';document.body.prepend(banner);
  }
  Pivert.applyListings(records);
} catch(error) {
  if(params.has('admin')){
    const message=document.createElement('p');message.style.padding='40px';message.textContent='Не удалось открыть локальное хранилище. Откройте кабинет через адрес http://127.0.0.1:4187/?admin=1 и разрешите хранение данных в браузере.';document.body.prepend(message);return;
  }
  console.warn('Local listings unavailable; showing bundled catalog.',error);
}
Pivert.initHouse3D();
Pivert.initCatalog();
Pivert.initNavigation();
Pivert.initForm();

document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => Pivert.setLanguage(button.dataset.language));
});

let language = 'fr';
try { language = localStorage.getItem('pivert-language-v3') || 'fr'; } catch {}
Pivert.setLanguage(language);

// A direct preview link can open the Foucault model immediately.
if (new URLSearchParams(location.search).get('model') === 'foucault') {
  document.querySelector('[data-detail="foucault"]')?.click();
}

})();
