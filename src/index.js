import {ImagePixels} from "./libs/js/image/image";
import {Map} from "./libs/js/map/map";
import {SimpleAgent} from "./simple_charge/agents";

if (window.location.pathname === "/simple_charge/index.html") {
	document.addEventListener('DOMContentLoaded', () => {
		document.addEventListener('click', (event) => {
			if (event.target.name === 'go') {
				createTestImage('#charge')
			}
		})
	})
}

function createTestImage(canvasSelector) {
	let canvas = document.querySelector(canvasSelector)
	let context = canvas.getContext('2d')

	let imagePixel = new ImagePixels(context.createImageData(canvas.height, canvas.width))

	for (let x = 0; x < imagePixel.width; x += 1) {
		for (let y = 0; y < imagePixel.height; y +=1 ) {
			imagePixel.alphaMatrix.set(x, y, 255)
			if (Math.random() < 0.05) {
				imagePixel.redMatrix.set(x, y, 255)
			}
			if (Math.random() < 0.05) {
				imagePixel.greenMatrix.set(x, y, 255)
			}
			if (Math.random() < 0.05) {
				imagePixel.blueMatrix.set(x, y, 255)
			}
		}
	}
	imagePixel.fillImageData(context)
}

function seedTestMap() {
	let map = new Map(600, 600)
	for (let x = 0; x < map.width; x += 1) {
		for (let y = 0; y < map.height; y +=1 ) {
			if (Math.random() < 0.05) {
				map.addAgent(new SimpleAgent(x, y))
			}
		}
	}
	return map
}