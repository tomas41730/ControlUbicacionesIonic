import { Component, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

declare var google;
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  estaDisponible = false;
  ubicaciones: Observable<any>;
  listaUbicaciones: AngularFirestoreCollection<any>;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = [];
  constructor(private afs: AngularFirestore) { 
    this.anonLogin();
   
  }
  ionViewWillEnter(){
    this.loadMap();
  }
  loadMap(){
    let latLng = new google.maps.LatLng(-17.391457 , -66.2126167);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  anonLogin(){
    
      this.listaUbicaciones = this.afs.collection('motoTaxis');

      //Cargando datos de firebase
        this.ubicaciones = this.listaUbicaciones.snapshotChanges().pipe(
          map(actions => 
            actions.map(a => {
              const data = a.payload.doc.data();
              const id =  a.payload.doc.id;
              return { id, ...data };
            })
          )
        );
        
      //Actualizando mapa
      this.ubicaciones.subscribe(ubicaciones =>
        {
         console.log('ubicaciones de los conductores: ', ubicaciones);
         this.updateMap(ubicaciones); 
         console.log(this.asignacionMoto(ubicaciones));
        })
  }
  updateMap(ubicaciones){
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    let latLng = new google.maps.LatLng(-17.3921318,-66.2234896);         
    let marker = new google.maps.Marker({
    position: latLng,
    animation: google.maps.Animation.Drop,
    icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
    label: {text: "pedido", color: "white"},
    title: 'SUCURSAL',
    map: this.map
  });
  this.markers.push(marker);
    for (let loc of ubicaciones){
      
      if(loc.disponible){
        this.estaDisponible = true;
        let latLng = new google.maps.LatLng(loc.latitud, loc.longitud);         
        let marker = new google.maps.Marker({
        position: latLng,
        animation: google.maps.Animation.Drop,
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" },
        label: {text: loc.nombreMotoTaxi+" "+ loc.apellidoMotoTaxi, color: "white"},
        title: loc.nombreMotoTaxi,
        map: this.map
      });
      this.markers.push(marker);
      }
     else{
      this.estaDisponible = false;
      let latLng = new google.maps.LatLng(loc.latitud, loc.longitud);   
      let marker = new google.maps.Marker({
        position: latLng,
        animation: google.maps.Animation.Drop,
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" },
        label: {text: loc.nombreMotoTaxi+" "+ loc.apellidoMotoTaxi, color: "white"},
        title: loc.nombreMotoTaxi,
        map: this.map
      });
      this.markers.push(marker);
     }
    
   
    }
  } 
  displayRoute(origin, destination, service, display) {
    service.route({
      origin: origin,
      destination: destination,
      //waypoints: [{location: 'Adelaide, SA'}, {location: 'Broken Hill, NSW'}],
      travelMode: 'DRIVING',
      avoidTolls: true
    }, function(response, status) {
      if (status === 'OK') {
        display.setDirections(response);
      } else {
        alert('Could not display directions due to: ' + status);
      }
    });
  }
  // computeTotalDistance(result) {
  //   var total = 0;
  //   var myroute = result.routes[0];
  //   for (var i = 0; i < myroute.legs.length; i++) {
  //     total += myroute.legs[i].distance.value;
  //   }
  //   total = total / 1000;
  //   document.getElementById('total').innerHTML = total + ' km';
  // }
  agregandoRuta(){
    let origin = new google.maps.LatLng(-17.3892211,-66.2162773);  
    let destiny = new google.maps.LatLng(-17.3868231,-66.2111644); 
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
      draggable: true,
      map: this.map,
      panel: document.getElementById('right-panel')
    });

    directionsDisplay.addListener('directions_changed', function() {
   //this.computeTotalDistance(directionsDisplay.getDirections());
    });

    this.displayRoute(origin, destiny, directionsService,
        directionsDisplay);
  }
  asignacionMoto(ubicaciones){
    let motosDistancias = [];
    let sucursal = new google.maps.LatLng(-17.3921318,-66.2234896);
    for (let loc of ubicaciones){
      
      if(loc.latitud != null){ 
        let latLng = new google.maps.LatLng(loc.latitud, loc.longitud); 
        let total = google.maps.geometry.spherical.computeDistanceBetween(latLng, sucursal); 
        console.log('La distancia del conductor '+loc.apellidoMotoTaxi + ' es '+ total + ' metros');
        motosDistancias.push(total);
      }   
    } 
    var moto = null;
    var min=Math.min.apply(null, motosDistancias);
    for (let loc of ubicaciones){
      
      if(loc.latitud != null){
        this.estaDisponible = true;
        let latLng = new google.maps.LatLng(loc.latitud, loc.longitud); 
        let total = google.maps.geometry.spherical.computeDistanceBetween(latLng, sucursal);
        if( total === min){
          moto = loc.nombreMotoTaxi+" "+loc.apellidoMotoTaxi;
        }
      }   
    } 
    
    console.log('La menor distancia es '+ min+' de '+ moto);     
    return moto;
  } 
}
