document.addEventListener('touchstart', function (event) {
	event.preventDefault();
});

window.onload = function () {
	
	// rem 适配
	(function () {
		var width = document.documentElement.clientWidth;
		var styleN = document.createElement('style');
		styleN.innerHTML = 'html{font-size: '+ width/16 +'px !important;}';
		document.head.appendChild(styleN);
	})();
	
	// 获取页面元素
	var header = document.getElementById('header');
	var wrap = document.getElementById('wrap');
	var content = document.getElementById('content');
	var list = document.getElementById('list');
	var footer = document.getElementById('footer');
	var scrollBar = document.getElementById('scrollBar');
	
	// footer 的初始缩放为 0
	transformCSS(footer, 'scale', 0);
	var isBottom = false;
	
	// 存储图片地址的数组
	var imgArr = [];
	for(var i=0; i<20; i++){
		imgArr.push("img/"+ (i%18 + 1) +".jpg");
	}
	
	/*
	 * 生成 li，一次生成两屏，12个
	 * 每一个 li 对象添加 src 属性，存储该 li 对应 imgArr 中的图片地址
	 * 每一个 li 对象添加 isLoad 属性，判断该 li 是否已加载图片
	 * start：本次创建的 li 开始的个数
	 * end：本次创建的 li 结束的个数
	 */
	var start = 0;
	var length = 12;
	
	createLi();
	function createLi () {
		if(start >= imgArr.length){
			footer.innerHTML = "已加载全部";
			setTimeout(function () {
				// 一段时间后，content 位置移回底部
				var minH = content.offsetHeight - wrap.clientHeight;
				content.style.transition = '0.5s';
				transformCSS(content, 'translateY', -minH);
				transformCSS(footer, 'scale', 0);
				// scrollBar 位置同样移回底部
				scrollBar.style.transition = '0.5s';
				var scale = wrap.clientHeight / content.offsetHeight;
				transformCSS(scrollBar, 'translateY', minH * scale);
			}, 1500);
			return;
		}
		var end = start + length;
		end = end >= imgArr.length ? imgArr.length : end;
		
		for(var i=start; i<end; i++){
			var li = document.createElement('li');
			// 存储该 li 的图片地址
			li.src = imgArr[i];
			// 该 li 是否加载图片的标记，刚创建时为 false
			li.isLoad = false;
			list.appendChild(li);
		}
		start = end;
		// 创建 li 完成，为可视区域的 li 加载图片
		lazyLoad();
		
		// 为 scrollBar 设置高度
		var scale = wrap.clientHeight / content.offsetHeight;
		scrollBar.style.height = wrap.clientHeight * scale + 'px';
	}
	
	/*
	 * 懒加载图片
	 * 循环所有 li，判断 li 位置是否在可见区域（使用 getBoundingClientRect()函数）
	 * 如果在可见区域，判断该 li 是否已加载图片（isLoad）
	 * 如果没有，则调用加载图片的函数 createImage 为该 li 加载图片
	 * 加载完图片，需要将该 li 的  isLoad 属性的值改为 true，则下次懒加载图片时，不会重复为该 li 加载图片
	 */
	function lazyLoad () {
		var liNodes = document.querySelectorAll('#list li');
		// 可视区域最小 top
		var minT = header.offsetHeight;
		// 可视区域最大 top
		var maxT = document.documentElement.clientHeight;
		
		for(var i=0; i<liNodes.length; i++){
			var liT = liNodes[i].getBoundingClientRect().top;
			if(!liNodes[i].isLoad && liT > minT && liT < maxT){
				createImage(liNodes[i]);
				liNodes[i].isLoad = true;
			}
		}
	}
	
	/*
	 * 为一个 li 加载图片，需要传入形参 li
	 * 使用  new Image() 构造函数生成图片对象
	 */
	function createImage (li) {
		var img = new Image();
		img.src = li.src;
		img.style.transition = 'opacity 0.5s';
		img.onload = function () {
			img.style.opacity = 1;
		}
		li.appendChild(img);
	}
	
	/*
	 * 竖向滑屏
	 */
	var callback = {
		/*
		 * footer 初始缩放 scale 是 0，不显示。
		 * 定义变量 isBottom ，判断当前 content 是否在底部。
		 * 当 touchStart 时，判断当前 content 位置是否是底部，如果是，将 isBottom 设置为 true。
		 */
		start: function(){
			scrollBar.style.transition = '0s';
			var minH = content.offsetHeight - wrap.clientHeight;
			if(Math.abs(transformCSS(content, 'translateY')) >= minH){
				isBottom = true;
			}
			scrollBar.style.opacity = 1;
		},
		/*
		 *  move 时，如果是底部（isBottom），显示 footer，根据上拉高度一点点增加 scale。
		 *  当 footer 部分全部显示时，scale 为 1。
		 */
		move: function() {
			if(isBottom){
				var minH = content.offsetHeight - wrap.clientHeight;
				var footerScale = (Math.abs(transformCSS(content, 'translateY')) - minH) / footer.offsetHeight;
				footerScale = footerScale >= 1 ? 1 : footerScale;
				transformCSS(footer, 'scale', footerScale);
			}
			lazyLoad();
			
			scrollBar.style.opacity = 1;
			// 滚动条移动
			var scale = wrap.clientHeight / content.offsetHeight;
			var disY = transformCSS(content, 'translateY') * scale;
			transformCSS(scrollBar, 'translateY', -disY);
		},
		/*
		 * 真正的 touchEnd 时调用
		 * 手指离开时，判断 footer 区域是否全部显示，如果全部显示了，则调用 createLi() 方法，创建新的 li。
		 */
		over: function () {
			var minH = content.offsetHeight - wrap.clientHeight;
			if(isBottom &&　Math.abs(transformCSS(content, 'translateY')) - minH >= footer.offsetHeight){
				clearInterval(wrap.timer);
				createLi();
				isBottom = false;
			}
		},
		end: function () {
			scrollBar.style.opacity = 0;
		}
	}
	vDrag(wrap, callback);
}