import { Component, ViewChild, ElementRef } from '@angular/core';

import { Plugins, GeolocationPluginWeb } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
const { Geolocation } = Plugins;

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  locations: Observable<any>;
  locationCollection: AngularFirestoreCollection<any>
  user = null;

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  markers = [];

  isTracking = false;
  watch = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.anonLogin();
  }

  ionViewWillEnter(){
    this.loadMap();
  }

  loadMap(){
    let latLng = new google.maps.LatLng(51.9036442, 7.6673267);

    let mapOptions = {
      center: latLng,
      zoom: 5,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  anonLogin(){
    this.afAuth.auth.signInAnonymously().then(res => {
      this.user = res.user;
      console.log(this.user);

      this.locationCollection = this.afs.collection(
        `locations/$(this.user.uid}/track`,
        ref => ref.orderBy('timestamp')
      );

      //Cargando datos de firebase

      //Actualizando mapa
    })
  }
  
  startTracking(){
    this.isTracking = true;
    this.watch = Geolocation.watchPosition({}, (position, err) =>{
      console.log('new position: ', position)
      if(position) {
        this.addNewLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.timestamp
        );
      }
    })
  }

  stopTracking(){
    Geolocation.clearWatch({ id: this.watch}).then(() => {
      this.isTracking = false;
    })
  }

  addNewLocation(lat, lng, timestamp){
    this.locationCollection.add({
      lat,
      lng,
      timestamp
    });

    let position = new google.maps.latLng(lat, lng);
    this.map.setCenter(position);
    this.map.setZoom(5);
  }

  deleteLocation(pos){
    console.log('delete: ', pos)
   // this.locationCollection.doc(pos.id).delete();
  }
}
