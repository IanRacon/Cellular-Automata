function mod(n, m) {
        return ((n % m) + m) % m;
}

var arrowUpImg = new Image();
var arrowDownImg = new Image();
arrowUpImg.src = "Arrow_Up.png"
arrowDownImg.src = "Arrow_Down.png"

var STATE_UNDEFINED = -1;
var STATE_DOWN = 0;
var STATE_UP = 1;

var TOTAL_ROWS = 1;
var TOTAL_COLS = 20;

var CELL_SIZE = 60;
// pobierz canvas z html oraz kontekst
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// wymiary canvasa 
var	canvas_width = canvas.width;
var	canvas_height = canvas.height;

//holds single cell
function Cell(ctx, x, y, width, height){
	this.drawCellImg = function(img)
	{
	    console.log("drawCellImg" +  " " + this.x + " " + this.y + " " + this.width + " " + this.height);
	    ctx.drawImage(img, this.x, this.y, this.width, this.height);
	}
	this.drawWhite = function()
	{
        this.ctx.fillStyle="#FFFFFF";
        this.ctx.fillRect(this.x, this.y, this.width, this.width);
    }
	this.draw = function()
	{
	console.log("Cell draw");
	    if(this.state == STATE_UP)
        {
            console.log("arrowUpImg");
            this.drawCellImg(arrowUpImg);
        }else if(this.state == STATE_DOWN)
        {
            console.log("arrowDownImg");
            this.drawCellImg(arrowDownImg);
        }else
        {
            console.log("drawWhite");
            this.drawWhite();
        }
	}
	this.setState = function(state)
	{
	    this.state = state;
	}
	this.reverseState = function()
	{
	    if(this.state == STATE_DOWN)
	    {
	        this.state = STATE_UP;
	    }
	    else
	    {
	        this.state = STATE_DOWN;
	    }
	}
	this.state = STATE_UNDEFINED;
	this.x = x,
	this.y = y,
	this.width = width;
	this.height = height;
	this.active = false;
	this.ctx = ctx;
}

var offset = 30
//holds array of cells
function CellArray(ctx, rows, cols, cellSize){
	this.initialize = function(probability)
	{
		for(var row=0;row<rows;++row)
		{
			for(var col=0;col<cols;++col)
			{
				this.cellArray[row*cols+col] = new Cell(ctx, this.posX+col*cellSize, this.posY+row*cellSize, cellSize, cellSize);
				var rand = Math.random();
				console.log("rand" +  " " + rand + " " + "probability" + probability);
				if(rand>probability)
				{
				    console.log("setState(STATE_UP)");
					this.getCell(row, col).setState(STATE_UP);
				}
				else
				{
                    this.getCell(row, col).setState(STATE_DOWN);
                }
			}
		}
	}
	this.judge = function()
	{
	    var chosenCol = Math.round(Math.random()*cols);
	    if(this.cellArray[chosenCol] == STATE_UP && this.cellArray[chosenCol+1] == STATE_UP)
	    {
            this.getCell(1, chosenCol-1) = STATE_UP;
            this.getCell(1, chosenCol+2) = STATE_UP;
        }
        else if(this.cellArray[chosenCol] == STATE_DOWN && this.cellArray[chosenCol+1] == STATE_DOWN)
        {
            this.getCell(1, chosenCol-1) = STATE_DOWN;
            this.getCell(1, chosenCol+2) = STATE_DOWN;
        }
        else
        {
            this.getCell(1, chosenCol-1).reverseState();
            this.getCell(1, chosenCol+2).reverseState();
        }
	}
	this.draw = function()
	{
		for(var i=0;i<cols*rows;++i)
		{
			this.cellArray[i].draw();
		}
	}
	this.getUpsDensity = function()
	{
	    ups = 0;
	    total = 0;
	    for(var i=0;i<cols*rows;++i)
	    {
	        if(this.cellArray[i].state == STATE_UP)
	        {
	            ups = ups +1;
	        }
	        total = total + 1;
	    }
	    return ups/total;
	}
	this.getCell = function(row, col)
	{
		correct_row = mod(row, this.rows);
		correct_col = mod(col, this.cols);
		return this.cellArray[correct_row*this.cols+correct_col];
	}
	this.cellArray = new Array();
	this.posX = 0;
	this.posY = 0;
	this.cellSize = cellSize;
	this.cols = cols;
	this.rows = rows;
}

var steps = 0;
var paused = false;
var instances = 0;
var step = false;
var restart = false;
var data = []; var dataSeries = { type: "line" };
var dataPoints = [];
dataSeries.dataPoints = dataPoints;
function init(upDensity)
{
    console.log("Init");
	cellArray = new CellArray(ctx, TOTAL_ROWS, TOTAL_COLS, CELL_SIZE);
	cellArray.initialize(upDensity);
//	initialCellsState = cellArray.getArrayState();
	newtime = new Date().getTime();
	steps = 0;
	dataPoints = [];
	dataSeries.dataPoints = dataPoints;
}

// funkcja rysujaca i obliczajaca polozenie 
function draw(){
	if(canvas.getContext){
	    console.log("Draw");
	    //cellArray.draw();
	    //cellArray.judge();
	
		if(!paused) 
		{
			var time = new Date();
			if(Math.abs(newtime-time.getTime())>1000)
			{
				newtime = new Date().getTime();
				cellArray.draw();
				cellArray.judge();
				steps = steps + 1;
				drawChart(cellArray.getUpsDensity(), steps);	
			}	
		}
		else
		{
			if(step)
			{
				cellArray.draw();
				cellArray.live();
				steps = steps + 1;
				drawChart(cellArray.getUpsDensity(), steps);
				step = false;
			}
		}
		if(restart)
		{
			cellArray.setArrayState(initialCellsState);
			restart = false;
		}
		if(instances == 1)
			window.requestAnimationFrame(draw);
		else
			instances = instances - 1;
			
	}
}

function startFunc(){
	instances = instances + 1;
	var lifeDensity = document.getElementById("density").value;
	init(lifeDensity);
	draw();
	
	console.log("Start");
}
function pauseFunc(){
	if(paused)
		paused = false;
	else
		paused = true;
	console.log("Pause");
}
function stepFunc(){
	step = true;
	console.log("Step");
}
function restartFunc(){
	restart = true;
	console.log("Restart");
}

function drawChart(actualUps, steps) 
{
	dataPoints.push({
		x: steps,
		y: actualUps                
	});
	data.push(dataSeries);   
	var chart = new CanvasJS.Chart("chartContainer",
	{
		zoomEnabled: true,
		panEnabled: true, 
		title:{
			text: "Wykres lapek w gore" 
		},
		legend: {
			horizontalAlign: "right",
			verticalAlign: "center"        
		},
		axisY:{
			includeZero: false
		},
		data: data,  // random generator below
    });
	chart.render();
	data = []
}

