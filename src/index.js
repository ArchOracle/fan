import {Map} from "./libs/ts/map/map";
import {Charge, Source} from "./simple_charge/agents";
import {Render, RenderConfig} from "./libs/ts/render/render";
import {Seeder} from "./libs/ts/map/seeder";

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
	let render = Render.create(
		new RenderConfig(
			new Map(
				200,
				200,
				[
					new Seeder(
						(x, y, currentState) => {
							// return Math.abs(100 - x) < 80 &&
							// 	Math.abs(100 - y) < 80 &&
							// 	x % Math.ceil(Math.random() * 20 + 30) === 0 &&
							// 	y % Math.ceil(Math.random() * 20 + 30) === 0
							return x === 100 && (y === 50 || y === 150)
						},
						(x, y) => {return new Source(x, y, {
							x: x,
							y: y,
							dx: 0,
							dy: 0,
							charge: y < 100 ? +1 : -1
							//charge: Math.random() > 0.5 ? +1 : -1
						})}
					),
				],
				Charge.postHandler
			),
			document.querySelector('#charge'),
			3,
			10,
			document.querySelector('[name=frames_count]').value,
			Charge.converter,
			(params) => {
				document.querySelector('#currentCalculateCount').innerText = params.currentCalculateCount
				document.querySelector('#currentDrawCount').innerText = params.currentDrawCount
				document.querySelector('#agentCount').innerText = Map.agentCount
				document.querySelector('#maxEnergy').innerText = (Map.maxEnergy)
				document.querySelector('#fps').innerText = params.fps
				document.querySelector('#time').innerText = params.time
			},
			document.querySelector('#isDone'),
			document.querySelector('[name=max_execution_time]').value
		))
	render.run()
}