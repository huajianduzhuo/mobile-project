// TODO 竖向滑屏
(function(w){
	w.vDrag = function (wrap, callback) {
		var list = wrap.children[0];
		
		var wrapHeight = wrap.clientHeight;
		
		var elemY = 0;
		var startX = 0;
		var translateY = 0;
		
		// 加速
		var beginY = 0;
		var endX = 0;
		var beginTime = 0;
		var endTime = 0;
		var moveX = 0;
		var moveTime = 0;
		
		// 防止抖动
		var startY = 0;
		var isFirst = true, isY = true;
		
		// Tween 算法
		var Tween = {
			Linear: function(t,b,c,d){
				return c*t/d + b; 
			},
			easeOut: function(t,b,c,d,s){
	            if (s == undefined) s = 3; // 1.70158
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	        }
		};
		
		wrap.addEventListener('touchstart', function (event) {
			clearInterval(wrap.timer);
			
			list.style.transition = '0s';
			
			var touch = event.changedTouches[0];
			elemY = transformCSS(list, 'translateY');
			startX = touch.clientX;
			startY = touch.clientY;
			isFirst = true, 
			isY = true;
			
			// 加速
			beginY = elemY;
			beginTime = new Date().getTime();
			
			if(callback){
				callback['start'] && callback['start']();
			}
		});
		wrap.addEventListener('touchmove', function (event) {
			if(!isY){
				return;
			}
			
			var touch = event.changedTouches[0];
			var endX = touch.clientX;
			
			// 防止抖动
			var endY = touch.clientY;
			var difX = endX - startX;
			var difY = endY - startY;
			if(isFirst){
				isFirst = false;
				if(Math.abs(difX) > Math.abs(difY)){
					isY = false;
					difY = 0;
				}
			}
			
			translateY = elemY + difY;
			var scale = 1 - translateY / wrapHeight;
			
			if(translateY > 0){
				translateY = elemY + difY * scale;
			}else if(translateY < wrapHeight - list.offsetHeight){
				scale = 1 - (-translateY+wrapHeight-list.offsetHeight) / wrapHeight;
				translateY = elemY + difY * scale;
			}
			transformCSS(list, 'translateY', translateY);
			
			if(callback){
				callback['move'] && callback['move']();
			}
			
		});
		wrap.addEventListener('touchend', function (event) {
			var touch = event.changedTouches[0];
			
			translateY = transformCSS(list, 'translateY');
			// 加速
			endY = transformCSS(list, 'translateY');
			endTime = new Date().getTime();
			moveY = endY - beginY;
			moveTime = endTime - beginTime;
			
			var speed = moveY / moveTime;
			var targetY = translateY + speed * 500;
			var type = 'Linear';
			if(targetY > 0){
				targetY = 0;
				type = 'easeOut';
			}else if(targetY < wrapHeight - list.offsetHeight){
				targetY = wrapHeight - list.offsetHeight;
				type = 'easeOut';
			}
			var time = 2;
			vMoveAfterEnd(targetY, time, type);
			
			if(callback){
				callback['over'] && callback['over']();
			}
		});
		
		function vMoveAfterEnd (targetY, time, type) {
			var t = 0, num = 0;
			var b = transformCSS(list, 'translateY');
			var c = targetY - b;
			var d = time *　1000;
			
			clearInterval(wrap.timer);
			wrap.timer = setInterval(function () {
				num++;
				t = num * 20;
				transformCSS(list, 'translateY', Tween[type](t, b, c, d));
				if(callback){
					callback['move'] && callback['move']();
				}
				if(t >= d){
					clearInterval(wrap.timer);
					if(callback){
						callback['end'] && callback['end']();
					}
				}
			}, 20);
			
		}
	}
})(window);
