// Some constants : begin
const ENTRAINEMENT_STR = "entrainement";
const SPRINT_SELECT_OPTION = "sprint";
const DEMI_FOND_SELECT_OPTION = "demi_fond";
const FOND_SELECT_OPTION = "fond";
const MIN_KM_SELECTOR_SPEED = "minkm";
// Some constants : end

// Distances : begin
var distances_sprint = ["50","60","100","150","200","300","400","500","600"];
var distances_demi_fond = ["800","1k","15","Mile","2k","3k"];
var distances_fond = ["5k","10k","20k","S.","25k","30k","M."];
var all_distances = distances_sprint.concat(distances_demi_fond).concat(distances_fond);
var meters_sprint = [50,60,100,150,200,300,400,500,600];
var meters_demi_fond = [800,1000,1500,1609,2000,3000];
var meters_fond = [5000,10000,20000,21097,25000,30000,42195];
// Distances : end

document.addEventListener("DOMContentLoaded", function() {
    updateDistanceSelection();
    updateMinMaxIncSelection();
    generateTable();
}, false);

function generateTable() {
    var tableHtml = document.getElementById("table");
    var typeSelector = document.getElementById("type");
    var distanceSelector = document.getElementById("distances");

    var selectedType = typeSelector.options[typeSelector.selectedIndex].value;
    var selectedDistance = "";

    if (selectedType != ENTRAINEMENT_STR) {
        selectedDistance = distanceSelector.options[distanceSelector.selectedIndex].value;
    }

    var table = "<table>";
    var tableHeader;
    var colsValues;
    var nbCol = 0;

    switch (selectedDistance) {
        case SPRINT_SELECT_OPTION:
            tableHeader = generateTableHeader(distances_sprint);
            colsValues = meters_sprint;
            nbCol = distances_sprint.length;
            break;
        case DEMI_FOND_SELECT_OPTION:
            tableHeader = generateTableHeader(distances_demi_fond);
            colsValues = meters_demi_fond;
            nbCol = distances_demi_fond.length;
            break;
        case FOND_SELECT_OPTION:
            tableHeader = generateTableHeader(distances_fond);
            colsValues = meters_fond;
            nbCol = distances_fond.length;
            break;
        default:
            colsValues = meters_sprint.concat(meters_demi_fond).concat(meters_fond);
            nbCol = all_distances.length;
            tableHeader = generateTableHeader(all_distances);
            break;
    }

    table += tableHeader;
    table += generateTableLines(colsValues);
    table += "</table>";

    tableHtml.innerHTML = table;
}

function generateTableHeader(distances) {
    var headerHtml = "<tr><th>t/km</th><th>v km/h</th>";

    for (var distanceIndex = 0; distanceIndex < distances.length; distanceIndex++) {
        headerHtml += "<th>" + distances[distanceIndex] + "</th>";
    }

    headerHtml += "</tr>";
    return headerHtml;
}

function generateTableLines(colsValues) {
    var speedSelector = document.getElementById("allures");
    var selectedSpeedType = speedSelector.options[speedSelector.selectedIndex].value;
    var selector = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "allure" : "vitesse";

    var incSelector = document.getElementById(selector + "_increment");
    var minSelector = document.getElementById(selector + "_min");
    var maxSelector = document.getElementById(selector + "_max");

    var minValue = parseFloat(minSelector.options[minSelector.selectedIndex].value);
    var maxValue = parseFloat(maxSelector.options[maxSelector.selectedIndex].value);
    var incValue = parseFloat(incSelector.options[incSelector.selectedIndex].value);

    if (minValue > maxValue) {
        var tmp = maxValue;
        maxValue = minValue;
        minValue = tmp;
    }

    return selectedSpeedType == MIN_KM_SELECTOR_SPEED ?
        generateTableLinesForMinKm(minValue, maxValue, incValue, colsValues) :
        generateTableLinesForKmH(minValue, maxValue, incValue, colsValues);
}

function generateLine(speedKmH, colsValues) {
    var tableLine = "";
    for (var distanceIndex = 0; distanceIndex < colsValues.length; distanceIndex++) {
        var distance = colsValues[distanceIndex];
        var timeSeconds = distance / (speedKmH * 1000 / 3600);
        timeSeconds = timeSeconds.toPrecision(4);
        var fullSeconds = Math.floor(timeSeconds);
        var roundSeconds = Math.round(timeSeconds);

        var cents = timeSeconds - fullSeconds;
        var usedSeconds = (cents >= 0.5 && distance > 800) ? roundSeconds : fullSeconds;

        var hours = secondsToHour(usedSeconds);
        var minutes = secondsToMinutes(usedSeconds, hours);
        var seconds = usedSeconds - (hours * 3600) - (minutes * 60);
        var flooredSeconds = usedSeconds - (hours * 3600) - (minutes * 60);

        var timeStr = "";
        var centsZeroPadding = addZeroPadding(Math.round(cents * 100));
        var secondsZeroPadding = addZeroPadding(seconds);
        var flooredSecondsZeroPadding = addZeroPadding(flooredSeconds);
        var minutesZeroPadding = addZeroPadding(minutes);


        if (distance < 800) {
            timeStr = usedSeconds < 60 ? usedSeconds + "\"" + centsZeroPadding :
                minutes + "'" + flooredSecondsZeroPadding + "\"" + centsZeroPadding;
        } else {
            timeStr = usedSeconds >= 3600 ? hours + "h" + minutesZeroPadding + "'" + secondsZeroPadding + "\"" :
                minutes + "'" + secondsZeroPadding + "\"";
        }

        //if (distance < 800) {
            //timeStr = fullSeconds < 60 ? fullSeconds + "\"" + centsZeroPadding :
                //minutes + "'" + flooredSecondsZeroPadding + "\"" + centsZeroPadding;
        //} else {
            //timeStr = seconds >= 3600 ? hours + "h" + minutesZeroPadding + "'" + secondsZeroPadding + "\"" :
                //minutes + "'" + secondsZeroPadding + "\"";
        //}
        tableLine += "<td>" + timeStr + "</td>";
    }
    return tableLine;
}

function generateTableLinesForMinKm(minValue, maxValue, incValue, colsValues) {
    var tableLines = "";

    for (var value = maxValue; value >= minValue; value -= incValue) {
        var minutes = secondsToMinutes(value, 0);
        var seconds = value - minutes * 60;
        var strSpeed = minutes + "'" + addZeroPadding(seconds) + "\"";
        var speedKmH = secondPerKmToKmHString(value);

        tableLines += "<tr><td class=\"colHead\">" + strSpeed +"</td><td class=\"colHead\">" + speedKmH.toFixed(2) + "</td>";
        tableLines += generateLine(speedKmH, colsValues);
        tableLines += "</tr>";
    }

    return tableLines;
}


function generateTableLinesForKmH(minValue, maxValue, incValue, colsValues) {
    var tableLines = "";

    for (var value = minValue; value <= maxValue; value = Math.round((value + incValue) * 100 ) / 100) {
        var speedKmH = Number(value).toFixed(2);
        var speedSecondsPerKm = Math.round(kmHtoSecondsPerKm(speedKmH));
        var minutes = secondsToMinutes(speedSecondsPerKm, 0);
        var seconds = speedSecondsPerKm - minutes * 60;
        var strSpeed = minutes + "'" + addZeroPadding(seconds) + "\"";

        tableLines += "<tr><td class=\"colHead\">" + strSpeed + "</td><td class=\"colHead\">" + speedKmH + "</td>";

        tableLines += generateLine(speedKmH, colsValues);

        tableLines += "</tr>";
    }

    return tableLines;
}

function updateDistanceSelection() {
    var typeSelector = document.getElementById("type");
    var selectedType = typeSelector.options[typeSelector.selectedIndex].value;
    var distanceSelectionSpan = document.getElementById("distances_selection");

    distanceSelectionSpan.style.display = selectedType == "course" ? "inline" : "none";
}

function updateMinMaxIncSelection() {
    var speedSelector = document.getElementById("allures");
    var allureMinSelector = document.getElementById("allure_min");
    var vitesseMinSelector = document.getElementById("vitesse_min");
    var allureMaxSelector = document.getElementById("allure_max");
    var vitesseMaxSelector = document.getElementById("vitesse_max");
    var allureIncSelector = document.getElementById("allure_increment");
    var vitesseIncSelector = document.getElementById("vitesse_increment");

    var selectedSpeedType = speedSelector.options[speedSelector.selectedIndex].value;

    allureMinSelector.style.display = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "inline" : "none";
    allureMaxSelector.style.display = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "inline" : "none";
    allureIncSelector.style.display = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "inline" : "none";
    vitesseMinSelector.style.display = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "none" : "inline";
    vitesseMaxSelector.style.display = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "none" : "inline";
    vitesseIncSelector.style.display = selectedSpeedType == MIN_KM_SELECTOR_SPEED ? "none" : "inline";
}

/*
 ** Converts seconds per km in km/h : format "XX,XX" km/h
 */
function secondPerKmToKmHString(seconds) {
    return Number(3600 / seconds);
    //return Number(3600 / seconds).toFixed(2);
}

/*
 ** Converts km/h in seconds per km.
 */
function kmHtoSecondsPerKm(speed) {
    return 1 / speed * 3600;
}

/*
 ** Returns number of hours for <parameter> seconds.
 */
function secondsToHour(seconds) {
    return Math.floor(seconds / 3600);
}

/*
 ** Returns number of minutes (minus hours) for <parameters> hour and seconds.
 */
function secondsToMinutes(seconds, hours) {
    return Math.floor((seconds - (hours * 3600)) / 60);
}

/*
 ** Take number X parameter.
 ** Returns 0X string.
 */
function addZeroPadding(number) {
    return ("0" + number).slice(-2);
}
