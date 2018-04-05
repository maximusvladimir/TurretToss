var currentQueue = [];

window.onload = function () {
	var metas = document.getElementsByTagName('meta');

	var url = "";
	var youtube = "";
	for (var i = 0; i < metas.length; i++) {
		var attr = metas[i].getAttribute("name");
		var val = metas[i].getAttribute("content");
		if (attr == "data-websocket-url") {
			url = val;
		} else if (attr == "data-youtube-url") {
			youtube = val;
		}
	}

	var ws;

	setupWebsocket();

	// let's launch the shot every 1.5 seconds:
	setInterval(function () {
		var current = $("#current-player");

		var neuCurrent = "<span style='font-style:italic;'>No one is playing</span>";
		if (currentQueue.length !== 0) {
			var altCurrent = currentQueue.pop();
			neuCurrent = "<span style='color: " + altCurrent.color + "'>" + altCurrent.name + "</span>";
		}
		current.html(neuCurrent);
		rebuildPlayerQueue();

	}, 3000);


	$("#iframe-host").html('<iframe allowFullScreen="allowFullScreen" src="' + youtube + '?loop=1&autoplay=1&rel=0&showinfo=0&controls=0&autohide=1" width="560" height="315" allowtransparency="true" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" ></iframe>');
};

function handlePlayerQueue(item) {
	currentQueue.unshift(item);

	rebuildPlayerQueue();
}

function rebuildPlayerQueue() {
	var html = "";
	for (var i = 0; i < currentQueue.length; i++) {
		var item = currentQueue[i];
		html = "<li style='color: " + item.color + "'>" + item.name + "</li>" + html;
	}

	$("#player-queue").html(html);
}

function setupWebsocket() {
	ws = new WebSocket(url);

	ws.onopen = function () {
		ws.send('howdy y\'all!');
	};

	ws.onmessage = function (ev) {
		var data = JSON.parse(ev.data);
		console.log(data);
		if (data.kind === "queue") {
			console.log("hello");
			handlePlayerQueue(data.data);
		}
	};

	ws.onclose = function () {
		// try again in a second:
		setTimeout(function () {
			setupWebsocket();
		}, 1000);
	};
}
