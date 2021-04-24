//Canvas context
var canvas = document.getElementById('can_phase_diagram'); //Phase diagram (back)
var ctx = canvas.getContext('2d');

var canvas_phasetop=document.getElementById('can_phase_top'); //Phase diagram (visible)
var ctxPhaseTop=can_phase_top.getContext('2d');

var canvas_drawing=document.getElementById('can_drawing'); //Canvas for marking phase diagram
var ctxDraw=can_drawing.getContext('2d');

var can_ms=document.getElementById('can_ms'); //Eutectic lamella
var ctx_ms=can_ms.getContext('2d');

var can_ms_top=document.getElementById('can_ms_top'); //For drawing grain
var ctx_ms_top=can_ms_top.getContext('2d');


//Global
var scale=0,left_margin=0,right_margin=0,top_margin=0,left_margin=0,ms_loaded=0;
var is_isothermal="No";
var img_width,img_height;
var ratio=1;

var ms_rad=can_ms_top.width/2;

//Resizing the canvas
function resize_canv(){
	var w=window.innerWidth;

	if(w<img_width){
		img_width=w;
	 	image_height=w*ratio;
	 	reposition_ms();
	} else {
		w=img_width;
		if(img_width+(ms_rad*2)<w){
			reposition_ms();
		}
	}

	set_size(canvas,w,img_height);
	set_size(canvas_phasetop,w,img_height);
	set_size(canvas_drawing,w,img_height);
}

//Loading image
var img_back_phase=new Image();
var img_top_phase=new Image();
var img_ms_lamella =new Image();

img_back_phase.crossOrigin = "Anonymous";
img_top_phase.crossOrigin = "Anonymous";
img_ms_lamella.crossOrigin = "Anonymous";


img_top_phase.onload=function(){ //Loading top image
	img_width=img_top_phase.width;
	img_height=img_top_phase.height;
	ratio=img_height/img_width;
	
	resize_canv();
	
	load_image(canvas_phasetop,ctxPhaseTop,img_top_phase);
}
img_top_phase.src="https://i.ibb.co/zPjP5fm/pbsn-top.png";

img_back_phase.onload=function(){ //Loading background image
	load_image(canvas,ctx,img_back_phase);
}
img_back_phase.src="https://i.ibb.co/S35T8QQ/pbsn.png";

img_ms_lamella.onload=function(){ //Microstructure lamella
	load_image(can_ms,ctx_ms,img_ms_lamella);
}


function load_image(canv,canv_ctx,img){ //Function for loading image to desired canvas
	var w=window.innerWidth;
	canv_ctx.drawImage(img,0,0,img_width,img_height); //Resizing the image to fit the canvas
	var imgData = ctx.getImageData(0, 0, canv.width, canv.height);
    var data = imgData.data;
}

//Image loading done

var phases={
    "208,239,114":["Pb+Liq.","245,58,133","239,228,176","L"], //[Phase,Back phase col,grain_phase,left/right]
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

		document.getElementById("phase_frac").innerHTML = "Phase percentage : "+phases[phases[phase_col][1]]+" = <b>"+left_phase_frac+"%</b> | "+phases[phases[phase_col][2]]+" = <b>"+right_phase_frac+"%</b>";
		document.getElementById("phase_comp").innerHTML = "Phase composition: "+phases[phases[phase_col][1]]+" = <b>"+left_boundary + "</b> | "+phases[phases[phase_col][2]]+" = <b>"+right_boundary+"</b>";

		if(lamella.includes(phase_col)){ //Checking if phase has eutectic lamella

			ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
			if(ms_loaded==0){ //Loading lamella image
			img_ms_lamella.src="https://i.ibb.co/bdP6mXG/rsz-lamella.png";
			ms_loaded=1;
		}
		microstructure(left_phase_frac);
		} else{ //Two phase but not eutectic
			//Draw two phase microstructure here
			//console.log(phases[str_rgb]);
			//console.log("str rgb="+phase_col);
			if(phases[phase_col][3]=="L"){
				//console.log("Background phase col="+phases[phase_col][1]);
				ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
				point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,torgb("0,0,0"),torgb(phases[phase_col][1]));
				microstructure(left_phase_frac,"rgb("+phases[phase_col][2]+")");	
			} else if(phases[phase_col][3]=="R") {
				ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
				point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,torgb("0,0,0"),torgb(phases[phase_col][1]));
				microstructure(right_phase_frac,torgb(phases[phase_col][2]));
			}
			
			//ms_loaded=0;
		}
		
	is_isothermal="No";

	} else if(single_phasez.includes(str_rgb)) { //Single phase zone
		ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
		var bgc="rgb("+str_rgb+")";
		point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,"black",bgc);
		document.getElementById("phase_name").innerHTML="Phase: <b>"+phases[str_rgb]+"</b>";
		document.getElementById("phase_frac").innerHTML="Phase percentage: <b>100%</b>";
		var pc=((mousePos.x-left_margin)*scale).toFixed(2);
		document.getElementById("phase_comp").innerHTML="Phase composition: "+"<b>"+pc+"</b>";
		is_isothermal="No";
	} else if(eutectic.includes(str_rgb)){
		is_isothermal="Eutectic";
		console.log("Eutectic Point");
		document.getElementById("isothermal").innerHTML="Isothermal point: "+is_isothermal;
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
		x=Math.random()*ms_rad*2;
		y=Math.random()*ms_rad*2;
		dist=Math.sqrt(Math.pow((x-ms_rad),2)+Math.pow((y-ms_rad),2));
		if(dist<ms_rad-8){
			point_circle(ctx_ms_top,x,y,8,grain_col,grain_col);
		}

	}

	

}

function torgb(code){
	return "rgb("+code+")";
}

function set_size(canv,w,h){
	canv.width=w;
	canv.height=h;
}

function reposition_ms(){
	var e_can_ms,e_can_ms_top;

	e_can_ms=document.getElementById('can_ms');
	e_can_ms_top=document.getElementById('can_ms_top');

	e_can_ms.style.top=canvas.height;
	e_can_ms_top.style.top=canvas.height;

	e_can_ms.style.left=0;
	e_can_ms_top.style.left=0;

}
