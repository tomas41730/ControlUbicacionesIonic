import { Component, ViewChild, ElementRef } from '@angular/core';

//import { Plugins, GeolocationPluginWeb } from '@capacitor/core';
//import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
//import { AngularFireModule } from '@angular/fire';
//import { Router } from '@angular/router';

//const { Geolocation } = Plugins;

declare var google;
import { map } from 'rxjs/operators';
//import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
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
    let latLng = new google.maps.LatLng(-17.380494, -66.179610);

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
         console.log('new ubicaciones: ', ubicaciones);
         this.updateMap(ubicaciones); 
        })
  }
  updateMap(ubicaciones){
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    for (let loc of ubicaciones){
      if(loc.disponible){
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

}
