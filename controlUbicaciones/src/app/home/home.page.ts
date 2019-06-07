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
    this.afAuth.auth.signInAnonymously().then(user => {
      console.log(user);
      this.user = user;

      this.locationCollection = this.afs.collection(
        `locations/$(this.user.uid}/track`,
        ref => ref.orderBy('timestamp')
      );

      //Cargando datos de firebase

      //Actualizando mapa
    })
  }
}
