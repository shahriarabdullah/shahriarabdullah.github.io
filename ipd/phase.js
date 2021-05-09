/*
Interactive Phase Diagram
Abdullah Shahriar
April 2021
*/


//Canvas context
var canvas = document.getElementById('can_phase_diagram'); //Phase diagram (back)
var ctx = canvas.getContext('2d');


var msi=new Image();
	msi.src="https://i.ibb.co/0jkCqQc/g2.png";

var canvas_phasetop=document.getElementById('can_phase_top'); //Phase diagram (visible)
var ctxPhaseTop=can_phase_top.getContext('2d');

var canvas_drawing=document.getElementById('can_drawing'); //Canvas for marking phase diagram
var ctxDraw=can_drawing.getContext('2d');

var can_ms=document.getElementById('can_ms'); //Eutectic lamella
var ctx_ms=can_ms.getContext('2d');

var can_ms_top=document.getElementById('can_ms_top'); //For drawing grain
var ctx_ms_top=can_ms_top.getContext('2d');


var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];
var btn = document.getElementById("myBtn");

//Global
var scale=0,left_margin=0,right_margin=0,top_margin=0,left_margin=0,ms_loaded=0;
var is_isothermal="No";
var img_width,img_height;
var temp_low=50,temp_high=350,scale_temp,rb=100,lb=0;
var ratio=1,lgd=0,lgd_start=0,lgd_end=2;

var img_load=0;

var ms_rad=can_ms_top.height/2;


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

var init_data={ //[top src, back src, temp low, temp high, comp unit, lgd start, lgd end, lb,rb]
	"CuNi":["https://i.ibb.co/Qjg43T0/cuni-top.png","https://i.ibb.co/fD5k494/cuni.png",1000,1600,1,3,4,0,100],
	"PbSn":["https://i.ibb.co/zPjP5fm/pbsn-top.png","https://i.ibb.co/HnDQ7Wf/pbsn.png",50,350,0,0,2,0,100],
	"PtAg":["https://i.ibb.co/WGhdX0T/ptag-top.png","https://i.ibb.co/gj6rdp1/ptag.png",400,2000,2,5,7,0,100],
	"Fe3C":["https://i.ibb.co/Y302RHC/fe3c-top.png","https://i.ibb.co/4VJnFqg/fe3c.png",400,1600,3,8,12,0,6.7]
};

var phases={ //[Phase,Back phase col,grain_phase,left/right,left phase]
    "208,239,114":["α (Pb)+Liq.","245,58,133","239,228,176","L",2], //Pb-Sn
    "200,191,231":["Liq.+β (Sn)","245,58,133","112,146,190","R",1],
    "181,230,29":["α (Pb)+β (Sn)","239,228,176","112,146,190","L",1],
    "239,228,176":"α (Pb)",
    "112,146,190":"β (Sn)",
    "245,58,133":"Liq.",
    "0,162,232":"Liq.+α (Pb)+β (Sn)",
    "243,243,69":"α (Cu)", //Cu-Ni
    "187,202,206":"β (Ni)",
    "188,208,49":["α (Cu)+β (Ni)","243,243,69","187,202,206","R",1],
    "104,242,115":"α (Pt)", //Pt-Ag
    "203,247,100":"β (Ag)",
    "56,112,141":"Liq.",
    "233,114,114":["Liq.+α (Pt)","56,112,141","104,242,115","L",2],
    "248,37,74":["α (Pt)+β (Ag)","104,242,115","203,247,100","L",1],
    "223,123,221":["Liq.+β (Ag)","56,112,141","203,247,100","L",2],
    "192,192,192":"α Fe (Ferrite)", //Fe-Fe3C
    "128,0,64":"γ Fe (Austenite)",
    "81,47,73":"𝛿 Fe",
    "145,117,60":"Liq.",
    "28,28,28": "Fe3C (IM)",
    "81,163,41":["γ Fe+Liq.","145,117,60","128,0,64","L",2],
    "166,143,38":["Liq+Fe<sub>3</sub>C (Cementite)","145,117,60","28,28,28","R",1],
    "21,113,123":["𝛿 Fe+γ Fe","81,47,73","128,0,64","L",1],
    "51,94,78":["𝛿 Fe+Liq.","145,117,60","81,47,73","L",1],
    "39,165,86":["γ Fe+Fe<sub>3</sub>C","128,0,64","28,28,28","R",2],
    "165,65,39":["α Fe+Fe<sub>3</sub>C","28,28,28","192,192,192","R",2],
    "89,99,185":"Liq.+γ Fe+Fe<sub>3</sub>C",
    "87,31,97":"𝛿 F+Liq.+γ Fe",
    "189,50,15":["α Fe+γ Fe","128,0,64","192,192,192","L","192,192,192"],
    "163,74,164":"α (Cu)",
    "68,170,142":"Liq. 1",
    "13,124,215":"Liq. 2",
    "68,170,70":["α (Cu) + Liq. 2","13,124,215","163,74,164","L",2],
    "181,85,57":["α+β"]
};

var lamella=["181,230,29","165,65,39"];

var two_phasez=["208,239,114","200,191,231","181,230,29","188,208,49","233,114,114","248,37,74","223,123,221","81,163,41","166,143,38","21,113,123","51,94,78","39,165,86","165,65,39","189,50,15"];
var single_phasez=["239,228,176","112,146,190","245,58,133","243,243,69","187,202,206","56,112,141","104,242,115","203,247,100","192,192,192","128,0,64","81,47,73","145,117,60","28,28,28"];
var eutectic=["0,162,232","89,99,185","92,35,35"];
var isothermal_reactions={
	"0,162,232":["Eutectic","Liq. ⇌ α (Pb)+β (Sn)",1],
	"89,99,185":["Eutectic","Liq. ⇌ γ Fe+Fe<sub>3</sub>C",1],
	"92,35,35":["Eutectoid","γ Fe ⇌ α Fe +Fe<sub>3</sub>C",1],
	"87,31,97":["Peritectic","𝛿 Fe+Liq. ⇌ γ Fe",0],
	"232,17,189":["Monotectic","Liq. 1 ⇌ Liq. 2+α",0]
};

var isotherm_lines={
	"0,0,255":"Eutectic isothermal line",
	"255,0,0":"Peritectic isothermal line",
	"62,70,147":"Eutectoid isothermal line",
	"47,54,102":"Peritectic isothermal line"
};

var lamella_src=["https://i.ibb.co/NCQvnV3/lamellae-pbsn.png","","","https://i.ibb.co/b2PrHxP/ms-new.png"];//https://i.ibb.co/fv4V31z/fe3c-ms-new.png"/*https://i.ibb.co/g7vD6Zh/fe3c-ms.png"*/];

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
	d_iso="";
	
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
		
		
	

		if(lamella.includes(phase_col)){ //Checking if phase has eutectic/eutectoid lamellae

			ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
			if(ms_loaded==0){ //Loading lamella image
			
			//img_ms_lamella.src="https://i.ibb.co/NCQvnV3/lamellae-pbsn.png";
			img_ms_lamella.src=lamella_src[comp_unit_i];
			ms_loaded=1;
		}

			//draww(ctx_ms_top,0,0);
			if(comp_unit_i==3){ //Fe3C
				if(d_alloy_comp<eutectic_comp[comp_unit_i]){
					draw_grain("rgb(192,192,192)",left_phase_frac);
				//microstructure(left_phase_frac,torgb(phases[phase_col][1]),"black");	
			} else if(d_alloy_comp>eutectic_comp[comp_unit_i]){
				//microstructure(right_phase_frac,torgb(phases[phase_col][2]),"black");	
				draw_grain("rgb(28,28,28)",right_phase_frac);
			}
			
			} else {

				if(d_alloy_comp<eutectic_comp[comp_unit_i]){
				microstructure(left_phase_frac,torgb(phases[phase_col][1]),"black");	
			} else if(d_alloy_comp>eutectic_comp[comp_unit_i]){
				microstructure(right_phase_frac,torgb(phases[phase_col][2]),"black");	
			}
			
			}


			
		
		} else { //Two phase but not eutectic
			//Draw two phase microstructure here

			if(ms_loaded==1 && comp_unit_i==3){
				ctx_ms.clearRect(0,0,200,200);
				ms_loaded=0;
			}

			ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
			point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,torgb("0,0,0"),torgb(phases[phase_col][1]));
			
			if(phases[phase_col][3]=="L"){
				//console.log("Background phase col="+phases[phase_col][1]);
				microstructure(left_phase_frac,"rgb("+phases[phase_col][2]+")"); //uncomment this	
				//nms(left_phase_frac);
				
			} else if(phases[phase_col][3]=="R") {
				
				microstructure(right_phase_frac,torgb(phases[phase_col][2])); //uncomment this
				//nms(right_phase_frac);
			}
			
			//ms_loaded=0;
		}
	d_p=2;
	
	//is_isothermal="No";

	} else if(single_phasez.includes(str_rgb)) { //Single phase zone

		if(ms_loaded==1 && comp_unit_i==3){
				ctx_ms.clearRect(0,0,200,200);
				ms_loaded=0;
			} //Clearing Fe3C ms

		ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
		var bgc="rgb("+str_rgb+")";
		point_circle(ctx_ms_top,ms_rad,ms_rad,ms_rad,"black",bgc);
		
		d_phase=phases[str_rgb];
		d_prcnt="100%";
		
		d_comp=((mousePos.x-left_margin)*scale).toFixed(2);

		d_p=1;		
		
	} else if(isothermal_reactions[str_rgb]!=undefined){

		if(ms_loaded==1 && comp_unit_i==3){
				ctx_ms.clearRect(0,0,200,200);
				ms_loaded=0;
			}

		d_phase=phases[str_rgb];
		d_comp=((mousePos.x-left_margin)*scale).toFixed(2);
		d_iso="<b>"+isothermal_reactions[str_rgb][0]+"</b> | " + isothermal_reactions[str_rgb][0] + " reaction: <b>"+isothermal_reactions[str_rgb][1]+"</b>";
		//"Eutectic | Eutectic Reaction: <b>"+isothermal_reactions[str_rgb]+"</b>";
		d_p=3;
		
		ctx_ms_top.clearRect(0,0,can_ms_top.width/2,can_ms_top.height);
		if(isothermal_reactions[str_rgb][2]==1){ //Checking if phase has lamella
			if(ms_loaded==0){ //Loading lamella image
			img_ms_lamella.src=lamella_src[comp_unit_i];
			ms_loaded=1;
			}	
		} else {
			//draw microstructure
		}
		
		console.log("Isothermal Point");
		
	
	} else { //No phase found
		
		if(ms_loaded==1 && comp_unit_i==3){
				ctx_ms.clearRect(0,0,200,200);
				ms_loaded=0;
			}

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
			//d_comm="Phase bounadry between "+phases[u][0]+" and "+phases[d][0];
			d_phase="Phase bounadry between "+phases[u][0]+" and "+phases[d][0];
			d_p=2;
		}
	}


if(lgd==0){
	legend();
}



} else { //Clicked outside diagram
	clear_data_var();
	//d_comm="Opps! No phase out there..."
	d_phase="Opps! No phase out there...";
}
show_data();
  }, false);

function point_circle(context,x,y,rad,stroke_color,fill_color){
	context.beginPath(); //Drawing the point circle
	context.lineWidth=1;
	context.strokeStyle=stroke_color;
	context.arc(x,y,rad, 0, 2 * Math.PI, false);
	context.fillStyle = fill_color;
    context.fill();
    context.stroke();
    context.closePath();
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

    var step_count=0;


	while(str_rgb!="255,255,255"){
		step_count++;
		nx=nx-1;
			pxl=ctx.getImageData(nx,ny,1,1).data;
			str_rgb=pxl[0]+","+pxl[1]+","+pxl[2];
			if(step_count>canvas.width){
				break;
			}
		}
		left_margin=nx;

	if(step_count>canvas.width/2){
			console.log("Loading image. Please try again!");
			alert("Loading image. Please try again!");
		} else {
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
		
		} //else ends


}

function microstructure(phase_frac,grain_col,border_col){
	//ctx_ms_top.clearRect(0,0,can_ms_top.width,can_ms_top.height);
	if(border_col==null){
		border_col=grain_col;
	}
	
	var area=Math.PI*Math.pow(ms_rad,2);
	//var grain_r=92*phase_frac/100;
	//console.log("grain_r="+grain_r);
	//var grain_r=92*phase_frac/100;
	
	var area_grain=(31415-201)*phase_frac/1000;
	//console.log("area grain="+area_grain);
	//var area_grain=Math.PI*Math.pow(grain_r,2);
	var grain_r=Math.sqrt(area_grain/Math.PI)
	var x,y,dist;
	//var num_grain=(area*phase_frac/(area_grain*100));
	//var num_grain=area/area_grain;
	var i=1;

	//drawShape(ctx_ms_top,0,0,"black");

	for(i=1;i<=10;){
		x=Math.random()*ms_rad*2;
		y=Math.random()*ms_rad*2;
		dist=Math.sqrt(Math.pow((x-ms_rad),2)+Math.pow((y-ms_rad),2));
		if(dist<ms_rad-grain_r/*8*/){
			point_circle(ctx_ms_top,x,y,/*8*/grain_r,border_col,grain_col);
			i++;
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
	document.getElementById("isothermal").innerHTML="Invariant point: "+d_iso;
	document.getElementById("temp").innerHTML="Temperature: <b>"+d_temp+"°C<b>"
	document.getElementById("dof").innerHTML="Degree of freedom: <b>"+d_dof+"</b> | C=2 P="+d_p;
	//document.getElementById("comments").innerHTML="Comment: <b>"+d_comm+"</b>";
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
	ms_loaded=0;
	clear_data();
	var dat=init_data[selection];
	img_top_phase.src=dat[0];
	img_back_phase.src=dat[1];
	temp_low=dat[2];
	temp_high=dat[3];
	comp_unit_i=dat[4];
	lgd_start=dat[5];
	lgd_end=dat[6];
	lb=dat[7];
	rb=dat[8];
}


//https://i.ibb.co/g7vD6Zh/fe3c-ms.png

function new_microstructure(ff) {
	
	var area_new=31415*ff/300;
	var del=area_new-395;
	var x=(Math.sqrt(Math.abs(529-1.27*del))-23)/2;
	console.log("x="+x);
	ctx_ms_top.clearRect(0,0,200,200);
	ctx_ms_top.arc(100,100,100,0,2*Math.PI);
	ctx_ms_top.stroke();
	draw_ellipse(ctx_ms_top,70,100,0.67,9+x,14+x);
	draw_ellipse(ctx_ms_top,100,130,0.33,9+x,14+x);
	draw_ellipse(ctx_ms_top,130,70,0,9+x,14+x);

}

function draw_ellipse(cxt,centerX,centerY,rot,radx,rady) {
	cxt.beginPath();
for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01 ) {
    xPos = centerX - (radx * Math.sin(i)) * Math.sin(rot * Math.PI) + (rady * Math.cos(i)) * Math.cos(rot * Math.PI);
    yPos = centerY + (rady * Math.cos(i)) * Math.sin(rot * Math.PI) + (radx * Math.sin(i)) * Math.cos(rot * Math.PI);

    if (i == 0) {
        cxt.moveTo(xPos, yPos);
    } else {
        cxt.lineTo(xPos, yPos);
    }
}
cxt.lineWidth = 2;
cxt.strokeStyle = "#232323";
cxt.stroke();
cxt.closePath();
}

function draw_grain(x,ff){
	/*ctx_ms_top.beginPath();
	ctx_ms_top.rect(0, 0, 200, 200);
	ctx_ms_top.stroke();
*/
//console.log("called");
	
	ctx_ms_top.lineWidth=0.5*ff;
	
	ctx_ms_top.strokeStyle=x;
	ctx_ms_top.beginPath();
	//console.log(ctx_ms_top.fillStyle);
	ctx_ms_top.moveTo(0, 80);
	ctx_ms_top.lineTo(50, 100);
	ctx_ms_top.lineTo(80, 120);
	ctx_ms_top.lineTo(70, 200);
	ctx_ms_top.moveTo(50, 100);
	ctx_ms_top.lineTo(100, 100);
	ctx_ms_top.lineTo(110, 50);
	ctx_ms_top.lineTo(100, 0);
	ctx_ms_top.moveTo(110, 50);
	ctx_ms_top.lineTo(150, 60);
	ctx_ms_top.lineTo(200, 30);
	ctx_ms_top.moveTo(100, 100);
	ctx_ms_top.lineTo(110, 115);
	ctx_ms_top.lineTo(200, 110);
	ctx_ms_top.moveTo(110, 115);
	ctx_ms_top.lineTo(120, 200);
	ctx_ms_top.stroke();
	ctx_ms_top.clearRect(200,0,20,200); 
}

function ap(){
//https://i.ibb.co/9ZF9MmP/g1.png
var iimg=new Image();
iimg.src="https://i.ibb.co/9ZF9MmP/g1.png";
ctx_ms_top.drawImage(iimg, 0, 0, iimg.width,    iimg.height,     // source rectangle
                   100, 100, iimg.width/2, iimg.height/2); // destination rectangle

}


btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}


function nms(pf){
	var m=Math.sqrt(pf/4)/5;
	
	var w=msi.width*m;
	var h=msi.height*m;
	ctx_ms_top.drawImage(msi, 0, 0, msi.width,    msi.height,     // source rectangle
                   60, 0, w, h); // destination rectangle
	ctx_ms_top.drawImage(msi, 0, 0, msi.width,    msi.height,     // source rectangle
                   2, 55,  w, h); // destination rectangle
	ctx_ms_top.drawImage(msi, 0, 0, msi.width,    msi.height,     // source rectangle
                   60, 110, w,h); // destination rectangle
	ctx_ms_top.drawImage(msi, 0, 0, msi.width,    msi.height,     // source rectangle
                   110, 64,  w, h); // destination rectangle
}
