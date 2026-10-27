// Build the outgoing draft in the visitor's selected language.
Pivert.initForm = () => {
  const form = document.querySelector('#request-form');
  const copy = {
    fr:{greeting:'Bonjour Pivert,',request:'Ma demande',name:'Nom',email:'Courriel',phone:'Téléphone',date:'Date souhaitée',extras:'Services complémentaires',unspecified:'Non précisé',discuss:'À discuter',none:'Aucun',thanks:'Merci !',subject:'Demande'},
    en:{greeting:'Hello Pivert,',request:'My request',name:'Name',email:'Email',phone:'Phone',date:'Preferred date',extras:'Additional services',unspecified:'Not provided',discuss:'To discuss',none:'None',thanks:'Thank you!',subject:'Request'},
    ru:{greeting:'Здравствуйте, Pivert!',request:'Тема',name:'Имя',email:'Почта',phone:'Телефон',date:'Желаемая дата',extras:'Дополнительные услуги',unspecified:'Не указан',discuss:'Обсудим',none:'Не нужны',thanks:'Спасибо!',subject:'Заявка'},
    es:{greeting:'Hola Pivert:',request:'Mi solicitud',name:'Nombre',email:'Correo',phone:'Teléfono',date:'Fecha deseada',extras:'Servicios adicionales',unspecified:'No indicado',discuss:'A convenir',none:'Ninguno',thanks:'¡Gracias!',subject:'Solicitud'}
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form), c = copy[Pivert.language];
    const request = Pivert.t(data.get('request'));
    const extras = data.getAll('extra').map(Pivert.t).join(', ');
    const lines = [c.greeting,'',`${c.request}: ${request}`,'',
      `${c.name}: ${data.get('name')}`,`${c.email}: ${data.get('email')}`,
      `${c.phone}: ${data.get('phone') || c.unspecified}`,
      `${c.date}: ${data.get('date') || c.discuss}`,
      `${c.extras}: ${extras || c.none}`,'',data.get('message'),'',c.thanks];
    let locallySaved=false;
    try{await Pivert.captureRequest(data);locallySaved=true;}catch(error){console.warn('Local enquiry could not be saved',error);}
    location.href = 'mailto:'+Pivert.contacts.get().email+'?subject=' + encodeURIComponent(c.subject+' — '+request)
      + '&body=' + encodeURIComponent(lines.join('\n'));
    Pivert.setText(document.querySelector('#form-status'),
      locallySaved?'Demande enregistrée dans ce navigateur. Pour l’envoyer à Pivert, finalisez l’envoi dans votre application courriel.':'Enregistrement local impossible. Pour envoyer votre demande à Pivert, finalisez l’envoi dans votre application courriel.');
  });
};
