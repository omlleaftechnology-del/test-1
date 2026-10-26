// Handshake lets the host distinguish a loaded model from an empty frame.
Pivert.withModelStatus = source => {
  const code = `(() => {
    const send = type => parent.postMessage({type}, '*');
    if(window.__ready) send('pivert-model-ready');
    else send('pivert-model-error');
    addEventListener('error', () => send('pivert-model-error'));
  })();`;
  return source.replace('</body>', '<scr'+'ipt>'+code+'</scr'+'ipt></body>');
};
// Translate the supplied viewer's UI without touching geometry or controls.
Pivert.getModelDocument = () => {
  const dictionaries = {
    en:{'Chargement du modèle…':'Loading model…','Informations sur le projet':'Project information','Masquer':'Hide','Afficher':'Show','Point de vue':'View','Façade AA':'Front AA','Façade DD':'Side DD','Façade CC':'Side CC','Plan':'Top view','Coupe':'Section','Niveau':'Level','Bâtiment':'Building','Sans toiture':'No roof','3e niveau':'Level 3','2e niveau':'Level 2','RDC':'Ground floor','Rez-de-jardin':'Garden level','aucune':'none','Vue complète':'Whole building','Coupe libre':'Free section','Niveaux':'Levels','Logements':'Apartments','Emprise':'Footprint','Emprise, m':'Footprint, m','Hauteur':'Height','Toiture':'Roof','Superficie':'Area','3 étages + rez-de-jardin':'3 storeys + garden level','20 (5 par niveau)':'20 (5 per level)','à croupes, pente 3½:12':'hipped, 3½:12 pitch','Revêtements de façade':'Facade finishes','fibrociment beige':'beige fibre cement','imitation bois':'wood effect','vertical blanc':'white vertical panels','brique gris foncé':'dark grey brick','bardeaux':'shingles'},
    es:{'Chargement du modèle…':'Cargando modelo…','Informations sur le projet':'Información del proyecto','Masquer':'Ocultar','Afficher':'Mostrar','Point de vue':'Vista','Façade AA':'Fachada AA','Façade DD':'Lateral DD','Façade CC':'Lateral CC','Plan':'Vista superior','Coupe':'Sección','Niveau':'Nivel','Bâtiment':'Edificio','Sans toiture':'Sin cubierta','3e niveau':'Nivel 3','2e niveau':'Nivel 2','RDC':'Planta baja','Rez-de-jardin':'Semisótano','aucune':'ninguna','Vue complète':'Edificio completo','Coupe libre':'Sección libre','Niveaux':'Niveles','Logements':'Viviendas','Emprise':'Superficie ocupada','Emprise, m':'Dimensiones, m','Hauteur':'Altura','Toiture':'Cubierta','Superficie':'Superficie','3 étages + rez-de-jardin':'3 plantas + semisótano','20 (5 par niveau)':'20 (5 por nivel)','à croupes, pente 3½:12':'a cuatro aguas, pendiente 3½:12','Revêtements de façade':'Acabados de fachada','fibrociment beige':'fibrocemento beige','imitation bois':'imitación madera','vertical blanc':'paneles verticales blancos','brique gris foncé':'ladrillo gris oscuro','bardeaux':'tejas asfálticas'},
    ru:{'Chargement du modèle…':'Загрузка модели…','Informations sur le projet':'Информация о проекте','Masquer':'Скрыть','Afficher':'Показать','Point de vue':'Ракурс','Façade AA':'Фасад AA','Façade DD':'Сторона DD','Façade CC':'Сторона CC','Plan':'Вид сверху','Coupe':'Разрез','Niveau':'Уровень','Bâtiment':'Дом','Sans toiture':'Без крыши','3e niveau':'3 этаж','2e niveau':'2 этаж','RDC':'1 этаж','Rez-de-jardin':'Полуподвал','aucune':'нет','Vue complète':'Весь дом','Coupe libre':'Свободный разрез','Niveaux':'Этажность','Logements':'Квартиры','Emprise':'Пятно застройки','Emprise, m':'Габариты, м','Hauteur':'Высота','Toiture':'Крыша','Superficie':'Площадь','3 étages + rez-de-jardin':'3 этажа и полуподвал','20 (5 par niveau)':'20 (по 5 на уровень)','à croupes, pente 3½:12':'вальмовая, уклон 3½:12','Revêtements de façade':'Отделка фасадов','fibrociment beige':'бежевый фиброцемент','imitation bois':'имитация дерева','vertical blanc':'белые панели','brique gris foncé':'тёмно-серый кирпич','bardeaux':'черепица'}
  };
  const language=Pivert.language;
  if(language==='fr')return Pivert.withModelStatus(Pivert.modelDocument);
  const dictionary=dictionaries[language];
  const code=`(() => {
    const dict=${JSON.stringify(dictionary)};
    const originals=new WeakMap();
    document.documentElement.lang=${JSON.stringify(language)};
    function translate(){
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())){
        if(node.parentElement.closest('script,style'))continue;
        const current=node.nodeValue,key=current.trim();
        if(dict[key]){
          const next=current.replace(key,dict[key]);
          if(next!==current)node.nodeValue=next;
        }
      }
      document.querySelectorAll('[aria-label]').forEach(element=>{
        const key=element.getAttribute('aria-label');
        if(dict[key])element.setAttribute('aria-label',dict[key]);
      });
    }
    translate();
    new MutationObserver(translate).observe(document.body,{subtree:true,childList:true,characterData:true});
  })();`;
  return Pivert.withModelStatus(Pivert.modelDocument.replace('</body>','<scr'+'ipt>'+code+'</scr'+'ipt></body>'));
};
