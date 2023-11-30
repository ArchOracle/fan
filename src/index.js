import {ImagePixels} from "./libs/js/image/image";
import {Map} from "./libs/js/map/map";
import {SimpleAgent} from "./simple_charge/agents";
import {Render} from "./libs/js/render/render";

if (window.location.pathname === "/simple_charge/index.html") {
	document.addEventListener('DOMContentLoaded', () => {
		document.addEventListener('click', (event) => {
			if (event.target.name === 'go') {
				run()
			}
		})
	})
}

function run() {

	document.querySelector('#allCalculateCount').innerText = document.querySelector('[name=frames_count]').value
	document.querySelector('#allDrawCount').innerText = document.querySelector('[name=frames_count]').value
	let render = Render.create({
		map: new Map(
			60,
			60,
			[
				{
					'condition': (x, y, currentState) => {
						return Math.random() < 0.05
					},
					'agentType': SimpleAgent,
					'agentData': (x, y) => {return {x: x, y: y}}
				}
			],
			(agentList) => {
				if (!agentList || !Array.isArray(agentList) || agentList.length === 0) {
					return undefined
				}
				return [agentList[0]]
			}
		),
		canvas: document.querySelector('#charge'),
		timesCanvasToMap: 10,
		fps: document.querySelector('[name=fps]').value,
		needFrameCount: document.querySelector('[name=frames_count]').value,
		converter: (agentList) => {
			let pixel = {
				red: 0,
				green: 0,
				blue: 0,
				alpha: 255,
			}
			if (Array.isArray(agentList)) {
				if (agentList.length > 0) {
					pixel.red = 255
				}
			}
			return pixel
		},
		htmlEditor: (params) => {
			document.querySelector('#currentCalculateCount').innerText = params.currentCalculateCount
			document.querySelector('#currentDrawCount').innerText = params.currentDrawCount
		},
		htmlFinishElement: document.querySelector('#isDone'),
		maxExecutionTime: document.querySelector('[name=max_execution_time]').value
	})
	render.run()
}