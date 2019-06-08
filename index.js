/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var variation_temp = 0.1;	// nombre de degré qui vont varié chaque secondes
var unit; // c, f
var current_temp;
var thermostat_temp;
var action; // off, heat, cool
var usage; //on, auto

var program = new Array(8);
var current_program;
var temp_desire;
var aff_program; // on, off

var date;
var type_date; // auto, manuelle
var liste_mois = new Array("janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre");
var liste_jour = new Array("dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi");
var d_jour;
var d_heure;
var d_minute;
var d_seconde; 
var d_saison; // été, hiver

var etat_change_date; // min, heure, jour, rien
var change_min;
var change_heure;
var change_jour;

var nb_boucle;
var TEMPS_BOUCLE = 1000;
var timer;
var etat_aff; // 0 = temps , 1 = date

function changeTemp_cursor()
{
	if(current_program == -1)
	{
		var aff_val_cursor = document.getElementById("aff_val_cursor");
		var val_cursor = document.getElementById("slider_temp").value;

		if(unit == "c")
			aff_val_cursor.innerHTML = val_cursor;
		else if(unit == "f")
			aff_val_cursor.innerHTML = (val_cursor * 9/5 + 32);
		thermostat_temp = val_cursor;
	}
	else
	{
		var aff_val_cursor = document.getElementById("aff_val_cursor");
		var val_cursor = document.getElementById("slider_temp").value;

		if(unit == "c")
			aff_val_cursor.innerHTML = val_cursor;
		else if(unit == "f")
			aff_val_cursor.innerHTML = (val_cursor * 9/5 + 32);
		program[current_program][4] = val_cursor;
	}
}

function changeTemp()
{
	var aff_val_temp = document.getElementById("aff_val_temp");

	if(unit == "c")
		aff_val_temp.innerHTML = current_temp.toFixed(1);
	else if(unit == "f")
		aff_val_temp.innerHTML = (current_temp * 9/5 + 32).toFixed(1);
}

function switch_unit()
{
	var aff_unit_cursor = document.getElementById("aff_unit_cursor");
	var aff_unit_temp = document.getElementById("aff_unit_temp");

	if(unit == "c")
	{
		aff_unit_temp.innerHTML = "°F";
		aff_unit_cursor.innerHTML = "°F";
		unit = "f";
		changeTemp_cursor();
		changeTemp();
	}
	else if(unit == "f")
	{
		aff_unit_temp.innerHTML = "°C";
		aff_unit_cursor.innerHTML = "°C";
		unit = "c";
		changeTemp_cursor();
		changeTemp();
	}
}

function change_action(new_action)
{
	document.getElementById("cool").checked = false;
	document.getElementById("heat").checked = false;
	document.getElementById("off").checked = false;

	if(new_action == 'off')
		document.getElementById("off").checked = true;
	else if(new_action == 'heat')
		document.getElementById("heat").checked = true;
	else if(new_action == 'cool')
		document.getElementById("cool").checked = true;
	action = new_action;
}

function change_usage(new_usage)
{
	document.getElementById("on").checked = false;
	document.getElementById("auto").checked = false;

	if(new_usage == 'on')
	{
		document.getElementById("cool").disabled = false;
		document.getElementById("heat").disabled = false;
		document.getElementById("off").disabled = false;
		document.getElementById("case_on").style.backgroundColor = "#cdffcc";
		document.getElementById("case_auto").style.backgroundColor = "white";
		document.getElementById("on").checked = true;
	}
	else if(new_usage == 'auto')
	{
		document.getElementById("cool").disabled = true;
		document.getElementById("heat").disabled = true;
		document.getElementById("off").disabled = true;
		document.getElementById("case_auto").style.backgroundColor = "#cdffcc";
		document.getElementById("case_on").style.backgroundColor = "white";
		document.getElementById("auto").checked = true;
	}
	usage = new_usage;
}


function what_time_is_it()
{
	var current_date = new Date();
	date = new Date((current_date.getYear() + 1900), current_date.getMonth(), current_date.getDate() + change_jour, current_date.getHours() + change_heure, current_date.getMinutes() + change_min, current_date.getSeconds());
	d_seconde = date.getSeconds()
	d_heure = date.getHours();
	d_minute = date.getMinutes();
	d_jour = liste_jour[date.getDay()];

	if(d_minute < 10)
		d_minute = "0" + d_minute;
	if(d_seconde < 10)
		d_seconde = "0" + d_seconde;
	if(date.getMonth() >= 4 && date.getMonth() <= 9)
		d_saison = "été";
	else
		d_saison = "hiver";
	
	return(d_jour + " " + date.getDate() + " " + liste_mois[date.getMonth()] + " " + d_heure + ":" + d_minute + ":" + d_seconde + " CET " + (date.getYear() + 1900));
}

function refresh_timer() 
{
	temp_change_weather();
	if(etat_aff == 0)
	{
		document.getElementById("aff_val_temp").innerHTML = what_time_is_it();
		document.getElementById("aff_unit_temp").innerHTML = "";
		
		var depart_program = 0; // semaine
		if(d_jour == "samedi" || d_jour == "dimanche") //weekend
			depart_program = 4;
		var date_inf = new Date(date.getYear() + 1900, date.getMonth(), date.getDate(), program[depart_program][1], program[depart_program][2],program[depart_program][3]);
		var date_sup = new Date(date.getYear() + 1900, date.getMonth(), date.getDate(), program[depart_program+1][1], program[depart_program+1][2],program[depart_program+1][3]);
		if(date >= date_inf && date < date_sup)
			temp_desire = program[depart_program][4];
		else
		{
			date_inf = new Date(date.getYear() + 1900, date.getMonth(), date.getDate(), program[depart_program+1][1], program[depart_program+1][2],program[depart_program+1][3]);
			date_sup = new Date(date.getYear() + 1900, date.getMonth(), date.getDate(), program[depart_program+2][1], program[depart_program+2][2],program[depart_program+2][3]);
			if(date >= date_inf && date < date_sup)
				temp_desire = program[depart_program+1][4];
			else
			{
				date_inf = new Date(date.getYear() + 1900, date.getMonth(), date.getDate(), program[depart_program+2][1], program[depart_program+2][2],program[depart_program+2][3]);
				date_sup = new Date(date.getYear() + 1900, date.getMonth(), date.getDate(), program[depart_program+3][1], program[depart_program+3][2],program[depart_program+3][3]);
				if(date >= date_inf && date < date_sup)
					temp_desire = program[depart_program+2][4];
				else
					temp_desire = program[depart_program+3][4];
			}
		}
		if(aff_program == "on")
		{
			document.getElementById("slider_temp").value = temp_desire;
			changeTemp_cursor();
		}
		if(nb_boucle >= 3)
			etat_aff = 1;
	}
	else		
	{
		if(unit == "c")
		{
			document.getElementById("aff_unit_temp").innerHTML = "°C";
			document.getElementById("aff_val_temp").innerHTML = current_temp.toFixed(1);
		}
		else if(unit == "f")
		{
			document.getElementById("aff_unit_temp").innerHTML = "°F";
			document.getElementById("aff_val_temp").innerHTML = (current_temp * 9/5 + 32).toFixed(1);
		}
		if(nb_boucle >= 3)
			etat_aff = 0;
	}
	if(nb_boucle >= 3)
		nb_boucle = 0;
	else
		nb_boucle = nb_boucle + 1;
}

function arret_interval()
{
  	clearInterval(timer);
}

function reprendre_programme()
{
	clearInterval(timer);
	etat_change("rien");
	current_program = -1;
	hold_temp_action("reset");
	aff_program = "on";
	document.getElementById("slider_temp").value = thermostat_temp;
	var aff_unit_cursor = document.getElementById("aff_unit_cursor");
	var aff_unit_temp = document.getElementById("aff_unit_temp");
	if(unit == "c")
	{
		aff_unit_temp.innerHTML = "°C";
		aff_unit_cursor.innerHTML = "°C";
	}
	else if(unit == "f")
	{
		aff_unit_temp.innerHTML = "°F";
		aff_unit_cursor.innerHTML = "°F";
	}
	changeTemp_cursor();
	changeTemp();
	timer = setInterval(refresh_timer, TEMPS_BOUCLE);
}

function etat_change(action)
{
	if(action != "rien")
	{
		current_program = -1;
		arret_interval();
		if((etat_change_date == "rien" || etat_change_date == "heure" || etat_change_date == "jour") && action == "clock")
			etat_change_date = "min";
		else if(etat_change_date == "min" && action == "clock")
			etat_change_date = "heure";
		else if(action == "day")
			etat_change_date = "jour";
		document.getElementById("aff_val_temp").innerHTML = what_time_is_it();
		document.getElementById("aff_unit_temp").innerHTML = "";
	}
	else
	{
		console.log("desactivation de l'edition...");
		etat_change_date = "rien";
	}
}

function change_date(action)
{
	if(etat_change_date != "rien")
	{
		if(etat_change_date == "heure")
			change_heure = change_heure + action;
		else if(etat_change_date == "min")
			change_min = change_min + action;
		else if(etat_change_date == "jour")
			change_jour = change_jour + action;
		document.getElementById("aff_val_temp").innerHTML = what_time_is_it();
		document.getElementById("aff_unit_temp").innerHTML = "";
	}
	if(current_program != -1)
	{
		var date_prog = new Date(date.getYear(), date.getMonth(), date.getDate(), program[current_program][1], program[current_program][2],program[current_program][3] + 15 * action);
		var inf;
		var date_inf = new Date(date.getYear(), date.getMonth(), date.getDate(), 0, 0, 1);
		if(current_program == 0)
			inf = 3;
		else if(current_program == 4)
			inf = 7;
		else
		{
			inf = current_program - 1;
			date_inf = new Date(date.getYear(), date.getMonth(), date.getDate(), program[inf][1], program[inf][2],program[inf][3]);
		}
		var sup;
		var date_sup = new Date(date.getYear(), date.getMonth(), date.getDate(), 23, 59, 59);
		if(current_program == 3)
			sup = 0;
		else if(current_program == 7)
			sup = 4;
		else
		{
			sup = current_program + 1;
			date_sup = new Date(date.getYear(), date.getMonth(), date.getDate(), program[sup][1], program[sup][2],program[sup][3]);
		}
		if(date_prog < date_sup && date_prog > date_inf)
		{
			program[current_program][1] = date_prog.getHours();
			program[current_program][2] = date_prog.getMinutes();
			program[current_program][3] = date_prog.getSeconds();
		}
		else
		{
			console.log("action non autorisé : risque de conflits entre les programmes");
		}
		run_program("aff");
	}
}

function remplir_program()
{
	var i = 0;

	while(i < 8)
	{
		var prog = new Array(5);
		prog[0] = i+1;
		if(i == 0 || i == 4)
		{
			prog[1] = 7;
			prog[2] = 30;
			prog[3] = 0;
		}
		else if(i == 1 || i == 5)
		{
			prog[1] = 9;
			prog[2] = 0;
			prog[3] = 0;
		}
		else if(i == 2 || i == 6)
		{
			prog[1] = 17;
			prog[2] = 30;
			prog[3] = 0;
		}
		else
		{
			prog[1] = 22;
			prog[2] = 0;
			prog[3] = 0;
		}
		prog[4] = 21.0;
		program[i] = prog;
		i++;
	}
}

function run_program(action)
{
	arret_interval();
	if(action == "next")
		current_program = current_program + 1;
	if(current_program >= 8)
		current_program = 0;
	document.getElementById("slider_temp").value = program[current_program][4];
	var minutes = program[current_program][2];
	var secondes = program[current_program][3];
	if(minutes < 10)
		minutes = "0" + minutes;
	if(secondes < 10)
		secondes = "0" + secondes;
	document.getElementById("aff_val_temp").innerHTML = program[current_program][0]+"- "+program[current_program][1]+":"+minutes+":"+secondes;
	document.getElementById("aff_unit_temp").innerHTML = "";

	var aff_unit_cursor = document.getElementById("aff_unit_cursor");
	var aff_val_cursor = document.getElementById("aff_val_cursor");
	if(unit == "c")
	{
		aff_val_cursor.innerHTML = program[current_program][4];
		aff_unit_cursor.innerHTML = "°C";
	}
	else if(unit == "f")
	{
		aff_val_cursor.innerHTML = (program[current_program][4] * 9/5 + 32);
		aff_unit_cursor.innerHTML = "°F";
	}
}

function hold_temp_action(action)
{
	if(current_program == -1 && action == "edit")
	{
		if(aff_program == "on")
		{
			document.getElementById("hold_temp").style.backgroundColor = "#7a7a7a";
			aff_program = "off";
		}
		else
		{
			document.getElementById("hold_temp").style.backgroundColor = "#e7e7e7";
			aff_program = "on";
		}
	}
}

function temp_change_weather()
{
	if(d_saison == "été")
	{
		if(current_temp < 30)
			current_temp = current_temp + variation_temp;
	}
	else
	{
		if(current_temp > 10)
			current_temp = current_temp - variation_temp;
	}
	temp_change_system();
}

function temp_change_system()
{
	var aimed_temp;
	
	if(aff_program == "on")
		aimed_temp = temp_desire;
	else
		aimed_temp = document.getElementById("slider_temp").value;
	if(usage == "auto")
	{
		if(current_temp > aimed_temp)
		{
			change_action("cool");
			temp_do_action("cool");
		}
		else if(current_temp < aimed_temp)
		{
			change_action("heat");
			temp_do_action("heat");
		}
		else
			change_action("off");
	}
	else
	{
		if(current_temp > aimed_temp && action == "cool")
			temp_do_action("cool");
		else if(current_temp < aimed_temp && action == "heat")
			temp_do_action("heat");
	}
}

function temp_do_action(action)
{
	if(action == "heat")
			current_temp = current_temp + variation_temp * 2;
	else
			current_temp = current_temp - variation_temp * 2;
}

function main()
{
	date = new Date();
	aff_program = "on";
	temp_desire =  21.0;
	current_program = -1;
	remplir_program();
	etat_change_date = "rien"; // min, heure, jour, rien
	change_min = 0;
	change_heure = 0;
	change_jour = 0;
	nb_boucle = 0;
	timer = setInterval(refresh_timer, TEMPS_BOUCLE);
	etat_aff = 0;
	unit = "c";
	current_temp = 21.0;
	thermostat_temp = 21.0;
	document.getElementById("slider_temp").value = thermostat_temp;
	change_action('off');
	change_usage('auto');
}

window.onload = main;
