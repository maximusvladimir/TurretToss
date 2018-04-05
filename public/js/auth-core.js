window.addEventListener("load", function () {
	var maker = document.getElementById("canvas-shot-maker");
	var c = maker.getContext("2d");

	var currAngle = 45;
	var currSpeed = 100;

	function rebuildInteractive(angle, speed) {
		c.fillStyle = '#fff';
		c.fillRect(0, 0, maker.width, maker.height);

		var lx = maker.width * 0.2;
		var ly = maker.height * 0.4;
		var lw = maker.width * 0.07;
		var lbw = maker.width * 0.1;
		var lbh = maker.height * 0.4;
		var baseAdd = maker.width * 0.05;

		c.beginPath();
		c.strokeStyle = '#000';
		c.lineWidth = 2;
		c.save();
		c.translate(lx + lw / 2, ly + lw / 2);
		c.rotate(Math.PI / 4);
		c.rect(-lw / 2, -lw / 2, lw, lw);
		c.stroke();
		c.restore();
		c.beginPath();
		c.rect(lx + lw * 0.5 - lbw * 0.5, ly + lw / 2, lbw, lbh);
		c.moveTo(lx + lw * 0.5 - lbw * 0.5 - baseAdd, ly + lw / 2 + lbh);
		c.lineTo(lx + lw * 0.5 - lbw * 0.5 + baseAdd + lbw, ly + lw / 2 + lbh);
		c.fill();
		c.stroke();

		var basketx = maker.width * 0.75;
		var baskety = maker.height * 0.5;
		var basketw = maker.width * 0.20;
		var basketh = maker.height * 0.4;
		c.beginPath();
		c.moveTo(basketx, baskety);
		c.lineTo(basketx + basketw, baskety);
		c.lineTo(basketx + basketw * 0.8, baskety + basketh);
		c.lineTo(basketx + basketw * 0.2, baskety + basketh);
		c.lineTo(basketx, baskety);
		c.stroke();
		c.fillStyle = 'rgba(0, 0, 0, 0.3)';
		c.fill();

		// now for physics. yay :(
		var castmaxx = maker.width * 0.45;
		var startx = lx + lw;
		var starty = ly + lw / 5;
		//var angle = 45; // degrees
		var initVelocity = speed; // p/s


		c.beginPath();
		c.setLineDash([3, 2]);
		c.moveTo(startx, starty);
		c.translate(startx, starty);
		var rawAngle = angle / 57.295;
		for (var i = 0; i < castmaxx - startx; i++) {
			//var y = initVelocityY * time - 0.5 * gravity * time * time;
			var ma = rawAngle;
			var v = i / (castmaxx - startx) * rawAngle;
			if (v > Math.PI / 2)
				continue;
			var y = -Math.sin(v) * initVelocity;
			c.lineTo(i, y);
		}
		c.stroke();
		c.translate(-startx, -starty);
		c.setLineDash([]);
	}

	rebuildInteractive(currAngle, currSpeed);

	$("#angle").keyup(function () {
		var v = parseInt($("#angle").val());
		if (v != NaN) {
			currAngle = v;
			rebuildInteractive(currAngle, currSpeed);
		}
	});

	$("#speed").keyup(function () {
		var v = parseInt($("#speed").val());
		if (v != NaN) {
			currSpeed = v;
			rebuildInteractive(currAngle, currSpeed);
		}
	});

	$(".launcher .container .close").click(function () {
		$(".launcher").fadeOut(200);
	});

	$(".launcher .container .toss-button").click(function () {
		ajaxRequest('POST', '../api/enqueue', function (data) {
			alert(data.message);
			$(".launcher").fadeOut(200);
		}, null, {
			speed: parseInt($("#speed").val()),
			angle: parseInt($("#angle").val())
		});
	});

	$("#toss").click(function () {
		$(".launcher").fadeIn(200);
		$("#angle").val("");
		$("#speed").val("");
	});
});

function ajaxRequest(method, url, success, fail, postData) {
	var xhr = new XMLHttpRequest();
	xhr.open(method, url);
	if (method === 'POST') {
		xhr.setRequestHeader('Content-Type', 'application/json');
	}
	xhr.onload = function () {
		if (xhr.status === 200) {
			"function" === typeof success && success(JSON.parse(xhr.response));
		} else {
			"function" === typeof success && fail(JSON.parse(xhr.response), xhr.status);
		}
	};
	if (method === 'POST') {
		xhr.send(JSON.stringify(postData));
	} else {
		xhr.send();
	}
}
