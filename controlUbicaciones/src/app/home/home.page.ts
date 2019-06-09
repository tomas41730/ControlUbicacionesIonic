import { Component, ViewChild, ElementRef } from '@angular/core';

import { Plugins, GeolocationPluginWeb } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';

const { Geolocation } = Plugins;

declare var google;
import { map } from 'rxjs/operators';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  locations: Observable<any>;
  locationsCollection: AngularFirestoreCollection<any>
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
    let latLng = new google.maps.LatLng(-17.380494, -66.179610);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
  }

  anonLogin(){
    this.afAuth.auth.signInAnonymously().then(res => {
      this.user = res.user;
      console.log(this.user);

      this.locationsCollection = this.afs.collection(
        `locations/`+this.user.uid+`/track`,
        ref => ref.orderBy('timestamp')
      );

      //Cargando datos de firebase
        this.locations = this.locationsCollection.snapshotChanges().pipe(
          map(actions => 
            actions.map(a => {
              const data = a.payload.doc.data();
              const id =  a.payload.doc.id;
              return { id, ...data };
            })
          )
        );
        
      //Actualizando mapa
      this.locations.subscribe(locations =>
        {
         console.log('new locations: ', locations);
         this.updateMap(locations); 
        })
    });
  }

  updateMap(locations){
    this.markers.map(marker => marker.setMap(null));
    this.markers = [];

    for (let loc of locations){
      let latLng = new google.maps.LatLng(loc.lat, loc.lng);

      let marker = new google.maps.Marker({
        position: latLng,
        animation: google.maps.Animation.Drop,
        map: this.map
      });
      this.markers.push(marker);
    }
  }
  
  startTracking(){
    // this.isTracking = true;
    // this.watch = Geolocation.watchPosition({}, (position, err) =>{
    //   console.log('new position: ', position);
    //   if(position) {
    //     this.addNewLocation(
    //       position.coords.latitude,
    //       position.coords.longitude,
    //       position.timestamp
    //     );
    //   }
    // });
  }

  stopTracking(){
    Geolocation.clearWatch({ id: this.watch}).then(() => {
      this.isTracking = false;
    })
  }

  addNewLocation(lat, lng, timestamp){
    this.locationsCollection.add({
      lat,
      lng,
      timestamp
    });

    let position = new google.maps.LatLng(lat, lng);
    this.map.setCenter(position);
    this.map.setZoom(15);
  }

  deleteLocation(pos){
    //console.log('delete: ', pos)
   this.locationsCollection.doc(pos.id).delete();
  }
}
