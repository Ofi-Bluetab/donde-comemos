import {browserRestaurants} from './overpass.js';
const $=selector=>document.querySelector(selector);

export function setupRestaurantLookup(api,action,getState,select,clearSelection) {
  const dialog=$('#restaurant-dialog'),form=$('#restaurant-form');let map,markers,origin,generation=0,selected;
  function reset(){generation++;selected=null;$('#restaurant-lookup').hidden=true;$('#restaurant-search-status').textContent='';$('#restaurant-search-results').replaceChildren();markers?.clearLayers();}
  dialog.addEventListener('close',reset);
  form.elements.name.addEventListener('input',()=>{reset();clearSelection();});
  $('#restaurant-search').onclick=e=>action(e.currentTarget,async()=>{
    const name=form.elements.name.value.trim();if(name.length<2)throw Error('Escribe al menos dos caracteres del nombre.');
    reset();clearSelection();const ticket=generation,office={...getState().office};
    $('#restaurant-search-status').textContent='Buscando el nombre cerca de tu salida…';
    try {
      let client_source;try{client_source=await browserRestaurants(office);}catch{}
      if(ticket!==generation||!dialog.open)return;
      const data=await api('restaurants/search',{name,...(client_source?{client_source}:{})});
      if(ticket!==generation||!dialog.open)return;
      $('#restaurant-search-status').textContent=data.restaurants.length?`${data.restaurants.length} coincidencias a menos de 2 km. Pulsa un marcador o el nombre para elegir el local. ${(data.warnings||[]).join(' ')}`:'No hay coincidencias en 2 km. Revisa el nombre o introduce los datos manualmente.';
      $('#restaurant-lookup').hidden=false;
      if(!map){map=L.map('restaurant-search-map').setView([office.latitude,office.longitude],15);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);markers=L.layerGroup().addTo(map);origin=L.circleMarker([office.latitude,office.longitude],{radius:10,color:'#fff',weight:3,fillColor:'#2563eb',fillOpacity:1,bubblingMouseEvents:false}).addTo(map).bindPopup('Tu salida');new ResizeObserver(()=>map.invalidateSize()).observe($('#restaurant-search-map'));}
      origin.setLatLng([office.latitude,office.longitude]);markers.clearLayers();
      requestAnimationFrame(()=>{map.invalidateSize();map.fitBounds(L.latLngBounds([office,...data.restaurants].map(r=>[r.latitude,r.longitude])),{padding:[24,24],maxZoom:16});});
      for(const r of data.restaurants){
        const marker=L.circleMarker([r.latitude,r.longitude],{radius:8,color:r.id?'#888':'#244d3e',fillOpacity:.85,bubblingMouseEvents:false}).addTo(markers);
        const popup=document.createElement('div'),title=document.createElement('strong'),info=document.createElement('p'),add=document.createElement('button');popup.className='restaurant-popup';title.textContent=r.name;info.textContent=[r.address||'Dirección sin confirmar',r.minutes===null?'Tiempo sin confirmar':r.minutes+' min a pie',r.price===null?'Precio por confirmar':r.price+' € / persona'].join(' · ');add.type='button';add.className='secondary';add.textContent=r.id?'Ya está en el catálogo':'Añadir este local';add.disabled=Boolean(r.id);
        function choose(){if(r.id)return;selected=r;select(r);$('#restaurant-search-status').textContent='Seleccionado: '+r.name+'. Confirma el precio y completa los datos que falten para añadirlo.';}
        marker.on('click',choose);add.onclick=()=>{if(selected!==r)choose();form.requestSubmit(form.querySelector('button[type=submit]'));};popup.append(title,info,add);marker.bindPopup(popup,{maxWidth:250});
        const button=document.createElement('button');button.type='button';button.className='text-button';button.textContent=r.name+' · '+(r.address||(r.minutes===null?'tiempo sin confirmar':r.minutes+' min a pie'))+(r.id?' · ya guardado':'');button.onclick=()=>{choose();map.setView([r.latitude,r.longitude],16);marker.openPopup();};$('#restaurant-search-results').append(button);
      }
    }catch(error){if(ticket!==generation||!dialog.open)return;$('#restaurant-search-status').textContent=error.message;throw error;}
  });
  return reset;
}
