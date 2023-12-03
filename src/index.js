import {ImagePixels} from "./libs/js/image/image";
import {Map} from "./libs/js/map/map";
import {Corpuscle, Field, SimpleAgent, Source} from "./simple_charge/agents";
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
						return x === 50 && y === 50
					},
					'agentType': Source,
					'agentData': (x, y) => {return {
						x: x,
						y: y,
						dx: 0,
						dy: 0
					}}
				}
			],
			(agentList) => {
				if (!agentList || !Array.isArray(agentList) || agentList.length === 0) {
					return undefined
				} else if (agentList.length < 5) {
					return agentList
				} else {
					return [agentList[0],agentList[1],agentList[2],agentList[3],agentList[4]]
				}
			}
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
						pixel.red = Math.min(agent.agentData.count * 150, 255)
					}
					if (agent instanceof Field) {
						pixel.blue = Math.min(agent.agentData.energy * 50, 255)
					}
					if (agent instanceof Source) {
						pixel.green = 255
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