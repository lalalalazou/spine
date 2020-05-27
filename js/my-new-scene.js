var scene;
var hostUrl = "http://1.cc138001.com/"
function mySence(){
	var vdata = arguments[0];
	var width = window.innerWidth;
	var height = width/1.55;
	this.divReSize(height)
	//正投影相机
	var s = height*0.00267
	this.camera = new THREE.OrthographicCamera( width / - s, width / s, height / s, height / - s, 1, 1000 );
	this.camera.position.x =580;
	this.camera.position.y = -380;
	this.camera.position.z = 250;
	scene = new THREE.Scene();
	THREE.Cache.enabled = true;
	this.renderer = new THREE.WebGLRenderer({antialias: false,alpha:true});
	this.renderer.setPixelRatio(window.devicePixelRatio);
	this.renderer.setSize(width, height);
	document.getElementById("gameCanvas").appendChild(this.renderer.domElement);
	this.canvas = this.renderer.domElement;
	this.assetManager = {}
	this.myskeletonMesh = {}
	this.group = {}
	this.loadIsComplete = false;
	this.lastFrameTime = Date.now() / 1000;
	this.oldvdata = vdata
	var newvdata=JSON.parse(JSON.stringify(vdata))
	this.vdata = newvdata
	
	this.initplay();
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
		_this.group[index].visible = _this.vdata[index].visible
		_this.group[index].name = index
		var filename = _this.vdata[index].filename
		
		//获取动画数据
		var atlas = _this.assetManager[index].get(filename+".atlas");
		var atlasLoader = new spine.AtlasAttachmentLoader(atlas);
		var skeletonJson = new spine.SkeletonJson(atlasLoader);
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
// 删除group，释放内存
mySence.prototype.deleteGroup = function(group){
    if (!group) return;
    // 删除掉所有的模型组内的mesh
    group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
            item.geometry.dispose(); // 删除几何体
            item.material.dispose(); // 删除材质
        }
    });
}
//var skip = 3;
mySence.prototype.render = function(){
	var _this = this
	//跳帧
//	if(skip > 1){
//		skip = 1;
//		//console.log("skip1:"+skip)
//	}else{
//		skip++;
//		//console.log("skip2:"+skip)
//		requestAnimationFrame(_this.render.bind(_this));
//		return;
//	}
	var now = Date.now() / 1000;
	var delta = now - _this.lastFrameTime;
	this.lastFrameTime = now;
	var index;
	for( index in _this.vdata)
	{
		if(_this.group[index].visible)
		{
			var i;
			for( i in _this.vdata[index].child)
			{
				var thisdata = _this.vdata[index].child[i];
				if(thisdata.play && thisdata.visible)
				{
					if(thisdata.speedx)
					{
						if(!thisdata.fixed)
						{
							if(_this.myskeletonMesh[i].position.x + thisdata.speedx >= window.innerWidth*2)
							{
								_this.vdata[index].child[i].speedx = -(Math.abs(thisdata.speedx))
							}else if(_this.myskeletonMesh[i].position.x + thisdata.speedx <= 12)
							{
								_this.vdata[index].child[i].speedx = (Math.abs(thisdata.speedx))
							}
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
	}
	_this.renderer.render(scene, _this.camera);
	requestAnimationFrame(_this.render.bind(_this));
}
mySence.prototype.resize = function(){
	var w = window.innerWidth;
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
	var mtop = document.body.clientWidth*0.085;
	height -= mtop
	document.getElementById("loading").style.lineHeight =  height + "px"
}

mySence.prototype.getloadIsComplete = function(){
	return this.loadIsComplete;
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

mySence.prototype.getIsPlay= function(playname,animationame)
{
	var re = false;
	if(this.myskeletonMesh[playname])
	{
		if(this.myskeletonMesh[playname].name == animationame)
		{
			re = true;
		}
	}
	return re
	
}
mySence.prototype.setVisibleForOnePlay = function(playname,isvisible){
	var _this = this
	var index
	for( index in _this.vdata)
	{
		var i;
		for( i in _this.vdata[index].child)
		{
			//console.log(i,playname)
			if(playname == i)
			{
				_this.vdata[index].child[i].visible=isvisible
				_this.vdata[index].child[i].play = isvisible
			}
		}
	}
}
mySence.prototype.addplay = function(playname,animationame,loop){
	if(this.myskeletonMesh[playname])
	{
		
		//THREE.Cache.clear();
		
		this.myskeletonMesh[playname].state.setAnimation(0,animationame, loop);
		this.setPlayTrue(playname,true)
		this.myskeletonMesh[playname].visible = true
		this.myskeletonMesh[playname].name = animationame
		this.setVisibleForOnePlay(playname,true)
	}
}
mySence.prototype.clearTrack = function(playname,animationame,loop){
	if(this.myskeletonMesh[playname])
	{
		this.myskeletonMesh[playname].state.clearTracks();
		this.setPlayTrue(playname,true)
		this.myskeletonMesh[playname].visible = true
		this.myskeletonMesh[playname].name = animationame
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
				var speedx = Math.random()* 5+5;
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
	var speedx = this.vdata[fromSpeed].child[fromgo].speedx
	if(!speedx){speedx = 0}
	this.myskeletonMesh[changego].position.x = this.myskeletonMesh[fromgo].position.x+speedx + changex
	this.myskeletonMesh[changego].position.y = this.myskeletonMesh[fromgo].position.y + changey
	if(callback)
    {
    	if(typeof callback=='function'){
            callback();
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
	//console.log(this.group)
	if(this.group[groupname])
	{
		this.group[groupname].visible=isvisible
	}
}
mySence.prototype.setVisibleForGroups = function(groupnames,isvisible){
	var _this = this
	var i
	for( i in groupnames)
	{
		var groupname = groupnames[i]
		if(_this.group[groupname])
		{
			_this.group[groupname].visible=isvisible
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
			if(arrPlayName.indexOf(i) != -1)
			{
				var mi;
				for( mi in _this.vdata[index].child[i])
				{
					_this.vdata[index].child[i][mi] = _this.oldvdata[index].child[i][mi]
					
				}
				_this.myskeletonMesh[i].position.z =_this.oldvdata[index].child[i].z
				_this.myskeletonMesh[i].position.x =_this.oldvdata[index].child[i].x
				_this.myskeletonMesh[i].position.y =_this.oldvdata[index].child[i].y
				_this.myskeletonMesh[i].visible =_this.oldvdata[index].child[i].visible
				_this.myskeletonMesh[i].state.setAnimation(0,_this.oldvdata[index].child[i].animationame, true);
				_this.update(i);
			}
		}
	}
	//_this.renderer.dispose()
}
mySence.prototype.resetGroup = function(groupname){
	var _this = this
	var index;
	for( index in _this.vdata)
	{
		
		_this.group[index].visible=_this.vdata[index].visible
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
					_this.myskeletonMesh[i].position.z =_this.oldvdata[index].child[i].z
					_this.myskeletonMesh[i].position.x =_this.oldvdata[index].child[i].x
					_this.myskeletonMesh[i].position.y =_this.oldvdata[index].child[i].y
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
				_this.setVisibleForOnePlay(i,true)
			}
		}
	}
}