(function (w) {
	w.gesture = function (box, callback) {
		var flag = false;
		
		var startC = 0;
		var startD = 0;
		
		box.addEventListener('touchstart', function (event) {
			var touch = event.touches;
			if(touch.length >= 2){
				flag = true;
				
				startC = getC(touch[0], touch[1]);
				startD = getD(touch[0], touch[1]);
				
				if(callback && callback['start']){
					callback['start']();
				}
			}
		});
		box.addEventListener('touchmove', function (event) {
			var touch = event.touches;
			if(touch.length >= 2){
				
				// 求 缩放比
				var endC = getC(touch[0], touch[1]);
				event.scale = endC / startC;
				
				// 求 旋转角度
				var endD = getD(touch[0], touch[1]);
				event.rotation = endD - startD;
				
				if(callback && callback['change']){
					callback['change'](event);
				}
			}
		});
		box.addEventListener('touchend', function (event) {
			var touch = event.touches;
			if(touch.length < 2){
				if(flag){
					if(callback && callback['end']){
						callback['end']();
					}
				}
				flag = false;
			}
		});
	}
	
	/*
	 * 得到两个手指之间的直线距离
	 */
	w.getC = function (T1, T2) {
		var x = T1.clientX - T2.clientX;
		var y = T1.clientY - T2.clientY;
		var c = Math.sqrt(x*x + y*y);
		return c;
	}
	
	/*
	 * 得到两个手指连成线后的角度
	 */
	w.getD = function (T1, T2) {
		var x = T1.clientX - T2.clientX;
		var y = T1.clientY - T2.clientY;
		var d = Math.atan2(y, x);
		return d * 180 / Math.PI;
	}

})(window);
