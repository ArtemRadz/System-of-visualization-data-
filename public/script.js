$(document).ready(function() {
	$('.upload-btn').on('click', function (){
      $('#upload-input').trigger("click");
      $('.progress-bar').text('0%');
      $('.progress-bar').width('0%');
    });
	function getBase64Image(img) {
	    var canvas = document.createElement("canvas");
	    canvas.width = img.width;
	    canvas.height = img.height;
	    var ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);
	    var dataURL = canvas.toDataURL("image/png");

	    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
	}
	function IScheckedTypeOfDiagram(name) {
  		var elements = document.getElementsByName(name);
  			for (var i=0; i<elements.length; i++)  {
  				if(elements[i].checked) 
  					return elements[i].value;
  			}
  		return false;
	}
	function configDiagram(typeOfDiagram, title, configSeries) {
		return {
			"type":typeOfDiagram,
			"background-color": "transparent",
			"title":{
				"text": title
			},
			plot: {
				cursor: 'hand',
				valueBox: {
					text: '%t: %v',
					fontFamily: 'Georgia',
					fontSize: 14,
					fontWeight: 'normal',
					offsetR: '25%'
				}
			},
			"series": configSeries
		}
	}
	function chartRender(configOfDiagram) {
		zingchart.render({
			id: "chartDiv",
			data: configOfDiagram,
			height: 500,
			width: '100%'
		});
	}
	function saveToLocaleStorage() {
		$('#chartDiv-menu-item-viewaspng').click();
		setTimeout(function() { 
			graphicImage = document.getElementById('chartDiv-print-png');
			document.getElementById("chartDiv-viewimage-close").click();
			imgData = getBase64Image(graphicImage);
			var imgCount = localStorage.getItem('imgCount');
			imgCount == null ? imgCount = 1 : imgCount++;
			localStorage.setItem('imgCount', imgCount);
			localStorage.setItem("imgData-" + imgCount, imgData);
		},100);	
	}
    $('.download-pdf').click(function(){
		$('#chartDiv-menu-item-downloadpdf').click();
	});
	$(".show-diagram").click(function() {
		for(var i = 1; i < localStorage.length; i++) {
			var dataImage = localStorage.getItem(localStorage.key(i)),
				img = document.createElement("img");
			img.src = "data:image/png;base64," + dataImage;
			document.body.appendChild(img);
		}
	});
	$(".remove-diagram").click(function() {
		localStorage.clear();
	});
	$('.download-svg').click(function(){
		$('#chartDiv-menu-item-downloadsvg').click();
	});
	$('.download-print').click(function(){
		$('#chartDiv-menu-item-print').click();
	});
	$('.download-png').click(function(){
		$('#chartDiv-menu-item-viewaspng').click();
		setTimeout(function() { 
			$('.download-png-hidden').attr('href', $('#chartDiv-print-png').attr('src'));
			document.getElementById("chartDiv-viewimage-close").click();
			document.getElementById("download-png-hidden-id").click();
		},100);
	});
    $('#upload-input').on('change', function(){
      	var files = $(this).get(0).files,
      	 	typeOfFile = files[0].name.split('.')[1],
      	// create a FormData object which will be sent as the data payload in the
	    // AJAX request
	    	formData = new FormData(),
	     	file = files[0],
	     	fileName = file.name,
	     	configOfDiagram = {};
	    // add the files to formData object for the data payload
	    formData.append('uploads[]', file, fileName);
	    var typeOfDiagram = IScheckedTypeOfDiagram('typeOfDiagram');
	    $('.start').click(function() {
	    	if(typeOfFile == 'txt') {
	    		$.ajax({
		        	url: '/upload',
		        	type: 'POST',
		        	data: formData,
		        	processData: false,
		        	contentType: false,
		        	success: function(data) {
		          		var configData = JSON.parse(data),
		          		 	title = configData[0].join(' '),
		          			configSeries = [],
		          			arrString = [],
		          		 	switchType = "";
		          		typeOfDiagram = IScheckedTypeOfDiagram('typeOfDiagram');
			          	if(typeOfDiagram) {
			          		if(typeOfDiagram == 'bar' || typeOfDiagram == 'hbar' || typeOfDiagram == 'pie')
			          			switchType = 'hbarOrbarOrpie';
			          		else if(typeOfDiagram == 'line' || typeOfDiagram == 'radar')
			          			switchType = 'lineOrradar'
			          		else
			          			switchType = typeOfDiagram;
			          		switch(switchType) {
			          			case 'hbarOrbarOrpie':
					          		for(var i = 1; i < configData.length; i++) {
					          			for(var j = 0; j < configData[i].length; j++) {
					          				if(i == 1) {
					          					arrString.push(configData[i][j]);
					          				} else {
						          				configSeries.push({"values": [parseInt(configData[i][j])], "text": arrString[j]});
						          			}
					          			}
					          		}
			          				break;
			          			case 'lineOrradar':
			          				for(var i = 1; i < configData.length; i++) {
			          					configSeries.push({"values": []});
			          					for(var j = 0; j < configData[i].length; j++) { 
			          						configSeries[i - 1].values.push(parseInt(configData[i][j]));
			          					}
			          				}
			          				break;
			          			case 'venn': 
			          				for(var i = 1; i < configData.length; i++) {
			          					for(var j = 0; j < configData[i].length - 1; j++) { 
			          						configSeries.push({"values": [parseInt(configData[i][j])], "join": [parseInt(configData[i][j + 1])]});
			          					}
			          				}
			          				break;
			          			case 'scatter':
			          				configSeries.push({"values" : []});
			          				for(var i = 1; i < configData.length; i++) {
			          					for(var j = 0; j < configData[i].length - 1; j++) { 
			          						configSeries[0].values.push([parseInt(configData[i][j]), parseInt(configData[i][j + 1])]);
			          					}
			          				}
			          				break;
			          			case 'bubble':
			          				configSeries.push({"values" : []});
			          				for(var i = 1; i < configData.length; i++) {
			          					for(var j = 0; j < configData[i].length - 2; j++) {
			          						configSeries[0].values.push([parseInt(configData[i][j]), parseInt(configData[i][j + 1]), parseInt(configData[i][j + 2])]);
			          					}
			          				}
			          				break;
			          		}
			          	configOfDiagram = configDiagram(typeOfDiagram, title, configSeries);
			          	chartRender(configOfDiagram);
						saveToLocaleStorage();
			          	}
		        	},
		        	xhr: function() {
			           	// create an XMLHttpRequest
			            var xhr = new XMLHttpRequest();

			            // listen to the 'progress' event
			            xhr.upload.addEventListener('progress', function(evt) {

			              	if (evt.lengthComputable) {
			                	// calculate the percentage of upload completed
			                	var percentComplete = evt.loaded / evt.total;
			                	percentComplete = parseInt(percentComplete * 100);

			                	// update the Bootstrap progress bar with the new percentage
			                	$('.progress-bar').text(percentComplete + '%');
			                	$('.progress-bar').width(percentComplete + '%');

			                	// once the upload reaches 100%, set the progress bar text to done
			                	if (percentComplete === 100) {
			                  		$('.progress-bar').html('Завершено');
			                	}
			              	}
			            }, false);

			            return xhr;
			        }
		        });
	    	} else if(typeOfFile == 'xlsx') {
	    		var ajaxXlxs = new XMLHttpRequest();
				ajaxXlxs.open("GET", fileName, true);
				ajaxXlxs.responseType = "arraybuffer";
				typeOfDiagram = IScheckedTypeOfDiagram('typeOfDiagram');

				ajaxXlxs.onload = function(e) {
					var arraybuffer = ajaxXlxs.response,
						/* convert data to binary string */
						data = new Uint8Array(arraybuffer),
						arr = [],
						bstr = "";
					for(var i = 0; i != data.length; ++i) {
						arr[i] = String.fromCharCode(data[i]);
					}

					bstr = arr.join("");

					/* Call XLSX */
					var workbook = XLSX.read(bstr, {type:"binary"}),
						/* DO SOMETHING WITH workbook HERE */
	    				first_sheet_name = workbook.SheetNames[0],
	    				/* Get worksheet */
	    				worksheet = workbook.Sheets[first_sheet_name],
		    			excel = XLSX.utils.sheet_to_json(worksheet,{raw:true}),
					 	config = [];
					if(typeOfDiagram) {
			          		if(typeOfDiagram == 'bar' || typeOfDiagram == 'hbar' || typeOfDiagram == 'pie')
			          			switchType = 'hbarOrbarOrpie';
			          		else if(typeOfDiagram == 'line' || typeOfDiagram == 'radar')
			          			switchType = 'lineOrradar'
			          		else
			          			switchType = typeOfDiagram;
			          		switch(switchType) {
			          			case 'hbarOrbarOrpie':
					          		for(key in excel[0]) {
					  					config.push({"values": [excel[0][key]], "text": key});
									}
									configOfDiagram = configDiagram(typeOfDiagram, typeOfDiagram, config);
			          				break;
			          			case 'lineOrradar':
			          				for(var i = 0; i < excel.length; i++) {
			          					config.push({"values": []});
			          					for(key in excel[i]) {
			          						config[i].values.push(excel[i][key]);
			          					}
			          				}
			          				configOfDiagram = configDiagram(typeOfDiagram, typeOfDiagram, config);
			          				break;
			          			case 'venn': 
			          				for(key in excel) {
					  					config.push({"values": [excel[key]['R']], "join": [excel[key]['C']]});
									}
			          				configOfDiagram = configDiagram(typeOfDiagram, typeOfDiagram, config);
			          				break;
			          			case 'scatter':
			          				config.push({"values": []});
			          				for(key in excel[0]) {
					  					config[0].values.push([parseInt(key), excel[0][key]]);
									}
									configOfDiagram = configDiagram(typeOfDiagram, typeOfDiagram, config);
			          				break;
			          			case 'bubble':
			          				config.push({"values": []});
			          				for(var i = 0; i < excel.length; i++) {
			          					config[0].values.push([]);
			          					for(key in excel[i]) {
					  						config[0].values[i].push(excel[i][key]);
										}
			          				}
									configOfDiagram = configDiagram(typeOfDiagram, typeOfDiagram, config);
			          				break;
			          		}
			          
			          	chartRender(configOfDiagram);
						saveToLocaleStorage();
			          	}
				}

				ajaxXlxs.send();
	    	} else {
	      		return false;
	    	}
	    });
    });
});
