document.querySelectorAll('a.list-item-wrapper').forEach((link) => {
	let container = document.createElement('div')
	container.innerHTML = await (await fetch(link.href)).text()

})