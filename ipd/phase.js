//Canvas context
var canvas = document.getElementById('can_phase_diagram'); //Phase Diagram
var ctx = canvas.getContext('2d');
var canvas_phasetop=document.getElementById('can_phase_top');
var ctxPhaseTop=can_phase_top.getContext('2d');

var canvas_drawing=document.getElementById('can_drawing');
var ctxDraw=can_drawing.getContext('2d');


var can_ms=document.getElementById('can_ms'); //Microstructure
var can_ms_top=document.getElementById('can_ms_top');
var ctx_ms=can_ms.getContext('2d');
var ctx_ms_top=can_ms_top.getContext('2d');


//Global
var scale=0;
var left_margin=0;
var right_margin=0;
var top_margin=0,left_margin=0;
var ms_loaded=0;

//Loading image onto canvas
var image = new Image();
image.onload = function () {
    ctx.drawImage(image, 0, 0);
  
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    
}

var image_top = new Image();
image_top.onload = function () {
    ctxPhaseTop.drawImage(image_top, 0, 0);
  
    var imgData = ctxPhaseTop.getImageData(0, 0, canvas_phasetop.width, canvas_phasetop.height);
    var data = imgData.data;
    
}


image_top.crossOrigin="Anonymous";
image_top.src="https://i.ibb.co/zPjP5fm/pbsn-top.png";

image.crossOrigin = "Anonymous";
image.src="https://i.ibb.co/bQJNwh0/pbsn.png";
//image.src="https://shahriarabdullah.github.io/ipd/pbsn.bmp";


//https://i.ibb.co/xqzZhXT/pbsn.png PbSn
//https://i.ibb.co/zPjP5fm/pbsn-top.png
//image.src="https://i.ibb.co/jDkBFys/pbsn-new.png";

//Draw image to microstucture canvas
var ms_image=new Image();
ms_image.onload=function(){
ctx_ms.drawImage(ms_image,0,0);
var imgData=ctx_ms.getImageData(0,0,can_ms.width,can_ms.height);
var data=imgData.data;
ms_loaded=1;
}

ms_image.crossOrigin="Anonymous";


//Image loading done

var phases={
    "208,239,114":["Pb+Liq.","245,58,133","239,228,176","L"],
    "200,191,231":["Liq.+Sn","245,58,133","112,146,190","R"],
    "181,230,29":"Pb+Sn",
    "239,228,176":"Pb",
    "112,146,190":"Sn",
    "245,58,133":"Liq."
};

var lamella=["181,230,29"];

var two_phasez=["208,239,114","200,191,231","181,230,29"];
var single_phasez=["239,228,176","112,146,190","245,58,133"];
var eutectic=["0,162,232"];



;
//Function for getting mouse position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }


//Click on canvas event
canvas_drawing.addEventListener('click', function(evt) {


    var mousePos = getMousePos(canvas_drawing, evt);
    var mousePos_msg = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;

    var pxl=ctx.getImageData(mousePos.x,mousePos.y,1,1).data; //Getting pixel data
    var rgb=[pxl[0],pxl[1],pxl[2]];
    var str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];

    var phase_col=str_rgb;


    console.log("The pixel at "+ mousePos_msg + " is "+rgb);

    ctxDraw.clearRect(0,0,can_drawing.width,can_drawing.height); //Clearing top canvas before drawing

    //Finding scale
    if(scale==0){
		scaling();
	}

    //Marking clicked location

    point_circle(ctxDraw,mousePos.x,mousePos.y,3,"#000000","black");

    ctxDraw.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
    ctxDraw.beginPath(); //Drawing verical line
	ctxDraw.moveTo(mousePos.x, top_margin);
	ctxDraw.lineTo(mousePos.x, bottom_margin);
	ctxDraw.stroke(); 

	ctxDraw.setLineDash([5, 3]);
	ctxDraw.beginPath(); //Drawing horizontal line
	ctxDraw.moveTo(left_margin, mousePos.y);
	ctxDraw.lineTo(right_margin, mousePos.y);
	ctxDraw.stroke(); 
	//Marking done

	

	//Checking phase type

	if (two_phasez.includes(str_rgb)){ //If two phase zone
		//console.log("Two phase");
		
		var left_boundary,right_boundary,left_phase_frac,right_phase_frac,l,r;

		var nx=mousePos.x;
		var ny=mousePos.y;
		pxl=ctx.getImageData(nx,ny,1,1).data;
		str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];

		document.getElementById("phase_name").innerHTML="Phase: <b>"+phases[str_rgb][0]+"</b>";


		while(str_rgb==phase_col){ //Finding left phase boundary
			nx=nx-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}

		point_circle(ctxDraw,nx-3,ny,3,"#000000","black"); //Marking left boundary
		left_boundary=nx;

		l=(mousePos.x-nx)*scale;
		

		str_rgb=phase_col; //Flashing str_rgb
		nx=mousePos.x; //Resetting nx


		while(str_rgb==phase_col){ //Finding right phase boundary
			nx=nx+1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}

		point_circle(ctxDraw,nx+3,ny,3,"#000000","black"); //Marking right boundary
		right_boundary=nx;

		r=(nx-mousePos.x)*scale;

		

		left_boundary=((left_boundary-left_margin)*scale).toFixed(2);
		right_boundary=((right_boundary-left_margin)*scale).toFixed(2);

		left_phase_frac=(r*100/(right_boundary-left_boundary)).toFixed(2);
		right_phase_frac=(l*100/(right_boundary-left_boundary)).toFixed(2);

		console.log("Left phase composition: "+left_boundary);
		console.log("Right phase composition: "+right_boundary);

		console.log("Left phase fraction: "+left_phase_frac+"%");
		console.log("Right phase fraction: "+right_phase_frac+"%");

		document.getElementById("phase_frac").innerHTML = "Left phase is <b>"+left_phase_frac+"%</b> and Right phase is <b>"+right_phase_frac+"%</b>";
		document.getElementById("phase_comp").innerHTML = "Left phase composition <b>"+left_boundary + "</b> and Right phase composition <b>"+right_boundary+"</b>";

		if(lamella.includes(phase_col)){ //Checking if phase has eutectic lamella

			ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
			if(ms_loaded==0){ //Loading lamella image
			ms_image.src="https://i.ibb.co/bdP6mXG/rsz-lamella.png";
		}
		microstructure(left_phase_frac);
		} else{ //Two phase but not eutectic
			//Draw two phase microstructure here
			//console.log(phases[str_rgb]);
			//console.log("str rgb="+phase_col);
			if(phases[phase_col][3]=="L"){
				//console.log("Background phase col="+phases[phase_col][1]);
				ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
				point_circle(ctx_ms_top,200,200,200,"rgb(0,0,0)","rgb("+phases[phase_col][1]+")");
				microstructure(left_phase_frac,"rgb("+phases[phase_col][2]+")");	
			} else if(phases[phase_col][3]=="R") {
				ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
				point_circle(ctx_ms_top,200,200,200,"rgb(0,0,0)","rgb("+phases[phase_col][1]+")");
				microstructure(right_phase_frac,"rgb("+phases[phase_col][2]+")");
			}
			
			//ms_loaded=0;
		}
		


	} else if(single_phasez.includes(str_rgb)) { //Single phase zone
		ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
		var bgc="rgb("+str_rgb+")";
		point_circle(ctx_ms_top,200,200,200,"black",bgc);
		document.getElementById("phase_name").innerHTML="Phase: <b>"+phases[str_rgb]+"</b>";
		document.getElementById("phase_frac").innerHTML="Phase frction: 100%";
	} else if(eutectic.includes(str_rgb)){
		console.log("Eutectic Point");
	}

  }, false);

function point_circle(context,x,y,rad,stroke_color,fill_color){
	context.beginPath(); //Drawing the point circle
	//context.strokeStyle="rgb("+stroke_color+")";
	context.strokeStyle=stroke_color;
	context.arc(x,y,rad, 0, 2 * Math.PI, false);
	context.fillStyle = fill_color;
    context.fill();
    context.stroke();
  
}

function scaling(){

	var nx=canvas.width/2;
	var ny=canvas.height/2;


	var pxl=ctx.getImageData(nx,ny,1,1).data; //Getting pixel data
    var str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];


	while(str_rgb!="255,255,255"){
		nx=nx-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}
		left_margin=nx;

	str_rgb="";
	nx=canvas.width/2;

	while(str_rgb!="255,255,255"){
		nx=nx+1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}
		right_margin=nx;

	scale=100/(right_margin-left_margin);

	str_rgb="";
	nx=canvas.width/2;

	while(str_rgb!="255,255,255"){
		ny=ny-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}
		top_margin=ny;

	str_rgb="";
	ny=canvas.height/2;

	while(str_rgb!="255,255,255"){
		ny=ny+1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}
		bottom_margin=ny;

}

function microstructure(phase_frac,grain_col){
	//ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);

	//console.log("bgpc="+bgpc);
	//point_circle(ctx_ms_top,200,200,200,"black",bgpc);
	//var grain_x=[];
	//var grain_y=[];
	var x,y,dist;
	var num_grain=(125663*phase_frac/(201*100));
	var i=1;

	for(i=1;i<=num_grain;i++){
		x=Math.random()*400;
		y=Math.random()*400;
		dist=Math.sqrt(Math.pow((x-200),2)+Math.pow((y-200),2));
		if(dist<192){
			point_circle(ctx_ms_top,x,y,8,grain_col,grain_col);
		}

	}

	

}

