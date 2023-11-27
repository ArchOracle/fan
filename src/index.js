import {ImagePixels} from "./libs/js/image/image";
import {Map} from "./libs/js/map/map";

if (window.location.pathname === "/simple_charge/index.html") {
	document.addEventListener('DOMContentLoaded', () => {
		createTestImage('#charge')
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