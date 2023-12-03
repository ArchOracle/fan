import {ImagePixels} from "./libs/js/image/image";
import {Map} from "./libs/js/map/map";
import {Charge, Corpuscle, Field, SimpleAgent, Source} from "./simple_charge/agents";
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
			100,
			100,
			[
				{
					'condition': (x, y, currentState) => {
						return (x === 30 && y === 30) || (x === 70 && y === 70)
					},
					'agentType': Source,
					'agentData': (x, y) => {return {
						x: x,
						y: y,
						dx: 0,
						dy: 0,
						charge: (x < 50 && y < 50) ? +1 : -1
					}}
				}
			],
			Charge.postHandler
		),
		canvas: document.querySelector('#charge'),
		timesCanvasToMap: 6,
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
				agentList.forEach((agent) => {
					if (agent instanceof Corpuscle) {
						if (agent.agentData.charge > 0) {
							pixel.red = 255
						} else if (agent.agentData.charge < 0) {
							pixel.green = 255
						} else {
							pixel.red = 255
							pixel.green = 255
							pixel.blue = 255
						}
					}
					if (agent instanceof Field) {
						pixel.blue = Math.min(agent.agentData.energy * 100, 255)
					}
				})
			}
			return pixel
		},
		htmlEditor: (params) => {
			document.querySelector('#currentCalculateCount').innerText = params.currentCalculateCount
			document.querySelector('#currentDrawCount').innerText = params.currentDrawCount
			document.querySelector('#agentCount').innerText = Map.agentCount
		},
		htmlFinishElement: document.querySelector('#isDone'),
		maxExecutionTime: document.querySelector('[name=max_execution_time]').value
	})
	render.run()
}