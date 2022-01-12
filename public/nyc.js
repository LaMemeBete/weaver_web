import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFExporter } from './GLTFExporter.js'
import { STLExporter } from './STLExporter.js'
import { OBJLoader } from './OBJLoader.js'

import Stats from 'three/examples/jsm/libs/stats.module'
//import { saveAs } from 'file-saver'

const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper( 5 );
//const directionalLight = new THREE.HemisphereLight( 0xffffff, 10 );
//const directionalLight = new THREE.HemisphereLight( 0xffffff, 10000000 );
let light_1 = new THREE.DirectionalLight(0x00ffff, 1);
light_1.position.set(100, 100, 100);
light_1.castShadow = true;
light_1.shadow.mapSize.width = 512;  
light_1.shadow.mapSize.height = 512; 
light_1.shadow.camera.near = 0.5;
light_1.shadow.camera.far = 500

let light_2 = new THREE.DirectionalLight(0xff00ff, 1);
light_2.position.set(100, -100, 100);
light_2.castShadow = true;
light_2.shadow.mapSize.width = 512;  
light_2.shadow.mapSize.height = 512; 
light_2.shadow.camera.near = 0.5;
light_2.shadow.camera.far = 500


let light_3 = new THREE.DirectionalLight(0x00ffff, 1);
light_1.position.set(-100, -200, -100);
light_1.castShadow = true;
light_1.shadow.mapSize.width = 512;  
light_1.shadow.mapSize.height = 512; 
light_1.shadow.camera.near = 0.5;
light_1.shadow.camera.far = 500

let light_4 = new THREE.DirectionalLight(0xff00ff, 1);
light_1.position.set(-200, -100, -100);
light_2.castShadow = true;
light_2.shadow.mapSize.width = 512;  
light_2.shadow.mapSize.height = 512; 
light_2.shadow.camera.near = 0.5;
light_2.shadow.camera.far = 500



//scene.add( axesHelper );
scene.add(light_1);
scene.add(light_2);
scene.add(light_3);
scene.add(light_4);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor( 0xffffff, 1);
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})


window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


/*window.addEventListener("click", function(){ 
    download(JSON.stringify(scene.toJSON()), 'json.txt', 'text/plain');
});*/

/**
 * Load boroughs
 */
let object;

// manager

function loadModel() {

    object.traverse( function ( child ) {
        if ( child.isMesh ) child.material.map = texture;

    } );
    object.position.y = - 95;
    scene.add( object );

}

const manager = new THREE.LoadingManager(loadModel);

manager.onProgress = function ( item, loaded, total ) {
    console.log( item, loaded, total );
};

// texture

const textureLoader = new THREE.TextureLoader( manager );
const texture = textureLoader.load( './textures/uv_grid_opengl.jpeg' );

// model

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );

    }

}

function onError() {}

const loader = new OBJLoader( manager );
loader.load( 'models/male02.obj', function ( obj ) {

    object = obj;

}, onProgress, onError );


/**
 * Socket imp
 */
let socket = new WebSocket("ws://localhost:8001/");

socket.onopen = function(e) {
  /*alert("[open] Connection established");
  alert("Sending to server");
  socket.send("My name is John");*/
};

function create_line(lines, color) {
    const material = new THREE.LineBasicMaterial({
        color: parseInt(color.replace("#","0x"),16)
    });
    const points = [];
    points.push(new THREE.Vector3(parseFloat(lines[0])/10, parseFloat(lines[1])/10, parseFloat(lines[2])/10));
    points.push(new THREE.Vector3(parseFloat(lines[3])/10, parseFloat(lines[4])/10, parseFloat(lines[5])/10));

    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    return cylindricalSegment(new THREE.Vector3(parseFloat(lines[0])/10, parseFloat(lines[1])/10, parseFloat(lines[2])/10),
                              new THREE.Vector3(parseFloat(lines[3])/10, parseFloat(lines[4])/10, parseFloat(lines[5])/10))
    //const lineThree = new THREE.Line( geometry, material );
    //return lineThree;
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.random() * (max - min) + min;
}

function cylindricalSegment(A, B) {
    //let radius = randomIntFromInterval(0.001, 0.2);
    let radius = 0.01;
    //const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    let material = new THREE.MeshStandardMaterial( {
        color: 0xD3D3D3,
        roughness: 1,
        metalness: 0.2
    } );
    var vec = B.clone(); vec.sub(A);
    var h = vec.length();
    vec.normalize();
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vec);
    var geometry = new THREE.CylinderGeometry(radius, radius, h, 8);
    geometry.translate(0, h / 2, 0);
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.applyQuaternion(quaternion);
    cylinder.position.set(A.x, A.y, A.z);
    return cylinder;
}

socket.onmessage = function(event) {
    var arrayOfLines = event.data.match(/[^\r\n]+/g);
    var dict = {};
    var lines_tmp = []
    arrayOfLines.forEach((element) => {
        var elementArray = element.split(",");
        if (elementArray[7] == 'line') {
            if (!(elementArray[8] in dict)) {
                dict[elementArray[8]] = []
            }
            dict[elementArray[8]].push(elementArray)
        }
    });
    for (var key in dict) {
        if (dict.hasOwnProperty(key)) {
            dict[key].forEach((element) => {
                scene.add(create_line(element, key));
            })            
            renderer.render( scene, camera );
        }
    }
    
};
const stats = Stats()

function animate() {
    requestAnimationFrame(animate)
    /*cube.rotation.x += 0.01
    cube.rotation.y += 0.01*/
    controls.update()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()

function save( blob, filename ) {
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
	// URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}

function downloadJSON( json, filename ) {
	saveString( JSON.stringify( json ), filename );  
}

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link )



document.getElementById( 'export_scene' ).addEventListener( 'click', function () {
    const exporter = new STLExporter();
    const result = exporter.parse( scene );
    console.log(result)
	saveString( result, 'box.stl' );
} );


