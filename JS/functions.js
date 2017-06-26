"use strict";

$( function() {

    var gameTimer; // to start and stop timer.
    var allStageData = []; // calaulated stages for displaying boarg stage on timer event
    var currentStageData = []; // used during recursive call to track current stage
    var stageIndex = 0; // for displaying stages
    var positionIncrement = 0; // position of towers
    var timerStateRunning = false; // track if Timer is running
    var paused = false; // check if user presed stop button before all stages were displayed
    // Represent the towers as arrays, then put those in an overall array.
    var towers = [];
    for (var i = 0; i < 3; i += 1) {
        towers.push([]);
    }

    // Timer Event Handler
    function onTimerTick() {
        if(allStageData.length > 0 && stageIndex < allStageData.length) {
            var stage = allStageData[stageIndex];
            if(stage !== undefined) {
                drawBoard(stage, positionIncrement, 20);
                stageIndex++;
            }
        }
        else
            stopTimer();
    }

    // Start Timer on button clck if state is stopped 
    function startTimer() {
        var numRings = parseInt($("#selNumRings").val());
        gameTimer = setInterval(onTimerTick, 1000);
        $('#start_pause').text("Stop");
        timerStateRunning = true;
        // Reinitialize data if all stages were already displayed.
        if(!paused) {
            towers = [];
            for (var i = 0; i < 3; i += 1) {
                towers.push([]);
            }
            initializeBoard(numRings, towers, 20);
            positionIncrement = (numRings + 2) * 20;
            drawBoard(towers, positionIncrement, 20);
            currentStageData = towers;
            generateDataToDisplay(numRings, 0, 2, 1);
        }
    }

    // Stop Timer on button clck if state is started 
    function stopTimer() {
        if(gameTimer !== undefined)
            clearInterval(gameTimer);
        timerStateRunning = false;
        paused = allStageData.length > 0 && stageIndex < allStageData.length;
        if(paused)
            $('#start_pause').text("Restart");
        else
            $('#start_pause').text("Start");
    }

    // button event handler
    $('#start_pause').on('click', function (e) {

        if(!timerStateRunning)
            startTimer();
        else
            stopTimer();
    });

    // Create Ring Div
    function createRing(numRings, ringIndex, ringHeight) {
        var ringWidth = (numRings - ringIndex + 1) * ringHeight;

        var ring = document.createElement("div");
        var ringID = (numRings - ringIndex).toString(); 
        ring.id = ringID;
        ring.innerHTML = ringID;
        ring.className = (ringIndex % 2 == 0) ? "ring" : "oddring";
        ring.style.width = ringWidth + "px";
        ring.style.height = ringHeight + "px";
        return ring;
    }

    // Create Tower Div
    function createTower(towerIndex, positionIncrement, towerWidth, towerHeight) {
        var tower = document.createElement("div");
        tower.className = "tower";
        var towerLeft = positionIncrement * (towerIndex + 1);
        tower.style.left = (towerLeft - (towerWidth / 2)) + "px";
        tower.style.width = towerWidth + "px";
        tower.style.height = towerHeight + "px";
        return tower;
    }
    // Initialize tower
    function initializeBoard(numRings, towers, ringHeight) {
        var towerCount = towers.length;
        // Create the containing element.
        var gameBoard = $("#gameSpace");
        gameBoard.empty();

        // Calculate/set properties that depend on the ring height.
        positionIncrement = (numRings + 2) * ringHeight;

        gameBoard.css("height", (ringHeight * (numRings + 2)));
        gameBoard.css("width", (positionIncrement * (towerCount + 1)));
        
        // Add a base to the board.  The base is as high as the towers are wide.
        var baseHeight = ringHeight / 2;
        var base = document.createElement("div");
        base.className = "base";
        base.style.height = baseHeight + "px";
        gameBoard.append(base);
        
        // Add the tower elements to the board.
        var towerLeft = positionIncrement;
        for (i = 0; i < towerCount; i += 1) {
            var tower = createTower(i, positionIncrement, baseHeight, (ringHeight * (numRings + 1)));
            gameBoard.append(tower);
        }
        
        // Create the rings Their widths vary by increments of the given ringHeight (in pixels).
        for (i = 0; i < numRings; i += 1) {
            var ring = createRing(numRings, i, ringHeight)
            towers[0].push(ring.id); // add ring id to tower
            gameBoard.append(ring); // add rings to board
        }
    };

    // Draw stage of board
    function  drawBoard(towers, positionIncrement, ringHeight) {
        var towerLeft = positionIncrement;
        var towerCount = towers.length;
        var i = 0;
        for (i = 0; i < towerCount; i += 1) {
            var bottom = ringHeight/2;
            var j;
            for (j = 0; j < towers[i].length; j += 1) {
                var ring = document.getElementById(towers[i][j]);
                if(ring !== undefined && ring !== null) {
                    ring.style.left =
                        // We use parseInt to chop off the units.
                        (towerLeft - (parseInt(ring.style.width) / 2)) + "px";
                    ring.style.bottom = bottom + "px";
                    bottom += ringHeight;
                }
            }
            towerLeft += positionIncrement;
        }
    };

    // Pre calculate all stages so it can be played on timer event.
    function generateDataToDisplay(numRings, src, aux, dst) {
        if (numRings > 0) {
            generateDataToDisplay(numRings - 1, src, dst, aux);
            var ringToMove = currentStageData[src].pop();
            currentStageData[dst].push(ringToMove);
            
            var thisStage = [[],[],[]];
            var temp = [];
            var newState = temp.concat(currentStageData[0]);
            thisStage[0] = newState; 
            newState = temp.concat(currentStageData[1]);
            thisStage[1] = newState;
            newState = temp.concat(currentStageData[2]);
            thisStage[2] = newState;
            
            allStageData.push(thisStage);

            generateDataToDisplay(numRings - 1, aux, src, dst);
        }
    };
});