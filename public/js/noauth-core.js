var currentQueue = [];

window.addEventListener("load", function () {
	var metas = document.getElementsByTagName('meta');

	$("#chat-msg").css("display", "none");
	$("#chat-send").css("display", "none");
	
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

	setupWebsocket(url);

	//$("#iframe-host").html('<iframe allowFullScreen="allowFullScreen" src="' + youtube + '?autoplay=1&rel=0&showinfo=0&controls=0&autohide=1" width="560" height="315" allowtransparency="true"  frameborder="0" ></iframe>');//style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" ></iframe>');
	$("#youtube-iframe").attr("src", youtube + '?controls=0&autohide=1&autoplay=1');
	$(window).resize(function () {
		recomputeIframeBounds();
	});
	recomputeIframeBounds();

	function recomputeIframeBounds() {
		var w = $(window).width() - 300;
		var h = $(window).height() - 30;
		console.log("resize test." + w + ", " + h);
		var targetW = h * 1.7875;
		var targetH = w / 1.7875;
		if (w > targetW) {
			$("#youtube-iframe").attr("width", targetW).attr("height", h);
		} else {
			$("#youtube-iframe").attr("width", w).attr("height", targetH);
		}
	}


	$(".tab").click(function () {
		$(".tab").removeClass("tab-active");
		$(this).addClass("tab-active");
		var p = $(this).index();
		$(".tab-block").removeClass("active");
		$($(".tab-block-parent").children()[$(this).index()]).addClass("active");
	});
	
	$("#chat-send").click(function() {
		var msg = $("#chat-msg").val();
		if (lastWebSocket != null) {
			$("#chat-msg").val("");
			lastWebSocket.send(JSON.stringify({
				kind: 'chat',
				cookie: $.cookie("auth"),
				msg: msg
			}))
		}
	});
});

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

function setupWebsocket(url) {
	ws = new WebSocket(url);

	ws.onopen = function () {
		lastWebSocket = ws;
		//ws.send('howdy y\'all!');
	};

	ws.onmessage = function (ev) {
		var data = JSON.parse(ev.data);
		if (data.kind === "queue") {
			handlePlayerQueue(data.data);
		} else if (data.kind === "progression") {
			var current = $("#current-player");
			var neuCurrent = "<span style='font-style:italic;'>No one is playing</span>";
			if (data.data != null) {
				if (currentQueue.length !== 0) {
					var altCurrent = currentQueue.pop();
					neuCurrent = "<span style='color: " + altCurrent.color + "'>" + altCurrent.name + "</span>";
					rebuildPlayerQueue();
				}
			}
			current.html(neuCurrent);
		} else if (data.kind === "shot") {
			//{ user: currentUser, made: hit }
			var i = data.data;
			if ($.cookie("user") == i.user) {
				if (i.made) {
					alert("Congrats! You made your shot!");
				} else {
					alert("You didn't make your shot :(");
				}
			}
		} else if (data.kind === "pc") {
			$("#people").empty().html(data.data + " people are watching");
		} else if (data.kind === "chat") {
			//console.log(data);
			var dd = $("#chat").text() + data.data + "\n";
			$("#chat").empty().text(dd);
		}
	};

	ws.onclose = function () {
		// try again in a second:
		setTimeout(function () {
			setupWebsocket(url);
		}, 2000);
	};
}

var lastWebSocket = null;
