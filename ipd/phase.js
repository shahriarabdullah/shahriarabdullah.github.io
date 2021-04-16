//Canvas context
var canvas = document.getElementById('can_phase_diagram'); //Phase Diagram
var ctx = canvas.getContext('2d');
var canvas_drawing=document.getElementById('can_drawing');
var ctxDraw=can_drawing.getContext('2d');

var can_ms=document.getElementById('can_ms'); //Microstructure
var can_ms_top=document.getElementById('can_ms_top');
var ctx_ms=can_ms.getContext('2d');
var ctx_ms_top=can_ms_top.getContext('2d');


//Global
var scale=0;
var left_margin=0;
var ms_loaded=0;

//Loading image onto canvas
var image = new Image();
image.onload = function () {
    ctx.drawImage(image, 0, 0);
  
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    
}

image.crossOrigin = "Anonymous";
//image.src="https://i.ibb.co/HtVvzgZ/pbsn.png";
image.src="https://i.ibb.co/jDkBFys/pbsn-new.png";

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
    "206,49,108":"Pb+Liq.",
    "159,233,37":"Liq.+Sn",
    "163,73,164":"Pb+Sn",
    "200,191,231":"Pb",
    "218,156,180":"Sn",
    "153,217,234":"Liq."
};

var lamella=["163,73,164"];

var two_phasez=["206,49,108","159,233,37","163,73,164"];
var single_phasez=["200,191,231","218,156,180","153,217,234"];


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

    console.log("The pixel at "+ mousePos_msg + " is "+rgb);

    ctxDraw.clearRect(0,0,can_drawing.width,can_drawing.height); //Clearing top canvas before drawing

    //Marking clicked location

    point_circle(ctxDraw,mousePos.x,mousePos.y,3,"#FFFFFF","white");

    ctxDraw.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
    ctxDraw.beginPath(); //Drawing verical line
	ctxDraw.moveTo(mousePos.x, 0);
	ctxDraw.lineTo(mousePos.x, can_drawing.height);
	ctxDraw.stroke(); 

	ctxDraw.setLineDash([5, 3]);
	ctxDraw.beginPath(); //Drawing horizontal line
	ctxDraw.moveTo(0, mousePos.y);
	ctxDraw.lineTo(can_drawing.width, mousePos.y);
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

		document.getElementById("phase_name").innerHTML="Phase: <b>"+phases[str_rgb]+"</b>";

		if(lamella.includes(str_rgb)){ //Checking if phase has eutectic lamella
			ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
			if(ms_loaded==0){ //Loading lamella image
			ms_image.src="https://i.ibb.co/bdP6mXG/rsz-lamella.png";
		}
		} else{ //Two phase but not eutectic
			//Draw two phase microstructure here

		}

		if(scale==0){
			scaling();
		}

		while(str_rgb!="0,0,0"){ //Finding left phase boundary
			nx=nx-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}

		point_circle(ctxDraw,nx,ny,3,"#FFFFFF","white"); //Marking left boundary
		left_boundary=nx;

		l=(mousePos.x-nx)*scale;
		

		str_rgb=""; //Flashing str_rgb
		nx=mousePos.x; //Resetting nx

		while(str_rgb!="0,0,0"){ //Finding right phase boundary
			nx=nx+1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}

		point_circle(ctxDraw,nx,ny,3,"#FFFFFF","white"); //Marking right boundary
		right_boundary=nx;

		r=(nx-mousePos.x)*scale;

		

		left_boundary=(left_boundary-left_margin)*scale;
		right_boundary=(right_boundary-left_margin)*scale;

		left_phase_frac=r*100/(right_boundary-left_boundary);
		right_phase_frac=l*100/(right_boundary-left_boundary);

		console.log("Left phase composition: "+left_boundary.toFixed(2));
		console.log("Right phase composition: "+right_boundary.toFixed(2));

		console.log("Left phase fraction: "+left_phase_frac.toFixed(2)+"%");
		console.log("Right phase fraction: "+right_phase_frac.toFixed(2)+"%");

		document.getElementById("phase_frac").innerHTML = "Left phase is <b>"+left_phase_frac.toFixed(2)+"%</b> and Right phase is <b>"+right_phase_frac.toFixed(2)+"%</b>";
		document.getElementById("phase_comp").innerHTML = "Left phase composition <b>"+left_boundary.toFixed(2) + "</b> and Right phase composition <b>"+right_boundary.toFixed(2)+"</b>";



	} else if(single_phasez.includes(str_rgb)) { //Single phase zone
		ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
		var bgc="rgb("+str_rgb+")";
		point_circle(ctx_ms_top,200,200,200,"#000000",bgc);
		document.getElementById("phase_name").innerHTML="Phase: <b>"+phases[str_rgb]+"</b>";
		document.getElementById("phase_frac").innerHTML="Phase frction: 100%";
	}

  }, false);

function point_circle(context,x,y,rad,stroke_color,fill_color){
	context.strokeStyle=stroke_color;
	context.beginPath(); //Drawing the point circle
    context.arc(x,y,rad, 0, 2 * Math.PI, false);
    context.fillStyle = fill_color;
    context.fill();
    ctxDraw.stroke();
}

function scaling(){

	var nx=canvas.width/2;
	var ny=canvas.height/2;

	var right_margin;

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
}

