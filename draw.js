function mod(n, m) {
        return ((n % m) + m) % m;
}

var arrowUpImg = new Image();
var arrowDownImg = new Image();
var highlightSpriteSheet = new Image();
var arrowsSprite = new Image();
arrowUpImg.src = "resources/Arrow_Up.png"
arrowDownImg.src = "resources/Arrow_Down.png"
arrowsSprite.src = "resources/arrows_sprite_64x64.png"
highlightSpriteSheet.src = "resources/highlight_sprite_64x64a.png"

FPS = 30;

var SIMPLE = 0;
var ROUGH = 1;

var STATE_UNDEFINED = -1;
var STATE_DOWN = 0;
var STATE_UP = 1;

var TOTAL_ROWS = 1;
var TOTAL_COLS = 50;

var CELL_SIZE = 26;
// pobierz canvas z html oraz kontekst
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


// wymiary canvasa 
var	canvas_width = canvas.width;
var	canvas_height = canvas.height;
function Sprite(ctx, image, width, height, offset, numberOfFrames, updatesPerFrame, loop)
{
	this.render = function(x, y, width, height)
	{
		ctx.globalAlpha = 1;
		this.ctx.drawImage(
			this.image, 
			this.currentFrameIndex * this.width, 
			offset, 
			this.width, 
			this.height, 
			x, 
			y, 
			width, 
			height)
	}
	this.update = function()
	{
		this.currentFrameUpdates += 1;
		if(this.currentFrameUpdates > this.updatesPerFrame)
		{
			this.currentFrameUpdates = 0;
			if(this.currentFrameIndex < numberOfFrames - 1)
			{
				this.currentFrameIndex += 1;	
			}else if(this.loop)
			{
				this.currentFrameIndex = 0;
			}else
			{
				this.currentFrameIndex = 0;
				return true;
			}
			return false;
		}
	}

	this.loop = loop;
	this.numberOfFrames = numberOfFrames;
	this.currentFrameIndex = 0;
	this.currentFrameUpdates = 0;
	this.updatesPerFrame = updatesPerFrame;
	this.ctx = ctx;
	this.image = image;
	this.height = height;
	this.width = width;
}
var highlightOffset = CELL_SIZE-CELL_SIZE*1/7;
//holds single cell
function Cell(ctx, x, y, width, height){
	this.drawCellImg = function(img)
	{
	    // console.log("drawCellImg" +  " " + this.x + " " + this.y + " " + this.width + " " + this.height);
	    ctx.globalAlpha = 1;
	    ctx.drawImage(img, this.x, this.y, this.width, this.height);   
	}
	this.drawWhite = function()
	{
        this.ctx.fillStyle="#FFFFFF";
        this.ctx.fillRect(this.x, this.y, this.width, this.width);
    }
	this.draw = function()
	{
	    if(this.state == STATE_UP)
        {
            if(this.animationDownUpOngoing)
            {
            	this.arrowSpriteDown.render(this.x, this.y, CELL_SIZE, CELL_SIZE);
            	if(this.arrowSpriteDown.update())
	            {
	            	this.animationDownUpOngoing = false;
	            }
            }
            else
            {
            	this.drawCellImg(arrowUpImg);
            }
            
        }else if(this.state == STATE_DOWN)
        {
            if(this.animationUpDownOngoing)
            {
            	this.arrowSpriteUp.render(this.x, this.y, CELL_SIZE, CELL_SIZE);
            	if(this.arrowSpriteUp.update())
	            {
	            	this.animationUpDownOngoing = false;
	            }
            }
            else
            {
            	this.drawCellImg(arrowDownImg);
            }
        }else
        {
            this.drawWhite();
        }
        if(this.highlight)
        {
        	this.highlightAnim.render(this.x, this.y+highlightOffset, CELL_SIZE, CELL_SIZE/2);
        	if(this.highlightAnim.update())
        	{
        		this.highlight = false;
        	}
        }
	}
	this.startHighlight = function()
	{
		this.highlight = true;
	}
	this.setState = function(state)
	{
		if(this.state != state)
		{
			if(state == STATE_UP)
			{
				this.animationDownUpOngoing = true;
			}
			else if (state == STATE_DOWN)
			{
				this.animationUpDownOngoing = true;
			}
		}
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
	this.highlightAnim = new Sprite(ctx, highlightSpriteSheet, 64, 64, 0, 6, 2, false);
	this.arrowSpriteUp = new Sprite(ctx, arrowsSprite, 128, 128, 0, 5, 2, false);
	this.arrowSpriteDown = new Sprite(ctx, arrowsSprite, 128, 128, 128, 5, 2, false);
	this.animationUpDownOngoing = false;
	this.animationDownUpOngoing = false;
	this.highlight = false;
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
				// console.log("rand" +  " " + rand + " " + "probability" + probability);
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
	this.judge = function(mode)
	{
	    var chosenCol = Math.round(Math.random()*this.cols);
	    cellLeft = this.getCell(1, chosenCol-1);
	    cellMidLeft = this.getCell(1, chosenCol);
	    cellMidRight = this.getCell(1, chosenCol+1);
	    cellRight = this.getCell(1, chosenCol+2);
	    if((cellMidLeft.state == STATE_UP) && (cellMidRight.state == STATE_UP))
	    {
	    	console.log("First: cellMidLeft.state" + cellMidLeft.state  + ", cellMidRight.state" + cellMidRight.state);
            cellLeft.setState(STATE_UP);
            cellRight.setState(STATE_UP);
        }
        else if((cellMidLeft.state == STATE_DOWN) && (cellMidRight.state == STATE_DOWN))
        {
        	console.log("Second: cellMidLeft.state" + cellMidLeft.state  + ", cellMidRight.state" + cellMidRight.state);
            cellLeft.setState(STATE_DOWN);
            cellRight.setState(STATE_DOWN);
        }
        else if(mode == ROUGH)
        {
        	console.log("Third: cellMidLeft.state" + cellMidLeft.state  + ", cellMidRight.state" + cellMidRight.state);
        	cellLeft.setState(cellMidRight.state);
        	cellRight.setState(cellMidLeft.state);
        }
        cellMidRight.startHighlight();
        cellMidLeft.startHighlight();
	}
	this.draw = function()
	{
		for(var i=0;i<this.cols*this.rows;++i)
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
// function Sprite(ctx, image, width, height, numberOfFrames, updatesPerFrame, loop)
// var mySprite = new Sprite(ctx, highlightSpriteSheet, CELL_SIZE, CELL_SIZE, 4, 0.5, true);
var steps = 0;
var paused = false;
var instances = 0;
var step = false;
var restart = false;
var data = []; 
var dataSeries = { type: "line" };
var dataPoints = [];
dataSeries.dataPoints = dataPoints;
function init(upDensity)
{
    console.log("Init");
	cellArray = new CellArray(ctx, TOTAL_ROWS, TOTAL_COLS, CELL_SIZE);
	cellArray.initialize(upDensity);
//	initialCellsState = cellArray.getArrayState();
	newtime = new Date().getTime();
	applicationTime = new Date().getTime();
	steps = 0;
	dataPoints = [];
	dataSeries.dataPoints = dataPoints;
}
var renderDeltaTime = 1000/FPS;
var applicationDeltaTime = 1000/FPS*2;
var CHANGE_TIME = 1000/CHANGES_PER_SECOND;
var arrowTime = CHANGE_TIME;
// funkcja rysujaca i obliczajaca polozenie
function draw(){
	if(canvas.getContext){
		var time = new Date();
		if(Math.abs(newtime-time.getTime())>renderDeltaTime)
		{
			newtime = new Date().getTime();
			ctx.clearRect(0,0,canvas_width, canvas_height);
			cellArray.draw();
		}
		if(!paused) 
		{
			deltaTime = Math.abs(applicationTime-time.getTime());
			if(deltaTime>applicationDeltaTime)
			{
				arrowTime = arrowTime - deltaTime;
				if(arrowTime<0)
				{
					arrowTime = CHANGE_TIME;
					cellArray.judge(ROUGH);
					steps = steps + 1;
					drawChart(cellArray.getUpsDensity(), steps);
				}
				applicationTime = new Date().getTime();
			}
		}
		else
		{
			if(step)
			{
				ctx.clearRect(0,0,canvas_width, canvas_height);
				cellArray.draw();
				cellArray.judge(ROUGH);
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
			text: "Wykres strzalek w gore" 
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

