import { CommonModule, NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeJSOverlayView } from '@googlemaps/three';
import { extend, NgtArgs, NgtCanvas, NgtPush } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { injectNgtsAnimations } from 'angular-three-soba/misc';
import { NgtsEnvironment } from 'angular-three-soba/staging';
import { map } from 'rxjs';
import * as THREE from 'three';
import { Color, Fog, Mesh, PlaneGeometry, PointLight, ShadowMaterial, Vector2 } from 'three';

extend({ Mesh, Fog, PlaneGeometry, ShadowMaterial, PointLight, Vector2, Color });

@Component({
    standalone: true,
    templateUrl: './scene.html',
    imports: [NgtArgs, NgtPush, NgtsOrbitControls, NgtsEnvironment, NgFor, CommonModule],
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
    imports: [NgtCanvas, RouterOutlet, NgFor, CommonModule],
    schemas: [NO_ERRORS_SCHEMA],
})
export class App implements OnInit {
    //myscene = Scene;
    private readonly gltf$ = injectNgtsGLTFLoader(
        'assets/scene.gltf'
    );
    modelSubscription = this.gltf$.pipe(
        map((gltf) => {
            return [gltf.scene];
        })
    );

    scene = new THREE.Scene();
    constructor() {}

    ngOnInit(): void {
        this.initMap();
    }
    mymap: any;

    mapOptions = {
        tilt: 0,
        heading: 0,
        zoom: 18,
        center: { lat: 8.52583014991064, lng: 76.88694046759133 }, 
        mapId: '15431d2b469f209e',
        // disable interactions due to animation loop and moveCamera
        disableDefaultUI: true,
        gestureHandling: 'none',
        keyboardShortcuts: false,
    };

    async initMap(): Promise<void> {
        const mapDiv = document.getElementById('map') as HTMLElement;

        this.mymap = new google.maps.Map(mapDiv, this.mapOptions);
        this.modelSubscription.subscribe((myglf: any) => {
            this.scene.add(myglf[0]);
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
            this.scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);

            directionalLight.position.set(0, 10, 50);
            this.scene.add(directionalLight);

            this.scene.scale.set(0.5, 0.5, 0.5);
            this.scene.rotation.x = Math.PI / 2;
            let { tilt, heading, zoom } = this.mapOptions;

            const animate = () => {
                if (tilt < 67.5) {
                    tilt += 0.5;
                } else if (heading <= 360) {
                    heading += 0.2;
                    zoom -= 0.0005;
                } else {
                    // exit animation loop
                    return;
                }

                this.mymap.moveCamera({ tilt, heading, zoom });

                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
            return new ThreeJSOverlayView({
                map: this.mymap,
                scene: this.scene,
                anchor: { ...this.mapOptions.center, altitude: 10 },
                THREE,
            });
        });
    }
}
