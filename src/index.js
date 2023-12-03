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
			(agentList) => {
				if (
					!agentList || !Array.isArray(agentList) || agentList.length === 0
					|| !(agentList[0].x > 2 && agentList[0].x < 99 && agentList[0].y > 2 && agentList[0].y < 99)
				) {
					return undefined
				} else {
					let corpuscleCharge = 0
					let agentX = 0
					let agentY = 0
					let fieldEnergy = 0
					let isNeedSource = false
					let chargeSource = false
					let isNeedCorpuscle = false
					let isNeedField = false
					agentList.forEach((agent) => {
						agentX = agent.x
						agentY = agent.y
						if (agent instanceof Source) {
							isNeedSource = true
							chargeSource = agent.agentData.charge
						}
						if (agent instanceof Corpuscle) {
							corpuscleCharge += agent.agentData.count * agent.agentData.charge
							isNeedCorpuscle = true
						}
						if (agent instanceof Field) {
							isNeedField = true
							fieldEnergy += agent.agentData.energy * agent.agentData.charge
						}
					})
					agentList = []
					if (isNeedSource) {
						agentList.push(new Source(agentX, agentY, {x: agentX, y: agentY, charge: chargeSource}))
					}
					if (isNeedCorpuscle) {
						agentList.push(new Corpuscle(agentX, agentY, {
							x: agentX,
							y: agentY,
							count: Math.abs(corpuscleCharge),
							charge: Math.sign(corpuscleCharge)
						}))
					}
					if (isNeedField) {
						agentList.push(new Field(agentX, agentY, {
							x: agentX,
							y: agentY,
							energy: Math.abs(fieldEnergy),
							charge: Math.sign(fieldEnergy)
						}))
					}
					return agentList
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