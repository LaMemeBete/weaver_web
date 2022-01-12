import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFExporter } from './GLTFExporter.js'
import { STLExporter } from './STLExporter.js'
import { OBJLoader } from './OBJLoader.js'

import Stats from 'three/examples/jsm/libs/stats.module'
let container;

			let camera, scene, renderer, controls;

			let mouseX = 0, mouseY = 0;

			let windowHalfX = window.innerWidth / 2;
			let windowHalfY = window.innerHeight / 2;

			let object;

            

            

			init();
			animate();


			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.z = 250;

				// scene

				scene = new THREE.Scene();

				const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
				scene.add( ambientLight );

				const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
				camera.add( pointLight );
				scene.add( camera );

				// manager

				function loadModel() {

					object.traverse( function ( child ) {

						if ( child.isMesh ) child.material.map = texture;

					} );

					object.position.y = 0;
					scene.add( object );

				}

				const manager = new THREE.LoadingManager( loadModel );

				manager.onProgress = function ( item, loaded, total ) {

					console.log( item, loaded, total );

				};

				// texture

				const textureLoader = new THREE.TextureLoader( manager );
				const texture = textureLoader.load('textures/uv_grid_opengl.jpeg');

				// model

				function onProgress( xhr ) {

					if ( xhr.lengthComputable ) {

						const percentComplete = xhr.loaded / xhr.total * 100;
						console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );

					}

				}

				function onError() {}

				const loader = new OBJLoader( manager );
				loader.load( 'models/m.obj', function ( obj ) {

					object = obj;

				}, onProgress, onError );

				//

				renderer = new THREE.WebGLRenderer();
                controls = new OrbitControls(camera, renderer.domElement);
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				//document.addEventListener( 'mousemove', onDocumentMouseMove );

				//

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				mouseX = ( event.clientX - windowHalfX ) / 2;
				mouseY = ( event.clientY - windowHalfY ) / 2;

			}

			//

            function animate() {
                requestAnimationFrame(animate)
                /*cube.rotation.x += 0.01
                cube.rotation.y += 0.01*/
                controls.update()
                render()
                stats.update()
            }

			function render() {

				camera.position.x += ( mouseX - camera.position.x ) * .05;
				camera.position.y += ( - mouseY - camera.position.y ) * .05;

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}