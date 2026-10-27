Pivert.contacts = (() => {
  const defaults={phone:'(819) 609-5755',email:'info@pivert.ca',facebook:'https://www.facebook.com/profile.php?id=61574346015342'};
  function validate(value){
    if(!value||typeof value.phone!=='string'||!/^\+?[\d\s().-]{7,40}$/.test(value.phone)||value.phone.replace(/\D/g,'').length<7)throw Error('Укажите корректный телефон.');
    if(typeof value.email!=='string'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)||value.email.length>254)throw Error('Укажите корректную почту.');
    let url;try{url=new URL(value.facebook);}catch{throw Error('Укажите ссылку Facebook.');}
    if(url.protocol!=='https:'||!(url.hostname==='facebook.com'||url.hostname.endsWith('.facebook.com'))||url.username||url.password)throw Error('Укажите ссылку Facebook.');
    return {phone:value.phone.trim(),email:value.email.trim(),facebook:url.href};
  }
  function get(){try{return validate(JSON.parse(localStorage.getItem('pivert-contacts-v1'))||defaults);}catch{return {...defaults};}}
  function save(value){const clean=validate(value);localStorage.setItem('pivert-contacts-v1',JSON.stringify(clean));return clean;}
  function apply(){const c=get();document.querySelectorAll('a[href^="tel:"]').forEach(a=>{a.href='tel:'+c.phone.replace(/[^+\d]/g,'');const target=a.querySelector('.contact-method-value');if(target){target.firstChild.textContent=c.phone+' ';}});document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href='mailto:'+c.email;const target=a.querySelector('.contact-method-value');if(target)target.firstChild.textContent=c.email+' ';});document.querySelectorAll('a[href*="facebook.com"]').forEach(a=>a.href=c.facebook);}
  return {get,save,validate,apply};
})();
Pivert.initContactEditor = root => {
  const rows=[['Контакты','Coordonnées','Contact details','Datos de contacto'],['Телефон','Téléphone','Phone','Teléfono'],['Электронная почта','Courriel','Email','Correo electrónico'],['Ссылка Facebook','Lien Facebook','Facebook link','Enlace de Facebook'],['Сохранить контакты','Enregistrer les coordonnées','Save contact details','Guardar contactos'],['Телефон, почта и Facebook для сайта и заявок.','Téléphone, courriel et Facebook pour le site et les demandes.','Phone, email and Facebook for the website and enquiries.','Teléfono, correo y Facebook para el sitio y las solicitudes.'],['Контакты сохранены в этом браузере.','Coordonnées enregistrées dans ce navigateur.','Contact details saved in this browser.','Contactos guardados en este navegador.'],['Укажите корректный телефон.','Saisissez un numéro de téléphone valide.','Enter a valid phone number.','Introduzca un teléfono válido.'],['Укажите корректную почту.','Saisissez une adresse courriel valide.','Enter a valid email address.','Introduzca un correo válido.'],['Укажите ссылку Facebook.','Saisissez un lien Facebook en HTTPS.','Enter an HTTPS Facebook link.','Introduzca un enlace HTTPS de Facebook.']];Pivert.adminMessages.push(...rows);
  const panel=document.createElement('section');panel.id='admin-contacts';panel.className='admin-contact-panel';
  panel.innerHTML='<h2>Контакты</h2><p>Телефон, почта и Facebook для сайта и заявок.</p><form id="contact-settings-form"><label>Телефон<input name="phone" type="tel" required maxlength="40" autocomplete="tel"></label><label>Электронная почта<input name="email" type="email" required maxlength="254" autocomplete="email"></label><label>Ссылка Facebook<input name="facebook" type="url" required maxlength="2000" placeholder="https://www.facebook.com/…"></label><button type="submit" class="admin-primary">Сохранить контакты</button><p role="status" id="contact-save-status"></p></form>';
  root.querySelector('.admin-main').append(panel);const form=panel.querySelector('form');const c=Pivert.contacts.get();Object.keys(c).forEach(key=>form.elements[key].value=c[key]);
  form.onsubmit=event=>{event.preventDefault();try{Pivert.contacts.save(Object.fromEntries(new FormData(form)));panel.querySelector('[role=status]').textContent='Контакты сохранены в этом браузере.';}catch(error){panel.querySelector('[role=status]').textContent=error.message;}};
  const button=document.createElement('button');button.className='admin-contact-nav';button.textContent='Контакты';button.onclick=()=>{panel.scrollIntoView({behavior:'smooth',block:'start'});};root.querySelector('.admin-sidebar').insertBefore(button,root.querySelector('.admin-sidebar>a')); 
};
