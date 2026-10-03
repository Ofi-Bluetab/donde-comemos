const $ = s=>document.querySelector(s);
let map,tiles,markers,officeMarker,point,chosen,rows=[],generation=0,officeGeneration=0,loadedTiles=0,tileErrors=0,resolveSavedAddress;
export function invalidateNearby(){generation++;rows=[];$('#nearby-results').replaceChildren();$('#nearby-status').textContent='Selecciona los comensales y busca con sus filtros de hoy.';markers?.clearLayers();}
export function syncOffice(office){
 const moved=!point||point.latitude!==office.latitude||point.longitude!==office.longitude;
 chosen=null;point=office;$('#office-address').value=office.address==='Mi ubicación'||!office.address?'Ubicación guardada · dirección pendiente':office.address;$('#office-note').textContent='Salida guardada. Puedes actualizar tu ubicación o ajustar el acceso en el mapa.';$('#office-savepoint').hidden=true;
 officeMarker?.setLatLng([office.latitude,office.longitude]);if(moved){invalidateNearby();map?.setView([office.latitude,office.longitude],16);}
}
function mapLoading(){tileErrors=0;loadedTiles=0;$('#nearby-map').classList.add('map-pending');$('#map-status').textContent='Cargando y comprobando el mapa…';$('#map-retry').hidden=true;}
export function showNearby(){
 resolveSavedAddress?.();
 try{
 if(!map){
  mapLoading();map=L.map('nearby-map').setView([point.latitude,point.longitude],16);
  tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  tiles.on('loading',mapLoading);tiles.on('tileload',()=>loadedTiles++);tiles.on('tileerror',()=>tileErrors++);
  tiles.on('load',()=>{const ok=loadedTiles>0&&!tileErrors;$('#nearby-map').classList.toggle('map-pending',!ok);$('#map-status').textContent=ok?'Mapa cargado. El punto verde es la salida de la oficina.':'No se ha podido cargar el mapa completo. Puedes usar la lista y los enlaces de ruta o reintentar.';$('#map-retry').hidden=ok;});tiles.addTo(map);
  markers=L.layerGroup().addTo(map);officeMarker=L.circleMarker([point.latitude,point.longitude],{radius:10,color:'#244d3e',fillOpacity:1}).addTo(map).bindPopup('Salida de la oficina');
  map.on('click',e=>{chosen={latitude:Number(e.latlng.lat.toFixed(6)),longitude:Number(e.latlng.lng.toFixed(6)),address:point.address||'Mi ubicación'};officeMarker.setLatLng(e.latlng);$('#office-note').textContent='Acceso pendiente de guardar.';$('#office-savepoint').hidden=false;invalidateNearby();});
  new ResizeObserver(()=>map.invalidateSize()).observe($('#nearby-map'));
 }
 requestAnimationFrame(()=>map.invalidateSize());
 }catch{$('#map-status').textContent='No se ha podido iniciar el mapa. Recarga la página; puedes seguir usando la lista.';}
}
export function setupNearby(api,action,load,getMembers,importRestaurant){
 const addresses=new Map();
 const pointKey=p=>`${p.latitude.toFixed(6)}:${p.longitude.toFixed(6)}`;
 async function withAddress(p){
  const key=pointKey(p);if(!addresses.has(key))addresses.set(key,api('office/reverse',{latitude:p.latitude,longitude:p.longitude}).then(r=>r.address||'Mi ubicación').catch(()=>{addresses.delete(key);return 'Mi ubicación';}));
  return {...p,address:await addresses.get(key)};
 }
 resolveSavedAddress=()=>{if(!point||point.address&&point.address!=='Mi ubicación')return;const current=point,key=pointKey(current);withAddress(current).then(found=>{if(pointKey(point)!==key||chosen)return;$('#office-address').value=found.address==='Mi ubicación'?'Ubicación guardada · dirección no disponible':found.address;$('#office-note').textContent=found.address==='Mi ubicación'?'No se ha podido obtener la dirección. El punto guardado sigue disponible.':'Dirección aproximada del portal más cercano · CartoCiudad (IGN/CNIG). El mapa conserva tu ubicación.';});};
 $('#map-retry').onclick=()=>{mapLoading();tiles?.redraw();};
 $('#office-geolocate').onclick=e=>action(e.currentTarget,async()=>{
  const ticket=++officeGeneration;$('#office-note').textContent='Solicitando permiso para localizarte…';
  try{
   if(!navigator.geolocation)throw new Error('Este navegador no permite obtener tu ubicación. Prueba con un navegador compatible.');
   const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:0}));
   if(ticket!==officeGeneration)return;
   const {latitude,longitude}=position.coords;
   if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>85||Math.abs(longitude)>180)throw new Error('No se ha obtenido una ubicación válida. Inténtalo de nuevo.');
   const office=await withAddress({latitude,longitude,address:'Mi ubicación'});if(ticket!==officeGeneration)return;await api('office',office);syncOffice(office);invalidateNearby();await load();
   $('#office-note').textContent=office.address==='Mi ubicación'?'Ubicación guardada; dirección no disponible. Puedes reintentar.':'Salida guardada · dirección aproximada del portal más cercano. Puedes ajustar el acceso en el mapa.';
  }catch(error){if(ticket!==officeGeneration)return;const messages={1:'No has permitido el acceso a tu ubicación. Habilita el permiso del navegador e inténtalo de nuevo.',2:'No se ha podido obtener tu ubicación. Inténtalo de nuevo.',3:'La localización ha tardado demasiado. Inténtalo de nuevo.'};const message=messages[error.code]||error.message;$('#office-note').textContent=message;throw new Error(message);}
 });
 $('#nearby-radius').onchange=invalidateNearby;
 $('#office-savepoint').onclick=e=>action(e.currentTarget,async()=>{if(!chosen)throw new Error('Marca el acceso en el mapa.');const candidate=chosen,ticket=++officeGeneration;const office=await withAddress(candidate);if(ticket!==officeGeneration||chosen!==candidate)return;await api('office',office);invalidateNearby();await load();});
  $('#nearby-search').onclick=e=>action(e.currentTarget,async()=>{
    if(chosen)throw new Error('Guarda el acceso ajustado antes de buscar.');
    if(!getMembers().length)throw new Error('Selecciona al menos una persona.');
    invalidateNearby();await load();const members=getMembers();if(!members.length)throw new Error('Selecciona al menos una persona.');const ticket=generation;$('#nearby-status').textContent='Buscando sitios y calculando recorridos a pie…';
    let data;try{data=await api('nearby',{members,radius:Number($('#nearby-radius').value)});}catch(error){$('#nearby-status').textContent=error.message;throw error;}
    if(ticket!==generation)return;
    $('#nearby-status').textContent=`${data.restaurants.length} compatibles con todos los seleccionados. Analizados ${data.examined} de ${data.total} sitios encontrados: hasta 30 próximos con cocina compatible. Tiempos estimados de ida, sin incluir comer. ${(data.warnings||[]).join(' ')}`;
    rows=[...data.restaurants,...data.pending];markers?.clearLayers();if(map&&rows.length)map.fitBounds(L.latLngBounds([point,...rows].map(r=>[r.latitude,r.longitude])),{padding:[30,30],maxZoom:16});$('#nearby-results').replaceChildren();
    function section(list,title,pending){const heading=document.createElement('h3');heading.textContent=title;$('#nearby-results').append(heading);const grid=document.createElement('div');grid.className='nearby-grid';$('#nearby-results').append(grid);if(!list.length){const p=document.createElement('p');p.className='muted';p.textContent=pending?'No hay más candidatos pendientes de precio.':'No hay sitios que cumplan todos los filtros con datos conocidos. Puedes ampliar el radio o revisar los filtros.';$('#nearby-results').append(p);}
      for(const r of list){const card=document.createElement('article');card.className='panel nearby-card'+(pending?' nearby-pending':'');const h=document.createElement('h4');h.textContent=r.name;const badge=document.createElement('span');badge.className='nearby-badge';badge.textContent=pending?'Presupuesto pendiente':'Cumple vuestros filtros';const detail=document.createElement('p');detail.className='muted';detail.textContent=(r.cuisine||'Cocina sin confirmar')+(r.address?' · '+r.address:'');const metrics=document.createElement('div');metrics.className='nearby-metrics';for(const [value,label] of [[r.minutes===null?'—':r.minutes+' min','A pie · ida estimada'],[r.price===null?'Por confirmar':r.price+' €','Por persona · precio del equipo']]){const metric=document.createElement('div');const strong=document.createElement('strong');strong.textContent=value;const caption=document.createElement('span');caption.textContent=label;metric.append(strong,caption);metrics.append(metric);}card.append(badge,h,metrics,detail);
        const marker=map?L.circleMarker([r.latitude,r.longitude],{radius:7,color:pending?'#a57248':'#244d3e',fillOpacity:.75}).addTo(markers):null;const popup=document.createElement('span');popup.textContent=r.name;marker?.bindPopup(popup);
        const locate=document.createElement('button');locate.className='text-button';locate.textContent='Ver en el mapa';locate.disabled=!map;locate.onclick=()=>{showNearby();map.setView([r.latitude,r.longitude],17);marker.openPopup();$('#nearby-map').scrollIntoView({block:'center'});};card.append(locate);
        if(!r.id){const save=document.createElement('button');save.className='secondary';save.textContent='Completar y guardar';save.onclick=()=>importRestaurant(r);card.append(save);}else{const saved=document.createElement('span');saved.className='small';saved.textContent='Ya está en el catálogo';card.append(saved);}
        const route=document.createElement('a');route.href='https://www.google.com/maps/dir/?'+new URLSearchParams({api:'1',origin:point.latitude+','+point.longitude,destination:r.latitude+','+r.longitude,travelmode:'walking'});route.target='_blank';route.rel='noopener';route.textContent='Cómo llegar';const reviews=document.createElement('a');reviews.href='https://www.google.com/maps/search/?'+new URLSearchParams({api:'1',query:r.name+' '+(r.address||point.address)});reviews.target='_blank';reviews.rel='noopener';reviews.textContent='Consultar reseñas en Google Maps ↗';card.append(route,reviews);grid.append(card);
      }
    }
    section(data.restaurants,'Compatibles con vuestros filtros',false);
    if(data.pending.length){const p=document.createElement('p');p.className='muted';p.textContent='Estos sitios cumplen cocina y distancia, pero falta confirmar su precio. No son recomendaciones compatibles con vuestro presupuesto. Completa y guarda el precio antes de volver a buscar.';$('#nearby-results').append(p);section(data.pending,'Pendientes de comprobar el presupuesto',true);}
  });
}

