var scene;
//var hostUrl = "http://11.cc138.com/"
//var hostUrl = "http://f1.ss99.co/"
var hostUrl = "http://1.cc138001.com/"
	function mySence(){
		var vdata = arguments[0];
		
		var _this = this
		var canshu = location.href.split('?')[1];
		if(canshu)
		{
			canshu = canshu.split("&");
			$.each(canshu,function(i,v){
				
				if(v&&(/^type=/).test(v)){
					_this.urlType = v.replace('type=', '');
				}
			})
		}
		var width = window.innerWidth;
		//height = window.innerHeight;
		var height =width/1.55;
		this.divReSize(height)
		//正投影相机
		var s = height*0.0067
		this.camera = new THREE.OrthographicCamera( width / - s, width / s, height / s, height / - s, 1, 1000 );
		this.camera.position.x =232;
		this.camera.position.y = -155;
		this.camera.position.z = 250;
		scene = new THREE.Scene();
		THREE.Cache.enabled = true;
		//this.renderer = new THREE.WebGLRenderer({antialias: true,alpha:true});
		if(this.urlType == "head")
		{
			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha:true,
				precision:"highp",
				logarithmicDepthBuffer: true
			});
			this.renderer.setClearAlpha(0.0);
		}else
		{
			this.renderer = new THREE.WebGLRenderer({
				antialias: true, // true/false表示是否开启反锯齿 
				alpha: true, // true/false 表示是否可以设置背景色透明 
				precision: 'highp', // highp/mediump/lowp 表示着色精度选择 
				premultipliedAlpha: false, // true/false 表示是否可以设置像素深度（用来度量图像的分辨率） 
				preserveDrawingBuffer: true, // true/false 表示是否保存绘图缓冲 
				maxLights: 3, // 最大灯光数 
				stencil: false, // false/true 表示是否使用模板字体或图案
				autoClear:true
			});
		}
		
		//提高了图片像素//更清晰了
		//console.log(window.devicePixelRatio)
		this.renderer.setPixelRatio(window.devicePixelRatio);
		
		this.renderer.setSize(width, height);
		document.getElementById("gameCanvas").appendChild(this.renderer.domElement);
		this.canvas = this.renderer.domElement;
		this.assetManager = {}
		this.myskeletonMesh = {}
		this.group = {}
		this.plays = {}
		this.bg = null;
		this.loadIsComplete = false;
		this.opaoche = null;
		this.winopaoche = null;
		this.win = [3,7,5,4,1,2,8,10,9];//赢得是3号跑车
		this.lastFrameTime = Date.now() / 1000;
		
		this.times = 0
		this.server_time = null // 获取的服务器时间
		this.kaijiangInfo = null // 开奖信息
		this.timmer = null
		this.oldvdata = vdata
		var newvdata=JSON.parse(JSON.stringify(vdata))
		this.vdata = newvdata
		
		this.initplay()
		
		//字体
		this.font = null;
		this.fontLoaded = false; //字体是否加载完成
		this.textload();//字体加载
		this.textGo = new THREE.Object3D();//文字组
		this.textGo.name = "textGo"
		scene.add(this.textGo);
		this.textGoChild = {}
		
		//贴图
		this.imgGo = new THREE.Object3D();//文字组
		this.imgGo.name = "imgGo"
		scene.add(this.imgGo);
		
		_this.imgArr = []
		_this.loadImgCount = 0
		this.Materials = {}
		if(arguments[1])
		{
			var imgArr = arguments[1];
			_this.imgArr = imgArr;
			var i;
			for(i in imgArr)
			{
				_this.loadingMaterial(imgArr[i].name,imgArr[i].img,function(){
					_this.loadImgCount++
					//console.log(_this.loadImgCount)
				})
			}
		}
		
	}
	mySence.prototype.loadingMaterial = function(){
		var name = arguments[0]
		var img = arguments[1]
		var callback = arguments[2]
		var _this = this;
		var loader = new THREE.TextureLoader();
		loader.load(img, function( texture ) {
			_this.Materials[name] = new THREE.MeshBasicMaterial({
		    	map:texture,
		    	transparent: true,
		    });
		    _this.Materials[name].name = name
		    
		    if(callback)
		    {
		    	if(typeof callback=='function'){
		            callback();
		        }
		    }
		})
		
	}
	mySence.prototype.addMaterial = function(Materialname,name,width,height,vec,x,y,z){
		var _this = this
		var geometry = new THREE.PlaneGeometry(width, height, 1,1);
		var bricks = [new THREE.Vector2(vec[0], vec[1]), new THREE.Vector2(vec[2], vec[3]), new THREE.Vector2(vec[4], vec[5]), new THREE.Vector2(vec[6], vec[7])];
		geometry.faceVertexUvs[0] = [];
		geometry.faceVertexUvs[0][0] = [ bricks[0], bricks[1], bricks[3] ];
		geometry.faceVertexUvs[0][1] = [ bricks[1], bricks[2], bricks[3] ];
		
	    if(_this.imgGo.getObjectByName(name)){
			_this.clearImg([name])
		} 
		var earth = new THREE.Mesh(geometry,_this.Materials[Materialname]);
	    earth.name = name;
        earth.position.x = x;
  		earth.position.y = y;
  		earth.position.z = z+1;
	    _this.imgGo.add(earth); 
	}
	//字体加载
	mySence.prototype.textload = function(){
		var _this = this
		var fontload = new THREE.FontLoader().load('../fonts/helvetiker_regular.typeface.json', function(text) {
			_this.fontLoaded = true
			_this.font = text
        })
	}
// 删除group，释放内存
mySence.prototype.deleteGroup = function(group) {
	//console.log(group);
    if (!group) return;
    // 删除掉所有的模型组内的mesh
    group.traverse(function (item) {
    	//console.log(item);
        if (item instanceof THREE.Mesh) {
        	//console.log(item);
            item.geometry.dispose(); // 删除几何体
            item.material.dispose(); // 删除材质
        }
    });
}
	mySence.prototype.addImgFromGo = function(Go,img,name,x,y,z,width,height){
		
		var _this = this;
		var loader = new THREE.TextureLoader();
		loader.load(img, function( texture ) {
		    // 作为纹理，或直接使用TextureLoader
		    var geometry = new THREE.PlaneGeometry(width, height, 1,1);
		    var meterial = new THREE.MeshBasicMaterial({
		    	map:texture,
		    	transparent: true,
		    });
		    if(Go.getObjectByName(name)){
				_this.clearImgFromGo(Go,[name])
			}
		    
		    var earth = new THREE.Mesh(geometry, meterial);
		    earth.name = name;
            earth.position.x = x;
      		earth.position.y = y;
      		earth.position.z = z;
		    Go.add(earth); 
		})

	}

//文字清空
	mySence.prototype.addImg = function(img,name,x,y,z,width,height){
		
		var _this = this;
		var loader = new THREE.TextureLoader();
		loader.load(img, function( texture ) {
		    // 作为纹理，或直接使用TextureLoader
		    var geometry = new THREE.PlaneGeometry(width, height, 1,1);
		    var meterial = new THREE.MeshBasicMaterial({
		    	map:texture,
		    	transparent: true,
		    });
		    if(_this.imgGo.getObjectByName(name)){
				_this.clearImg([name])
			}
		    
		    var earth = new THREE.Mesh(geometry, meterial);
		    earth.name = name;
            earth.position.x = x;
      		earth.position.y = y;
      		earth.position.z = z;
		    _this.imgGo.add(earth); 
		})

	}
	//文字清空
	mySence.prototype.clearImgFromGo = function(Go,imgArr){
		var i;
		for(i in imgArr)
		{
			var name = imgArr[i]
			if(Go.getObjectByName(name)){
				this.deleteGroup(Go.getObjectByName(name))
				Go.remove(Go.getObjectByName(name))
			}
		}
		
	}
	//文字清空
	mySence.prototype.clearImg = function(imgArr){
		var i;
		for(i in imgArr)
		{
			var name = imgArr[i]
			if(this.imgGo.getObjectByName(name)){
				this.deleteGroup(this.imgGo.getObjectByName(name))
				this.imgGo.remove(this.imgGo.getObjectByName(name))
			}
		}
		
	}
	//文字清空
	mySence.prototype.clearText = function(textArr){
		var i;
		for(i in textArr)
		{
			var name = textArr[i]
			if(this.textGo.getObjectByName(name)){
				this.deleteGroup(this.textGo.getObjectByName(name))
				this.textGo.remove(this.textGo.getObjectByName(name))
			}
		}
		
	}
	//场景中添加文字
	mySence.prototype.addText = function(name,t,x,y,size,color){
		
		var _this = this;
		if(this.fontLoaded)
		{
			var option = {
                size: size, //字号大小，一般为大写字母的高度
                font: _this.font, //字体，默认是'helvetiker'，需对应引用的字体文件
                height: 2, //文字的厚度
                //weight: 'normal', //值为'normal'或'bold'，表示是否加粗
                //style: 'normal', //值为'normal'或'italics'，表示是否斜体
                //bevelThickness: 1, //倒角厚度
                //bevelSize: 10, //倒角宽度
                //curveSegments: 10,//弧线分段数，使得文字的曲线更加光滑
                //bevelEnabled: true, //布尔值，是否使用倒角，意为在边缘处斜切
            }
			var gem = new THREE.TextGeometry(t,option);
            gem.center();
            
            gem.colors = [color]
            gem.colorsNeedUpdate = true
            //console.log(gem)
            //金属发亮物体
			var mat = new THREE.MeshBasicMaterial({color:color});
			
			if(_this.textGo.getObjectByName(name)){
				_this.clearText([name])
			}
            _this.textGoChild[name] = new THREE.Mesh(gem, mat);
            _this.textGoChild[name].name = name
            _this.textGoChild[name].position.x = x;
      		_this.textGoChild[name].position.y = y;
      		_this.textGoChild[name].position.z = 30;
      		//console.log(_this.myskeletonMesh[playname].skeleton.findSlot(slotName).bone)
      		//_this.myskeletonMesh[playname].skeleton.findSlot(slotName).bone.add(textObj);
            
            _this.textGo.add(_this.textGoChild[name]);
		}
	}
	//加载动画
	mySence.prototype.initplay = function(){
		var _this = this
		var i;
		for(i in _this.vdata)
		{
			var filename = _this.vdata[i].filename
			_this.assetManager[i] = new spine.threejs.AssetManager(filename+"/");
			_this.assetManager[i] = new spine.threejs.AssetManager(filename+"/");
			_this.assetManager[i].loadText(filename+".json");
			_this.assetManager[i].loadTextureAtlas(filename+".atlas");
		}
		requestAnimationFrame(_this.load.bind(_this));
		
	}
	//加载动画
	mySence.prototype.load = function(){
		var _this = this
		
		var isComplete = true
		var i;
		for(i in _this.vdata)
		{
			if (!(_this.assetManager[i].isLoadingComplete())) {
				isComplete = false
			}
		}
		if(isComplete)
		{
			//_this.times = 0
			_this.loadIsComplete = true
			_this.showdef()
			
		} else requestAnimationFrame(this.load.bind(this));
	}
	mySence.prototype.showdef = function(){
		var _this = this
		var index;
		for( index in _this.vdata)
		{
			_this.group[index] = new THREE.Object3D();
			scene.add(_this.group[index]);
			var filename = _this.vdata[index].filename
			
			//获取动画数据
			var atlas = _this.assetManager[index].get(filename+".atlas");
			var atlasLoader = new spine.AtlasAttachmentLoader(atlas);
			var skeletonJson = new spine.SkeletonJson(atlasLoader);
			skeletonJson.scale = 0.4;
			var skeletonData = skeletonJson.readSkeletonData(_this.assetManager[index].get(filename+".json"));
			//初始化动画
			var i;
			for( i in _this.vdata[index].child)
			{
				var thisdata = _this.vdata[index].child[i]
				_this.myskeletonMesh[i] = new spine.threejs.SkeletonMesh(skeletonData);
				_this.myskeletonMesh[i].position.z =thisdata.z
				_this.myskeletonMesh[i].position.x =thisdata.x
				_this.myskeletonMesh[i].position.y =thisdata.y
				
				if(thisdata.ry)
				{
					_this.myskeletonMesh[i].rotation.y = thisdata.ry
				}
				if(thisdata.scale)
				{
					_this.myskeletonMesh[i].scale.set( thisdata.scale, thisdata.scale, thisdata.scale );
				}
				_this.myskeletonMesh[i].visible = thisdata.visible
				//console.log(thisdata.id)
				var loop = false
				if(thisdata.loop)
				{
					loop = thisdata.loop
				}
				_this.myskeletonMesh[i].state.setAnimation(0, thisdata.animationame, loop);
				_this.group[index].add(_this.myskeletonMesh[i]);
				if(thisdata.qiuhao>-1)
				{
					_this.addImgFromGo(_this.myskeletonMesh[i],"img/"+thisdata.qiuhao+".png","carqiuhao"+i,-5,50,thisdata.z+11,27.5,32.5);
				}
			}
			
		}
		var t = null
		t = setTimeout(function(){
			document.getElementById("loading").style.display = "none"
			clearTimeout(t)
			t=null
		},500)
		
		requestAnimationFrame(_this.render.bind(_this));
	}
	
	mySence.prototype.render = function(){
		//console.log(playname)
		var _this = this
		var now = Date.now() / 1000;
		var delta = now - _this.lastFrameTime;
		this.lastFrameTime = now;
		// resize canvas to use full page, adjust camera/renderer
		//_this.resize();
		var index;
		for( index in _this.vdata)
		{
			var i;
			for( i in _this.vdata[index].child)
			{
				var thisdata = _this.vdata[index].child[i]
				//console.log(thisdata.play,index)
				if(thisdata.play)
				{
					//console.log(i)
					//_this.myskeletonMesh[i].clearBatches();
					
					if(thisdata.speedx)
					{
						if(!thisdata.fixed)
						{
							if(_this.myskeletonMesh[i].position.x + thisdata.speedx >= window.innerWidth-120)
							{
								_this.vdata[index].child[i].speedx = -(Math.abs(thisdata.speedx))
							}else if(_this.myskeletonMesh[i].position.x + thisdata.speedx <= 5)
							{
								_this.vdata[index].child[i].speedx = (Math.abs(thisdata.speedx))
							}
						}else
						{
							
							
						}
						var isMove = true
						if(thisdata.rightEnd){
							if(_this.myskeletonMesh[i].position.x >= thisdata.rightEnd)
							{
								isMove = false
							}
						}
						if(thisdata.leftEnd){
							if(_this.myskeletonMesh[i].position.x <= thisdata.leftEnd)
							{
								//alert(_this.myskeletonMesh[i].position.x)
								isMove = false
							}
						}
						if(isMove)
						{
							_this.myskeletonMesh[i].position.x += _this.vdata[index].child[i].speedx
						}
					}
					_this.myskeletonMesh[i].update(delta);
					
				}
			}
		}

		_this.renderer.render(scene, _this.camera);
		
		requestAnimationFrame(_this.render.bind(_this));
		_this = null
		index = null
		now = null;
		delta = null;
		//THREE.Cache.clear()
	}
	mySence.prototype.resize = function(){
		var w = window.innerWidth;
		//var h = window.innerHeight;
		var h = w/1.55;
		if (this.canvas.width != w || this.canvas.height != h) {
			this.canvas.width = w;
			this.canvas.height = h;
		}

		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(w, h);
		this.divReSize(h)
		
	}
	mySence.prototype.divReSize = function(height){
		//return
		var mtop = document.body.clientWidth*0.085;
		
//		if(this.urlType == "game")
//		{
//			document.getElementById("Animation").style.marginTop = -mtop + "px"
//		}
		height -= mtop
		document.getElementById("loading").style.lineHeight =  height + "px"
	}
	
	mySence.prototype.getloadIsComplete = function(){
		return (this.loadIsComplete && this.fontLoaded && this.loadImgCount>=this.imgArr.length);
		//return (this.loadIsComplete && this.fontLoaded);
	}
	mySence.prototype.setPlayTrue = function(playname,type){
		var _this = this
		var index;
		for( index in _this.vdata)
		{
			var i;
			for( i in _this.vdata[index].child)
			{
				if(i == playname)
				{
					_this.vdata[index].child[i].play = type
				}
			}
		}
	}
	mySence.prototype.getIsVisible= function(playname)
	{
		if(this.myskeletonMesh[playname])
		{
			return this.myskeletonMesh[playname].visible
			
		}
		
		
	}
	mySence.prototype.getIsPlay= function(playname,animationame)
	{
		var re = false;
		if(this.myskeletonMesh[playname])
		{
			//console.log(this.myskeletonMesh[playname],animationame)
			if(this.myskeletonMesh[playname].name == animationame)
			{
				re = true;
			}
		}
		return re
		
	}

	mySence.prototype.addplay = function(playname,animationame,loop){
		if(this.myskeletonMesh[playname])
		{
			
			
			this.myskeletonMesh[playname].state.setAnimation(0,animationame, loop);
			this.myskeletonMesh[playname].visible=true
			this.setPlayTrue(playname,true)
			this.myskeletonMesh[playname].name = animationame
		}
	}
	mySence.prototype.clearTrack = function(playname,animationame,loop){
		if(this.myskeletonMesh[playname])
		{
			//console.log(playname,animationame)
			this.myskeletonMesh[playname].state.clearTracks();
			this.myskeletonMesh[playname].visible=true
			this.setPlayTrue(playname,true)
			this.myskeletonMesh[playname].name = animationame
		}
	}
	mySence.prototype.addOnecePlay = function(playname,animationame,loop){
		
		var _this = this
		if(this.myskeletonMesh[playname])
		{
			this.addplay(playname,animationame,loop)
			var t = setTimeout(function(){
				_this.setPlayTrue(playname,false)
				clearTimeout(t)
			},500)
		}
	}
	
	mySence.prototype.playend = function(playname,animationame,loop){
		
		var _this = this
		
	}
	mySence.prototype.setEmptyAnimations = function(playnames){
		
		var _this = this
		
		for(var i in playnames)
		{
			var playname = playnames[i]
			//console.log(_this.myskeletonMesh[playname],playname)
			if(_this.myskeletonMesh[playname])
			{
				_this.myskeletonMesh[playname].visible=false;
				_this.setPlayTrue(playname,false)
			
			}
		}
		
	}
	mySence.prototype.setchildData = function(d){
		var _this = this
		var index;
		//console.log(d)
		for( index in _this.vdata)
		{
			var i;
			for( i in _this.vdata[index].child)
			{
				var thisdata = _this.vdata[index].child[i]
				if(i == d.name)
				{
					var di;
					for( di in d.data)
					{
						_this.vdata[index].child[i][di] = d.data[di]
						
					}
				}
			}
		}
		
	}
	mySence.prototype.changeSpeed = function(name,speed){
		var _this = this
		if(_this.vdata[name])
		{
			var i;
			for(i in _this.vdata[name].child)
			{
				if(_this.vdata[name].child[i].speedx)
				{
					
					var speedx = _this.vdata[name].child[i].speedx + speed;
					//console.log(_this.vdata[name].child[i].speedx +"："+ speed,speedx)
					_this.vdata[name].child[i].speedx = speedx
					
				}
			}
		}
	}
	
	mySence.prototype.resetSpeed = function(name){
		
		var _this = this
		if(_this.vdata[name])
		{
			var i;
			for(i in _this.vdata[name].child)
			{
				if(_this.vdata[name].child[i].speedx)
				{
					var speedx = Math.random()* 2;
					if(_this.vdata[name].child[i].jiasu)
					{
						speedx += _this.vdata[name].child[i].jiasu
					}
					_this.vdata[name].child[i].speedx = speedx
					
				}
			}
		}
	}
	mySence.prototype.resetXYFromeOther = function(changego ,fromgo,fromSpeed,changex,changey,callback){
		//console.log(this.vdata[fromSpeed].child[fromgo])
		var speedx = this.vdata[fromSpeed].child[fromgo].speedx
		if(!speedx){speedx = 0}
		this.myskeletonMesh[changego].position.x = this.myskeletonMesh[fromgo].position.x+speedx + changex
		this.myskeletonMesh[changego].position.y = this.myskeletonMesh[fromgo].position.y + changey
		if(callback)
	    {
	    	if(typeof callback=='function'){
	            callback();
	            //console.log(this.myskeletonMesh[changego].position.x,this.myskeletonMesh[fromgo].position.x,changego,fromgo)
	        }
	    }
		
	}
	mySence.prototype.resetXY = function(arrPlayName){
		var _this = this
		var index;
		for( index in _this.vdata)
		{
			var i;
			for( i in _this.vdata[index].child)
			{
				//console.log(arrPlayName)
				if(arrPlayName.indexOf(i) != -1)
				{
					var x = (Math.random()* 100) - 100;
					
					var y = (Math.random()* 100)-50;
					_this.vdata[index].child[i].x = x
					_this.vdata[index].child[i].y = y
				}
			}
		}
		
	}
	mySence.prototype.setVisibleForGroup = function(groupname,isvisible){
		var _this = this
		var index
		for( index in _this.vdata)
		{
			var gnindex
			for( gnindex in groupname)
			{
				if(index == groupname[gnindex])
				{
					var i;
					for( i in _this.vdata[index].child)
					{
						_this.myskeletonMesh[i].visible=isvisible
						_this.vdata[index].child[i].play = isvisible
					}
				}
			}
		}
	}
	mySence.prototype.update = function(name){
		var _this = this
		var now = Date.now() / 1000;
		var delta = now - this.lastFrameTime;
		_this.myskeletonMesh[name].update(delta)
		_this.renderer.render(scene, _this.camera);
	}
	mySence.prototype.resetPlays = function(arrPlayName){
		var _this = this
		var index;
		for( index in _this.vdata)
		{
			var i;
			for( i in _this.vdata[index].child)
			{
				//console.log(arrPlayName)
				if(arrPlayName.indexOf(i) != -1)
				{
					//console.log(i)
					var mi;
					for( mi in _this.vdata[index].child[i])
					{
						_this.vdata[index].child[i][mi] = _this.oldvdata[index].child[i][mi]
						
					}
					//_this.myskeletonMesh[i].state.clearTracks()
					_this.myskeletonMesh[i].position.z =_this.oldvdata[index].child[i].z
					_this.myskeletonMesh[i].position.x =_this.oldvdata[index].child[i].x
					_this.myskeletonMesh[i].position.y =_this.oldvdata[index].child[i].y
					//console.log(i,_this.oldvdata[index].child[i].visible,groupname[gnindex])
					_this.myskeletonMesh[i].visible =_this.oldvdata[index].child[i].visible
					
					_this.myskeletonMesh[i].state.setAnimation(0,_this.oldvdata[index].child[i].animationame, true);
					_this.update(i);
				}
			}
		}
		_this.renderer.dispose()
	}
	mySence.prototype.resetGroup = function(groupname){
		var _this = this
		
		
		var index;
		for( index in _this.vdata)
		{
			var gnindex;
			for( gnindex in groupname)
			{
				if(index == groupname[gnindex])
				{
					var i;
					for( i in _this.vdata[index].child)
					{
						var mi;
						for( mi in _this.vdata[index].child[i])
						{
							_this.vdata[index].child[i][mi] = _this.oldvdata[index].child[i][mi]
							
						}
						
						//_this.myskeletonMesh[i].state.clearTracks()
						_this.myskeletonMesh[i].position.z =_this.oldvdata[index].child[i].z
						_this.myskeletonMesh[i].position.x =_this.oldvdata[index].child[i].x
						_this.myskeletonMesh[i].position.y =_this.oldvdata[index].child[i].y
						//console.log(i,_this.oldvdata[index].child[i].visible,groupname[gnindex])
						_this.myskeletonMesh[i].visible =_this.oldvdata[index].child[i].visible
						
						_this.myskeletonMesh[i].state.setAnimation(0,_this.oldvdata[index].child[i].animationame, true);
						_this.update(i);
					}
				}
			}
			
		}
		
		_this.renderer.dispose()
	}
	mySence.prototype.addPlayProup = function(playname){
		var _this = this
		var index;
		for( index in _this.vdata)
		{
			if(playname == index)
			{
				var i;
				for( i in _this.vdata[index].child)
				{
					var thisdata = _this.vdata[index].child[i];
					_this.myskeletonMesh[i].state.setAnimation(0,thisdata.animationame, true);
					_this.myskeletonMesh[i].visible=true;
					_this.vdata[index].child[i].play = true;
				}
			}
		}
	}