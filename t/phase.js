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
var temp_low=50,temp_high=350,scale_temp,rb=100,lb=0;
var ratio=1,lgd=0,lgd_start=0,lgd_end=2;

var img_load=0;

var ms_rad=can_ms_top.height/2;
var area=Math.PI*Math.pow(ms_rad,2);
var area_grain=Math.PI*Math.pow(8,2);

var d_phase, d_prcnt, d_comp, d_temp="",d_iso="",d_dof,d_p,d_alloy_comp,d_comm;
var comp_unit=[" wt% Sn","wt% Ni","wt% Ag","wt% C"];
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
//img_back_phase.src="https://i.ibb.co/S35T8QQ/pbsn.png";
img_back_phase.src="https://i.ibb.co/HnDQ7Wf/pbsn.png";

img_ms_lamella.onload=function(){ //Microstructure lamella
	ctx_ms.drawImage(img_ms_lamella,0,0,can_ms.height,can_ms.height);
	var imgData = ctx_ms.getImageData(0,0,can_ms.height,can_ms.height);
}


function load_image(canv,canv_ctx,img){ //Function for loading image to desired canvas
	var w=window.innerWidth;
	canv_ctx.drawImage(img,0,0,img_width,img_height); //Resizing the image to fit the canvas
	var imgData = ctx.getImageData(0, 0, canv.width, canv.height);
	img_load=img_load+1;
    //var data = imgData.data;
}

//Image loading done

var phases={
    "208,239,114":["α (Pb)+Liq.","245,58,133","239,228,176","L",2], //[Phase,Back phase col,grain_phase,left/right,left phase]
    "200,191,231":["Liq.+β (Sn)","245,58,133","112,146,190","R",1],
    "181,230,29":["α (Pb)+β (Sn)","239,228,176","112,146,190","L",1],
    "239,228,176":"α (Pb)",
    "112,146,190":"β (Sn)",
    "245,58,133":"Liq.",
    "243,243,69":"α (Cu)",
    "187,202,206":"β (Ni)",
    "188,208,49":["α (Cu)+β (Ni)","243,243,69","187,202,206","R",1],
    "104,242,115":"α (Pt)",
    "203,247,100":"β (Ag)",
    "56,112,141":"Liq.",
    "233,114,114":["Liq.+α (Pt)","56,112,141","104,242,115","L",2],
    "248,37,74":["α (Pt)+β (Ag)","104,242,115","203,247,100","L",1],
    "223,123,221":["Liq.+β (Ag)","56,112,141","203,247,100","L",2],
    "0,162,232":"Liq.+α (Pb)+β (Sn)",
    "28,28,28": "α Fe (Ferrite)",
    "128,0,64":"γ Fe (Austenite)",
    "81,47,73":"𝛿 Fe",
    "145,117,60":"Liq.",
    "192,192,192":"Fe3C (IM)",
    "81,163,41":["γ Fe+Liq.","145,117,60","128,0,64","L",2],
    "166,143,38":["Liq+Fe<sub>3</sub>C (Cementite)","145,117,60","192,192,192","R",1],
    "21,113,123":["𝛿 Fe+γ Fe","81,47,73","128,0,64","L",1],
    "51,94,78":["𝛿 Fe+Liq.","145,117,60","81,47,73","L",1],
    "39,165,86":["γ Fe+Fe<sub>3</sub>C","128,0,64","192,192,192","R",2],
    "165,65,39":["α Fe+Fe<sub>3</sub>C","28,28,28","192,192,192","R",2]

};

var lamella=["181,230,29","165,65,39"];

var two_phasez=["208,239,114","200,191,231","181,230,29","188,208,49","233,114,114","248,37,74","223,123,221","81,163,41","166,143,38","21,113,123","51,94,78","39,165,86","165,65,39"];
var single_phasez=["239,228,176","112,146,190","245,58,133","243,243,69","187,202,206","56,112,141","104,242,115","203,247,100","28,28,28","128,0,64","81,47,73","145,117,60","192,192,192"];
var eutectic=["0,162,232","89,99,185"];
var isothermal_reactions={
	"0,162,232":"Liq ⇌ α (Pb)+β (Sn)"
};

var isotherm_lines={
	"0,0,255":"Eutectic isothermal line",
	"255,0,0":"Peritectic isothermal line",
	"62,70,147":"Eutectoid isothermal line",
	"47,54,102":"Peritectic isothermal line"
};

var lamella_src=["https://i.ibb.co/NCQvnV3/lamellae-pbsn.png","","","https://i.ibb.co/9ZGHnLT/lamellae-fe3c.png"];

var isotherm_cols=["0,0,255","255,0,0","62,70,147","47,54,102"];

var eutectic_comp=[62,0,0,0.77];

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

    //var pxl=ctx.getImageData(mousePos.x,mousePos.y,1,1).data; //Getting pixel data
    //var rgb=[pxl[0],pxl[1],pxl[2]];
    //var str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
    var str_rgb=pixel_data(mousePos.x,mousePos.y);

    var phase_col=str_rgb;


    console.log("The pixel at "+ mousePos_msg + " is "+str_rgb);

    ctxDraw.clearRect(0,0,can_drawing.width,can_drawing.height); //Clearing top canvas before drawing

    //Finding scale
    if(scale==0){
		scaling();
	}

	//Checking if clicked outside the diagram
	if(mousePos.x>left_margin && mousePos.x<right_margin && mousePos.y>top_margin && mousePos.y<bottom_margin){


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

	//Finding alloy composition

	d_alloy_comp=((mousePos.x-left_margin)*scale).toFixed(2);


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
			
			//img_ms_lamella.src="https://i.ibb.co/NCQvnV3/lamellae-pbsn.png";
			img_ms_lamella.src=lamella_src[comp_unit_i];
			ms_loaded=1;
		}

		if(d_alloy_comp<eutectic_comp[comp_unit_i]){
			microstructure(left_phase_frac,torgb(phases[phase_col][1]),"black");	
		} else if(d_alloy_comp>eutectic_comp[comp_unit_i]){
			microstructure(right_phase_frac,torgb(phases[phase_col][2]),"black");	
		}
		
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
	
	//is_isothermal="No";

	} else if(single_phasez.includes(str_rgb)) { //Single phase zone
		ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
		var bgc="rgb("+str_rgb+")";
		point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,"black",bgc);
		d_phase=phases[str_rgb];
		d_prcnt="100%";
		
		d_comp=((mousePos.x-left_margin)*scale).toFixed(2);

		d_p=1;		
		
	} else if(eutectic.includes(str_rgb)){
		d_phase=phases[str_rgb];
		d_comp=((mousePos.x-left_margin)*scale).toFixed(2);
		d_iso="Eutectic | Eutectic Reaction: <b>"+isothermal_reactions[str_rgb]+"</b>";
		d_p=3;
		
		ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
		if(ms_loaded==0){ //Loading lamella image
			
			img_ms_lamella.src="https://i.ibb.co/NCQvnV3/lamellae-pbsn.png";
			ms_loaded=1;
		}
		console.log("Eutectic Point");
		
	
	} else { //No phase found
		
		clear_data_var();
		if(isotherm_cols.includes(str_rgb)){ //Clicked on isothermal line
			d_phase=isotherm_lines[str_rgb];
			
			var u=pixel_data(mousePos.x,mousePos.y-5);
			var d=pixel_data(mousePos.x,mousePos.y+5);
		} else { //Checking if clicked on other phase boundary
			var u=pixel_data(mousePos.x+20,mousePos.y);
			var d=pixel_data(mousePos.x-20,mousePos.y);
		}
		if(phases[d]!=undefined && phases[u]!=undefined){
			d_comm="Phase bounadry between "+phases[u][0]+" and "+phases[d][0];
			d_p=2;
		}
	}


if(lgd==0){
	legend();	
}



} else { //Clicked outside diagram
	clear_data_var();
	d_comm="Opps! No phase out there..."
}
show_data();
  }, false);

function point_circle(context,x,y,rad,stroke_color,fill_color){
	context.beginPath(); //Drawing the point circle
	
	context.strokeStyle=stroke_color;
	context.arc(x,y,rad, 0, 2 * Math.PI, false);
	context.fillStyle = fill_color;
    context.fill();
    context.stroke();
  
}

function pixel_data(x,y){
	var pxl=ctx.getImageData(x,y,1,1).data; //Getting pixel data
    //var rgb=[pxl[0],pxl[1],pxl[2]];
    var str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
    return str_rgb;

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

	scale=(rb-lb)/(right_margin-left_margin); //Scale for x axis

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

	e_can_ms.style.top=img_height+25;
	e_can_ms_top.style.top=img_height+25;

	e_can_ms.style.left=0;
	e_can_ms_top.style.left=0;

}

function draw(){
	alert('hello');
}

function clear_data_var(s){

	d_iso="";
	d_comm="";
	d_prcnt="";
	d_dof="";
	d_phase="";
	if(s!=null){
		d_alloy_comp="";
		d_temp="";	
	}
	
	
}

function show_data(){
	d_dof=2-d_p+1;
	document.getElementById("alloy_comp").innerHTML="Alloy composition: <b>"+d_alloy_comp+" "+comp_unit[comp_unit_i]+"</b>";
	document.getElementById("phase_name").innerHTML="Phase: <b>"+d_phase+"</b>";
	document.getElementById("phase_frac").innerHTML="Phase percentage: <b>"+d_prcnt+"</b>";
	document.getElementById("phase_comp").innerHTML="Phase composition: "+"<b>"+d_comp+"</b> ("+comp_unit[comp_unit_i]+")";
	document.getElementById("isothermal").innerHTML="Isothermal point: <b>"+d_iso+"</b>";
	document.getElementById("temp").innerHTML="Temperature: <b>"+d_temp+"°C<b>"
	document.getElementById("dof").innerHTML="Degree of freedom: <b>"+d_dof+"</b> | C=2 P="+d_p;
	document.getElementById("comments").innerHTML="Comment: <b>"+d_comm+"</b>";
}

function clear_data(){
	document.getElementById("phase_name").innerHTML="Phase:";
	document.getElementById("phase_frac").innerHTML="Phase percentage:";
	document.getElementById("phase_comp").innerHTML="Phase composition:";
	document.getElementById("isothermal").innerHTML="Isothermal point:";
	document.getElementById("temp").innerHTML="Temperature:";
	document.getElementById("dof").innerHTML="Degree of freedom:";
	document.getElementById("alloy_comp").innerHTML="Alloy composition:";
}


function legend(){
	var y=20;
	var c,i;
	for	(i=lgd_start;i<=lgd_end;i++){
		c=torgb(single_phasez[i]);
		point_circle(ctx_ms_top,270,y+(40*(i-lgd_start)),10,c,c);
		text(ctx_ms_top,290,y+(40*(i-lgd_start))+5,phases[single_phasez[i]]);
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
	img_load=0;
	rb=100;
	lb=0;
	clear_data();
	if(selection=="CuNi"){
		img_top_phase.src="https://i.ibb.co/Qjg43T0/cuni-top.png";
		img_back_phase.src="https://i.ibb.co/fD5k494/cuni.png";
		temp_high=1600; temp_low=1000;
		comp_unit_i=1;
		lgd_start=3;
		lgd_end=4;
	} else if(selection=="PbSn"){
		img_top_phase.src="https://i.ibb.co/zPjP5fm/pbsn-top.png";
		//img_back_phase.src="https://i.ibb.co/S35T8QQ/pbsn.png";
		img_back_phase.src="https://i.ibb.co/HnDQ7Wf/pbsn.png";
		temp_high=350; temp_low=50;
		comp_unit_i=0;
		lgd_start=0;
		lgd_end=2;
	} else if(selection=="PtAg"){
		img_top_phase.src="https://i.ibb.co/WGhdX0T/ptag-top.png";
		img_back_phase.src="https://i.ibb.co/gj6rdp1/ptag.png";
		temp_high=2000; temp_low=400;
		comp_unit_i=2;
		lgd_start=5;
		lgd_end=7;
	} else if(selection=="Fe3C"){
		img_top_phase.src="https://i.ibb.co/Y302RHC/fe3c-top.png";
		img_back_phase.src="https://i.ibb.co/Xbn7JbX/fe3c.png";
		temp_low=400; temp_high=1600;
		comp_unit_i=3;
		rb=6.7; lb=0;
		lgd_start=8; lgd_end=12;
	}
}
