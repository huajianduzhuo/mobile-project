// TODO 阻止默认行为
document.addEventListener('touchstart', function(event){
	event.preventDefault();
	return false;
});

window.onload = function () {
	// TODO rem 适配
	(function () {
		var deviceWidth = document.documentElement.clientWidth;
		var styleN = document.createElement('style');
		styleN.innerHTML = 'html{font-size: '+ deviceWidth/16 +'px !important}';
		document.head.appendChild(styleN);
	})();
	
	// TODO 输入框取消阻止默认行为
	(function () {
		var inputs = document.querySelectorAll('input');
		for (var i=0;i<inputs.length;i++) {
			inputs[i].addEventListener('touchstart', function(event){
				event.stopPropagation();
			});
		}
	})();
	
	// TODO 点击菜单按钮
	(function () {
		var menu = document.getElementById('menu');
		var list = document.getElementById('list');
		
		menu.addEventListener('touchstart', function (event) {
			if(menu.className == 'menuOpen'){
				menu.className = 'menuClos';
				list.style.display = 'none';
			}else{
				menu.className = 'menuOpen';
				list.style.display = 'block';
			}
			event.stopPropagation();
		});
		document.addEventListener('touchstart', function () {
			if(menu.className == 'menuOpen'){
				menu.className = 'menuClos';
				list.style.display = 'none';
			}
		});
		list.addEventListener('touchstart', function (event) {
			event.stopPropagation();
			return false;
		});
	})();
	
	// TODO 导航栏拖动
	(function () {
		var wrap = document.getElementById('nav_wrap');
		var list = document.getElementById('nav_list');
		var listNodes = document.querySelectorAll('#nav_list li');
		
		transformCSS(list, 'translateZ', 1);
		
		var docWidth = document.documentElement.clientWidth;
		
		var elemX = 0;
		var startX = 0;
		var translateX = 0;
		
		// 加速
		var beginX = 0;
		var endX = 0;
		var beginTime = 0;
		var endTime = 0;
		var moveX = 0;
		var moveTime = 0;
		
		wrap.addEventListener('touchstart', function (event) {
			list.style.transition = '0s';
			
			var touch = event.changedTouches[0];
			elemX = transformCSS(list, 'translateX');
			startX = touch.clientX;
			
			// 加速
			beginX = elemX;
			beginTime = new Date().getTime();
		});
		wrap.addEventListener('touchmove', function (event) {
			var touch = event.changedTouches[0];
			var endX = touch.clientX;
			var difX = endX - startX;
			translateX = elemX + difX;
			var scale = 1 - translateX / docWidth;
			
			if(translateX > 0){
				translateX = elemX + difX * scale;
			}else if(translateX < docWidth - list.offsetWidth){
				scale = 1 - (-translateX+docWidth-list.offsetWidth) / docWidth;
				translateX = elemX + difX * scale;
			}
			transformCSS(list, 'translateX', translateX);
			
		});
		wrap.addEventListener('touchend', function () {
			translateX = transformCSS(list, 'translateX');
			// 加速
			endX = transformCSS(list, 'translateX');
			endTime = new Date().getTime();
			moveX = endX - beginX;
			moveTime = endTime - beginTime;
			
			var speed = moveX / moveTime;
			var targetX = translateX + speed * 500;
			
			var bezier = '';
			if(targetX > 0){
				targetX = 0;
				bezier = 'cubic-bezier(.08,1.56,.8,1.5)';
			}else if(targetX < docWidth - list.offsetWidth){
				targetX = docWidth - list.offsetWidth;
				bezier = 'cubic-bezier(.08,1.56,.8,1.5)';
			}
			list.style.transition = 500 + 'ms ' + bezier;
			transformCSS(list, 'translateX', targetX);
			
			// TODO 点击 li 时，li 样式改变
			var target = event.changedTouches[0].target;
			if(moveX == 0 && target.nodeName == 'A'){
				document.querySelector('.active').className = '';
				target.parentElement.className = 'active';
			}
		});
		
	})();
	
	// TODO banner 无缝滑屏
	(function () {
		var wrap = document.getElementById('ban_wrap');
		var list = document.getElementById('ban_list');
		list.innerHTML += list.innerHTML;
		var listNodes = document.querySelectorAll('#ban_list li');
		var navSpans = document.querySelectorAll('#ban_nav span');
		
		// 设置 list 和 li 的宽度，以及 wrap 的高度
		(function () {
			var lis = document.querySelectorAll('#ban_list li');
			var styleN = document.createElement('style');
			styleN.innerHTML = '#ban_list{width: ' + lis.length + '00%}';
			styleN.innerHTML += '#ban_list li{width: ' + (100/lis.length) + '%}';
			styleN.innerHTML += '#ban_wrap{height: ' + lis[0].offsetHeight + 'px}';
			document.head.appendChild(styleN);
		})();
		
		transformCSS(list, 'translateZ', 1);
		
		// 滑动事件
		var startX, offsetLeft;
		var deviceWidth = document.documentElement.clientWidth; // 设备宽度
		var listWidth = list.offsetWidth; // 图片列表宽度
		
		// 防止上下滑抖动
		var isFirst = true;
		var isX = true;
		var disX = 0, disY = 0, startY = 0; 
		
		var num = 0;
		wrap.addEventListener('touchstart', function (event) {
			clearInterval(timer);
			
			var touchEvent = event.changedTouches[0];
			list.style.transition = '0s';
			startX = touchEvent.clientX;
			
			if(num == 0){
				num = navSpans.length;
			}else if(num == listNodes.length - 1){
				num = navSpans.length - 1;
			}
			transformCSS(list, 'translateX', (-num * deviceWidth));
			
			offsetLeft = transformCSS(list, 'translateX');
			
			//防止抖动
			startY = touchEvent.clientY;
			isFirst = true;
			isX = true;
		});
		
		wrap.addEventListener('touchmove', function (event) {
			if(!isX){
				return;
			}
			
			var touchEvent = event.changedTouches[0];
			var endX = touchEvent.clientX;
			
			var endY = touchEvent.clientY;
			disX = endX - startX;
			disY = endY - startY;
			if(isFirst){
				if(Math.abs(disY) > Math.abs(disX)){
					isX = false;
					disX = 0;
				}
			}
			isFirst = false;
			transformCSS(list, 'translateX', (offsetLeft + disX));
		});
		
		wrap.addEventListener('touchend', function () {
			num = Math.round(-transformCSS(list, 'translateX') / deviceWidth);
			
			if(num < 0){
				num = 0;
			}else if(num > listNodes.length - 1){
				num = listNodes.length - 1;
			}
			
			list.style.transition = '1s';
			transformCSS(list, 'translateX', (-num * deviceWidth));
			
			document.getElementsByClassName('ban_active')[0].className = '';
			navSpans[(num % 5)].className = 'ban_active';
			
			timer = setInterval(auto, 2000);
		});
		
		var timer = setInterval(auto, 2000);
		
		function auto () {
			// 移动到最后一张，立即改为第一轮最后一张
			if(num == listNodes.length - 1){
				num = navSpans.length - 1;
				list.style.transition = '0s';
				transformCSS(list, 'translateX', (-num * deviceWidth));
			}
			// 自动轮播
			setTimeout(function () {
				num++;
				list.style.transition = '1s';
				transformCSS(list, 'translateX', (-num * deviceWidth));
				document.getElementsByClassName('ban_active')[0].className = '';
				navSpans[(num % 5)].className = 'ban_active';
			}, 20);
		}
	})();
	
	// TODO tab MV首播
	(function () {
		var tabNavAll = document.querySelectorAll('.tab_nav');
		var tabWrapAll = document.querySelectorAll('.tab_wrap');
		var translateX = tabNavAll[0].offsetWidth;
		
		for (var i=0; i<tabWrapAll.length; i++) {
			tabMove(tabWrapAll[i], tabNavAll[i]);
		}
		
		function tabMove (tabWrap, tabNav) {
			// 初始时显示第一个 tab
			transformCSS(tabWrap, 'translateX', -translateX);
			
			transformCSS(tabWrap, 'translateZ', 1);
			transformCSS(tabNav, 'translateZ', 1);
			
			var loadingAll = tabWrap.querySelectorAll('.loading');
			var navNodes = tabNav.querySelectorAll('a'); // tab_nav 导航条下的所有 a 标签
			var bottomG = tabNav.querySelector('.bottomG'); // 绿色导航条
			
			// 移动
			var startX = 0, startY = 0, eleLeft = 0, disX = 0, disY = 0;
			// 防止抖动
			var isFirst = true, isX = true;
			// 加载页面不可以操作
			var isLoad = false;
			// tab 绿色导航条移动
			var numG = 0;
			
			tabWrap.addEventListener('touchstart', function (event) {
				if(isLoad){
					return;
				}
				
				tabWrap.style.transition = '0s';
				
				var touch = event.changedTouches[0];
				eleLeft = transformCSS(tabWrap, 'translateX');
				startX = touch.clientX;
				startY = touch.clientY;
				// 防止抖动
				isFirst = true;
				isX = true;
			});
			tabWrap.addEventListener('touchmove', function (event) {
				if(isLoad){
					return;
				}
				
				if(!isX){
					return;
				}
				var touch = event.changedTouches[0];
				var endX = touch.clientX;
				var endY = touch.clientY;
				disX = endX - startX;
				disY = endY - startY;
				// 防止抖动
				if(isFirst){
					isFirst = false;
					if(Math.abs(disY) > Math.abs(disX)){
						isX = false;
						disX = 0;
					}
				}
				transformCSS(tabWrap, 'translateX', eleLeft + disX);
				
				// 手指移过 1/2 ，跳到下一张或前一张
				if(Math.abs(disX) > translateX/2){
					// 进入了加载页面，加载标志为 true
					isLoad = true;
					
					// 绿色导航条移动
					if(disX > 0){
						numG--;
					}else if(disX < 0){
						numG++;
					}
					if(numG < 0){
						numG = navNodes.length - 1;
					}else if(numG > navNodes.length - 1){
						numG = 0;
					}
					bottomG.style.transition = '0.5s';
					transformCSS(bottomG, 'translateX', navNodes[numG].offsetLeft);
					
					// 移入加载页面
					var targetX = disX > 0 ? 0 : -2 * translateX;
					tabWrap.style.transition = '0.5s';
					transformCSS(tabWrap, 'translateX', targetX);
					// 移入加载页面过渡结束后，重新跳回内容页
					tabWrap.addEventListener('transitionend', transitionEnd);
					function transitionEnd () {
						// 加载图标显示
						for (var i=0; i<loadingAll.length; i++) {
							loadingAll[i].style.opacity = '1';
						}
						// 2s 后跳回内容页
						setTimeout(function () {
							tabWrap.style.transition = '0s';
							transformCSS(tabWrap, 'translateX', -translateX);
							// 加载图标隐藏
							for (var i=0; i<loadingAll.length; i++) {
								loadingAll[i].style.opacity = '0';
							}
							isLoad = false;
						}, 2000);
						tabWrap.removeEventListener('transitionend', transitionEnd);
					}
				}
			});
			tabWrap.addEventListener('touchend', function (event) {
				if(isLoad){
					return;
				}
				
				var touch = event.changedTouches[0];
				if(Math.abs(disX) < translateX/2){
					tabWrap.style.transition = '0.5s';
					transformCSS(tabWrap, 'translateX', -translateX);
				}
			});
		}
		
	})();

	// TODO 竖向滑屏
	(function () {
		var wrap = document.getElementById('contentWrap');
		var content = document.getElementById('content');
		var scrollBar = document.getElementById('scrollBar');
		
		var scale = wrap.clientHeight / content.offsetHeight;
		scrollBar.style.height = wrap.clientHeight * scale + 'px';
		
		var callback = {
			start: function () {
				scrollBar.style.opacity = '1';
			},
			move: function () {
				scrollBar.style.opacity = '1';
				var scrollY = transformCSS(content, 'translateY') * scale;
				transformCSS(scrollBar, 'translateY', -scrollY);
			},
			end: function () {
				scrollBar.style.opacity = '0';
			}
		};
		
		vDrag(wrap, callback);
	})();
}