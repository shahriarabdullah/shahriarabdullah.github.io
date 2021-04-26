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
var temp_low=50,temp_high=350,scale_temp;
var ratio=1,lgd=0,lgd_start=0,lgd_end=2;

var ms_rad=can_ms_top.height/2;
var area=Math.PI*Math.pow(ms_rad,2);
var area_grain=Math.PI*Math.pow(8,2);

var d_phase, d_prcnt, d_comp, d_temp="",d_iso="",d_dof,d_p;
var comp_unit=[" wt% Sn","wt% Ni","wt% Ag"];
var comp_unit_i=0;
//Resizing the canvas
function resize_canv(){
	//var w=window.innerWidth;

	/*if(w<img_width){
		img_width=w;
	 	image_height=w*ratio;
	 	reposition_ms();
	} else {
		w=img_width;
		if(img_width+(ms_rad*2)<w){
			reposition_ms();
		}
	}*/

	reposition_ms();
	set_size(canvas,img_width,img_height);
	set_size(canvas_phasetop,img_width,img_height);
	set_size(canvas_drawing,img_width,img_height);
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
	ctx_ms.drawImage(img_ms_lamella,0,0,can_ms.height,can_ms.height);
	var imgData = ctx_ms.getImageData(0,0,can_ms.height,can_ms.height);
}


function load_image(canv,canv_ctx,img){ //Function for loading image to desired canvas
	var w=window.innerWidth;
	canv_ctx.drawImage(img,0,0,img_width,img_height); //Resizing the image to fit the canvas
	var imgData = ctx.getImageData(0, 0, canv.width, canv.height);
    //var data = imgData.data;
}

//Image loading done

var phases={
    "208,239,114":["Pb+Liq.","245,58,133","239,228,176","L",2], //[Phase,Back phase col,grain_phase,left/right,left phase]
    "200,191,231":["Liq.+Sn","245,58,133","112,146,190","R",1],
    "181,230,29":["Pb+Sn","239,228,176","112,146,190","L",1],
    "239,228,176":"Pb",
    "112,146,190":"Sn",
    "245,58,133":"Liq.",
    "243,243,69":"Cu",
    "187,202,206":"Ni",
    "188,208,49":["Cu+Ni","243,243,69","187,202,206","R",1],
    "104,242,115":"Pt",
    "203,247,100":"Ag",
    "56,112,141":"Liq.",
    "233,114,114":["Liq.+Pt","56,112,141","104,242,115","L",2],
    "248,37,74":["Pt+Ag","104,242,115","203,247,100","L",1],
    "223,123,221":["Liq.+Ag","56,112,141","203,247,100","L",2]
};

var lamella=["181,230,29"];

var two_phasez=["208,239,114","200,191,231","181,230,29","188,208,49","233,114,114","248,37,74","223,123,221"];
var single_phasez=["239,228,176","112,146,190","245,58,133","243,243,69","187,202,206","56,112,141","104,242,115","203,247,100"];
var eutectic=["0,162,232"];
var isothermal_reactions={
	"0,162,232":"Liq ⇌ Pb+Sn"
};

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

	if(mousePos.y>top_margin && mousePos.y<bottom_margin){
		d_temp=(mousePos.y-top_margin)*scale_temp;
		d_temp=temp_high-d_temp;
		d_temp=d_temp.toFixed(2);
	}

	//Checking phase type

	if (two_phasez.includes(str_rgb)){ //If two phase zone
		//console.log("Two phase");
		
		var left_boundary,right_boundary,left_phase_frac,right_phase_frac,l,r;

		var nx=mousePos.x;
		var ny=mousePos.y;
		pxl=ctx.getImageData(nx,ny,1,1).data;
		str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];

		//document.getElementById("phase_name").innerHTML="Phase: <b>"+phases[str_rgb][0]+"</b>";
		d_phase=phases[str_rgb][0];


		while(str_rgb==phase_col){ //Finding left phase boundary
			nx=nx-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}

		point_circle(ctxDraw,nx-3,ny,3,"#000000","black"); //Marking left boundary
		left_boundary=nx;

		l=(mousePos.x-nx)*scale;
		

		str_rgb=phase_col; //Resetting str_rgb
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


		if(phases[phase_col][4]==1){
			d_prcnt=phases[phases[phase_col][1]]+" = <b>"+left_phase_frac+"%</b> | "+phases[phases[phase_col][2]]+" = <b>"+right_phase_frac+"%</b>";
			d_comp=phases[phases[phase_col][1]]+" = <b>"+left_boundary + "</b> | "+phases[phases[phase_col][2]]+" = <b>"+right_boundary+"</b>";	
		} else {
			d_prcnt=phases[phases[phase_col][2]]+" = <b>"+left_phase_frac+"%</b> | "+phases[phases[phase_col][1]]+" = <b>"+right_phase_frac+"%</b>";
			d_comp=phases[phases[phase_col][2]]+" = <b>"+left_boundary + "</b> | "+phases[phases[phase_col][1]]+" = <b>"+right_boundary+"</b>";	
		}
		
		
	

		if(lamella.includes(phase_col)){ //Checking if phase has eutectic lamellae

			ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
			if(ms_loaded==0){ //Loading lamella image
			
			img_ms_lamella.src="https://i.ibb.co/NCQvnV3/lamellae-pbsn.png";
			ms_loaded=1;
		}

		microstructure(left_phase_frac,torgb(phases[phase_col][1]),"black");
		} else{ //Two phase but not eutectic
			//Draw two phase microstructure here
			
			if(phases[phase_col][3]=="L"){
				//console.log("Background phase col="+phases[phase_col][1]);
				ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
				point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,torgb("0,0,0"),torgb(phases[phase_col][1]));
				microstructure(left_phase_frac,"rgb("+phases[phase_col][2]+")");	
			} else if(phases[phase_col][3]=="R") {
				ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
				point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,torgb("0,0,0"),torgb(phases[phase_col][1]));
				microstructure(right_phase_frac,torgb(phases[phase_col][2]));
			}
			
			//ms_loaded=0;
		}
	d_p=2;
	show_data();
	//is_isothermal="No";

	} else if(single_phasez.includes(str_rgb)) { //Single phase zone
		ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
		var bgc="rgb("+str_rgb+")";
		point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,"black",bgc);
		d_phase=phases[str_rgb];
		d_prcnt="100%";
		
		d_comp=((mousePos.x-left_margin)*scale).toFixed(2);

		d_p=1;		
		show_data();
	} else if(eutectic.includes(str_rgb)){
		d_phase="Liq.+Pb+Sn";
		d_comp=((mousePos.x-left_margin)*scale).toFixed(2);
		d_iso="Eutectic | Eutectic Reaction: <b>"+isothermal_reactions[str_rgb]+"</b>";
		d_p=3;
		show_data();
		
		console.log("Eutectic Point");
		
	}
if(lgd==0){
	legend();	
}

  }, false);

function point_circle(context,x,y,rad,stroke_color,fill_color){
	context.beginPath(); //Drawing the point circle
	
	context.strokeStyle=stroke_color;
	context.arc(x,y,rad, 0, 2 * Math.PI, false);
	context.fillStyle = fill_color;
    context.fill();
    context.stroke();
  
}

function scaling(){

	var nx=canvas.width/2; //Beginning from the center of the canvas
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

	scale=100/(right_margin-left_margin); //Scale for x axis

	str_rgb="";
	nx=canvas.width/2;

	while(str_rgb!="255,255,255"){
		ny=ny-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}
		top_margin=ny;
		console.log("top margin= "+top_margin);

	str_rgb="";
	ny=canvas.height/2;

	while(str_rgb!="255,255,255"){
		ny=ny+1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
		}
		bottom_margin=ny;
		console.log("bottom margin= "+bottom_margin);
	scale_temp=(temp_high-temp_low)/(bottom_margin-top_margin);

}

function microstructure(phase_frac,grain_col,border_col){
	//ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
	if(border_col==null){
		border_col=grain_col;
	}
	

	var x,y,dist;
	var num_grain=(area*phase_frac/(area_grain*100));
	var i=1;

	for(i=1;i<=num_grain;i++){
		x=Math.random()*ms_rad*2;
		y=Math.random()*ms_rad*2;
		dist=Math.sqrt(Math.pow((x-ms_rad),2)+Math.pow((y-ms_rad),2));
		if(dist<ms_rad-8){
			point_circle(ctx_ms_top,x,y,8,border_col,grain_col);
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

	e_can_ms.style.top=img_height+10;
	e_can_ms_top.style.top=img_height+10;

	e_can_ms.style.left=0;
	e_can_ms_top.style.left=0;

}

function draw(){
	alert('hello');
}

function show_data(){
	d_dof=2-d_p+1;
	document.getElementById("phase_name").innerHTML="Phase: <b>"+d_phase+"</b>";
	document.getElementById("phase_frac").innerHTML="Phase percentage: <b>"+d_prcnt+"</b>";
	document.getElementById("phase_comp").innerHTML="Phase composition: "+"<b>"+d_comp+"</b> ("+comp_unit[comp_unit_i]+")";
	document.getElementById("isothermal").innerHTML="Isothermal point: "+d_iso;
	document.getElementById("temp").innerHTML="Temperature: <b>"+d_temp+"°C<b>"
	document.getElementById("dof").innerHTML="Degree of freedom: <b>"+d_dof+"</b> | C=2 P="+d_p;
}

function legend(){
	var y=20;
	var c,i;
	for	(i=lgd_start;i<=lgd_end;i++){
		c=torgb(single_phasez[i]);
		point_circle(ctx_ms_top,280,y+(40*(i-lgd_start)),10,c,c);
		text(ctx_ms_top,300,y+(40*(i-lgd_start))+5,phases[single_phasez[i]]);
	}

	lgd=1;
}

function text(context,x,y,txt){
	context.fillStyle="black";
	context.font = "15px Arial";
	context.fillText(txt, x, y); 
}

function set_param(selection){
	ctxPhaseTop.clearRect(0,0,img_width,img_height);
	ctxDraw.clearRect(0,0,img_width,img_height);
	ctx.clearRect(0,0,img_width,img_height);
	ctx_ms_top.clearRect(0,0,400,400);
	ctx_ms.clearRect(0,0,400,400);
	scale=0;
	lgd=0;
	if(selection=="CuNi"){
		img_top_phase.src="https://i.ibb.co/Qjg43T0/cuni-top.png";
		img_back_phase.src="https://i.ibb.co/fD5k494/cuni.png";
		temp_high=1600; temp_low=1000;
		comp_unit_i=1;
		lgd_start=3;
		lgd_end=4;
	} else if(selection=="PbSn"){
		img_top_phase.src="https://i.ibb.co/zPjP5fm/pbsn-top.png";
		img_back_phase.src="https://i.ibb.co/S35T8QQ/pbsn.png";
		temp_high=350; temp_low=50;
		comp_unit_i=0;
		lgd_start=0;
		lgd_end=2;
	} else if(selection="PtAg"){
		img_top_phase.src="https://i.ibb.co/WGhdX0T/ptag-top.png";
		img_back_phase.src="https://i.ibb.co/gj6rdp1/ptag.png";
		temp_high=2000; temp_low=400;
		comp_unit_i=2;
		lgd_start=5;
		lgd_end=7;
	}
}
