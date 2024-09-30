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
						return x % Math.ceil(Math.random() * 20 + 10) === 5 && y % Math.ceil(Math.random() * 20 + 10) === 5
					},
					'agentType': Source,
					'agentData': (x, y) => {return {
						x: x,
						y: y,
						dx: 0,
						dy: 0,
						charge: Math.random() > 0.5 ? +1 : -1
					}}
				}
			],
			Charge.postHandler
		),
		canvas: document.querySelector('#charge'),
		timesCanvasToMap: 6,
		fps: document.querySelector('[name=fps]').value,
		needFrameCount: document.querySelector('[name=frames_count]').value,
		converter: Charge.converter,
		htmlEditor: (params) => {
			document.querySelector('#currentCalculateCount').innerText = params.currentCalculateCount
			document.querySelector('#currentDrawCount').innerText = params.currentDrawCount
			document.querySelector('#agentCount').innerText = Map.agentCount
			document.querySelector('#maxEnergy').innerText = (Map.maxEnergy)
		},
		htmlFinishElement: document.querySelector('#isDone'),
		maxExecutionTime: document.querySelector('[name=max_execution_time]').value
	})
	render.run()
}