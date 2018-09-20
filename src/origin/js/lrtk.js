var radius = 200;
var dtr = Math.PI/180;
var d=400;

var mcList = [];
var active = false;
var lasta = 1;
var lastb = 1;
var distr = true;
var tspeed=2;
var size=250;

var mouseX=0;
var mouseY=0;

var howElliptical=1;

var aA=[];
var oDiv=null;
var interval = null;

window.onload=function ()
{
	oDiv=document.getElementById('div1');

	// aA=oDiv.getElementsByTagName('a');

  oDiv.onmouseover=function ()
  {
    active=true;
  };

  oDiv.onmouseout=function ()
  {
    active=false;
  };

  oDiv.onmousemove=function (ev)
  {
    var oEvent=window.event || ev;

    mouseX=oEvent.clientX-(oDiv.offsetLeft+oDiv.offsetWidth/2);
    mouseY=oEvent.clientY-(oDiv.offsetTop+oDiv.offsetHeight/2);

    mouseX/=5;
    mouseY/=5;
  };

  $.getJSON ("./files/cay_data.json", function (datas)
  {
    refresh(datas);
  });
};

function randomsort(a, b) {
  return Math.random()>.5 ? -1 : 1;
}

function update()
{
	var a;
	var b;

	if(active)
	{
		a = (-Math.min( Math.max( -mouseY, -size ), size ) / radius ) * tspeed;
		b = (Math.min( Math.max( -mouseX, -size ), size ) / radius ) * tspeed;
	}
	else
	{
		a = lasta * 0.98;
		b = lastb * 0.98;
	}

	lasta=a;
	lastb=b;

	if(Math.abs(a)<=0.01 && Math.abs(b)<=0.01)
	{
		return;
	}

	var c=0;
	sineCosine(a,b,c);
	for(var j=0;j<mcList.length;j++)
	{
		var rx1=mcList[j].cx;
		var ry1=mcList[j].cy*ca+mcList[j].cz*(-sa);
		var rz1=mcList[j].cy*sa+mcList[j].cz*ca;

		var rx2=rx1*cb+rz1*sb;
		var ry2=ry1;
		var rz2=rx1*(-sb)+rz1*cb;

		var rx3=rx2*cc+ry2*(-sc);
		var ry3=rx2*sc+ry2*cc;
		var rz3=rz2;

		mcList[j].cx=rx3;
		mcList[j].cy=ry3;
		mcList[j].cz=rz3;

		per=d/(d+rz3);

		mcList[j].x=(howElliptical*rx3*per)-(howElliptical*2);
		mcList[j].y=ry3*per;
		mcList[j].scale=per;
		mcList[j].alpha=per;

		mcList[j].alpha=(mcList[j].alpha-0.6)*(10/6);
	}

	doPosition();
	depthSort();
}

function depthSort()
{
	var i=0;
	var aTmp=[];

	for(i=0;i<aA.length;i++)
	{
		aTmp.push(aA[i]);
	}

	aTmp.sort
	(
		function (vItem1, vItem2)
		{
			if(vItem1.cz>vItem2.cz)
			{
				return -1;
			}
			else if(vItem1.cz<vItem2.cz)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		}
	);

	for(i=0;i<aTmp.length;i++)
	{
		aTmp[i].style.zIndex=i;
	}
}

function positionAll()
{
	var phi=0;
	var theta=0;
	var max=mcList.length;
	var i=0;

	// var aTmp=[];
	// var oFragment=document.createDocumentFragment();
    //
	// //�������
	// for(i=0;i<aA.length;i++)
	// {
	// 	aTmp.push(aA[i]);
	// }
    //
	// aTmp.sort
	// (
	// 	function ()
	// 	{
	// 		return Math.random()<0.5?1:-1;
	// 	}
	// );
    //
	// for(i=0;i<aTmp.length;i++)
	// {
	// 	oFragment.appendChild(aTmp[i]);
	// }
    //
	// oDiv.appendChild(oFragment);

	for( var i=1; i<max+1; i++){
		if( distr )
		{
			phi = Math.acos(-1+(2*i-1)/max);
			theta = Math.sqrt(max*Math.PI)*phi;
		}
		else
		{
			phi = Math.random()*(Math.PI);
			theta = Math.random()*(2*Math.PI);
		}
		//����任
		mcList[i-1].cx = radius * Math.cos(theta)*Math.sin(phi);
		mcList[i-1].cy = radius * Math.sin(theta)*Math.sin(phi);
		mcList[i-1].cz = radius * Math.cos(phi);

		aA[i-1].style.left=mcList[i-1].cx+oDiv.offsetWidth/2-mcList[i-1].offsetWidth/2+'px';
		aA[i-1].style.top=mcList[i-1].cy+oDiv.offsetHeight/2-mcList[i-1].offsetHeight/2+'px';
	}
}

function doPosition()
{
	var l=oDiv.offsetWidth/2;
	var t=oDiv.offsetHeight/2;
	for(var i=0;i<mcList.length;i++)
	{
		aA[i].style.left=mcList[i].cx+l-mcList[i].offsetWidth/2+'px';
		aA[i].style.top=mcList[i].cy+t-mcList[i].offsetHeight/2+'px';

		aA[i].style.filter="alpha(opacity="+100*mcList[i].alpha+")";
		aA[i].style.opacity=mcList[i].alpha;
	}
}

function sineCosine( a, b, c)
{
	sa = Math.sin(a * dtr);
	ca = Math.cos(a * dtr);
	sb = Math.sin(b * dtr);
	cb = Math.cos(b * dtr);
	sc = Math.sin(c * dtr);
	cc = Math.cos(c * dtr);
}

function refresh(datas) {
  var newDatas = [];
  var oTag=null;
  aA.splice(0,aA.length);//清空数组
  mcList.splice(0,mcList.length);
  if(oDiv != null) {
    oDiv.innerHTML = "";
  }

  if(interval != null) {
    clearInterval(interval);
  }

  var count = datas.length;
  for(var i = 0 ; i < count ; i++) {
    var data = datas[i];
    var colors = ['#4889ff','#679dff','#84b0ff','#b2cdff'];
    var size = parseFloat(data['fontSize']);
    if(size >= 10*10000) {
      data['fontSize'] = size/1000;
      data['fontColor'] = colors[0];

      newDatas.push(data);
    }else if(size >= 800 && size < 10*10000) {
      var subSize = 0;
      if(size >= 800 && size < 2000) {
        subSize = size/40;
      }else if(size >= 2000 && size < 10000) {
        subSize = size/200;
      }else if(size >= 10000 && size < 5*10000) {
        subSize = size/500;
      }else if(size >= 5*10000 && size < 10*10000) {
        subSize = size/800;
      }
      data['fontSize'] = subSize;
      data['fontColor'] = colors[1];

      newDatas.push(data);
    }else if(size >= 400 && size < 800) {
      data['fontSize'] = size/40;
      data['fontColor'] = colors[2];
      newDatas.push(data);
    }else if(size >= 15 && size < 400) {
      data['fontSize'] = size/15;
      data['fontColor'] = colors[3];
      newDatas.push(data);
    }
  }

  newDatas.sort(randomsort);

  for(var i = 0 ; i < newDatas.length ; i++) {
    var item = newDatas[i];
    var label_var = document.createElement("a");
    label_var.style.fontSize = item['fontSize'] + 'px';
    label_var.style.color = item['fontColor'];
    label_var.textContent = item['label'];
    label_var.offsetWidth = 0;
    label_var.offsetHeight = 0;
    oDiv.appendChild(label_var);
    aA.push(label_var);
  }

  for(i=0;i<aA.length;i++)
  {
    oTag={};
    oTag.offsetWidth=aA[i].offsetWidth;
    oTag.offsetHeight=aA[i].offsetHeight;
    mcList.push(oTag);
  }

  sineCosine( 0,0,0 );

  positionAll();

  interval = setInterval(update, 30);
}
