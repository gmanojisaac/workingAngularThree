import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { extend, NgtArgs, NgtCanvas, NgtPush } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { injectNgtsAnimations } from 'angular-three-soba/misc';
import { NgtsEnvironment } from 'angular-three-soba/staging';
import { map } from 'rxjs';
import { Color, Fog, Mesh, PlaneGeometry, PointLight, ShadowMaterial, Vector2 } from 'three';
import { ThreeJSOverlayView, latLngToVector3  } from '@googlemaps/three';
import * as THREE from 'three';
import { RouterOutlet } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';

extend({ Mesh, Fog, PlaneGeometry, ShadowMaterial, PointLight, Vector2, Color });

@Component({
    standalone: true,
    templateUrl: './scene.html',
    imports: [NgtArgs, NgtPush, NgtsOrbitControls, NgtsEnvironment],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Scene {
    readonly Math = Math;

    private readonly gltf$ = injectNgtsGLTFLoader('assets/scene.gltf');

    readonly model$ = this.gltf$.pipe(
        map((gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isObject3D) child.castShadow = true;
            });

            return [gltf.scene];
        })
    );

    constructor() {
        injectNgtsAnimations(this.gltf$);
    }
}

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.html',
    imports: [NgtCanvas, RouterOutlet, GoogleMapsModule],
})
export class App implements OnInit {
    readonly scene = Scene;
    constructor() {}
    ngOnInit(): void {
        this.initMap();
    }
    initMap (){

    }
    display: any;
    center: google.maps.LatLngLiteral = {
        lat: 24,
        lng: 12
    };
    zoom = 4;
    moveMap(event: google.maps.MapMouseEvent) {
        if (event.latLng != null) this.center = (event.latLng.toJSON());
    }
    move(event: google.maps.MapMouseEvent) {
        if (event.latLng != null) this.display = event.latLng.toJSON();
    }

}
