import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
declare var google;
@Component({
  selector: 'app-ubicaciones',
  templateUrl: './ubicaciones.page.html',
  styleUrls: ['./ubicaciones.page.scss'],
})
export class UbicacionesPage{
  ubicaciones: Observable<any>;
  listaUbicaciones: AngularFirestoreCollection<any>
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
   
      this.listaUbicaciones = this.afs.collection('UbicacionMoto');

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
      let latLng = new google.maps.LatLng(loc.lat, loc.lng);

      let marker = new google.maps.Marker({
        position: latLng,
        animation: google.maps.Animation.Drop,
        map: this.map
      });
      this.markers.push(marker);
    }
  } 

}
