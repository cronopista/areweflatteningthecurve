Chart.defaults.global.pointHitDetectionRadius = 1;


var totalInfectionEstimate = 0.5;
var ventilatorRate = 0.023;
var recoveryDays = 17;
var fatalityRateOptimal = 0.01;
var fatalityRateSuboptimal = 0.025;
var daysForTrend = 5;



var initialData = regionData["USA"];
var data;


function initData(initialData){
    var data = JSON.parse(JSON.stringify(initialData));

    data.areWe = 'No';
    data.healthCareLimit = Math.round(initialData.ventilators / ventilatorRate);
    data.healthCareLimitCalculated = 0;
    data.totals = [];
    data.activeReal = [];
    data.activeCalculated = [];
    data.labels = [];
    
    
    return data;
}

function getFiveDayGrowthRate(data){
    var fiveDayGrowthRate = 0;
    for (i = data.totalsInitial.length - daysForTrend; i < data.totalsInitial.length; i++) {
        console.info(data.totalsInitial[i] + " " + data.totalsInitial[i - 1] + " " + (data.totalsInitial[i] / data.totalsInitial[i - 1]));
        fiveDayGrowthRate += data.totalsInitial[i] / data.totalsInitial[i - 1];
    }

    return fiveDayGrowthRate / daysForTrend;
    console.info("avg " + fiveDayGrowthRate);
}


function calculateTotals(currentTotal, fiveDayGrowthRate, maxPopulation, totalsInitial){
    var totals = JSON.parse(JSON.stringify(totalsInitial));
    while (currentTotal < maxPopulation && totals.length < 1000) {
        var previousTotal = currentTotal;
        var smoothGrowthRate = ((fiveDayGrowthRate - 1) / maxPopulation * currentTotal);
        var growthRate = fiveDayGrowthRate - smoothGrowthRate;
        if (growthRate < 1.001) {
            growthRate = 1.001;
        }
        currentTotal = Math.round(previousTotal * growthRate);
        totals.push(currentTotal);
    }

    return totals;
}

function calculateActive(totals){
    var active = [];
    for (i = 0; i < totals.length; i++) {
        if (i+recoveryDays < totals.length-1) {
            recoveries = totals[i];
        }
        active.push(totals[i] - recoveries);
    }
}


function calculate(initialData, dateLimit) {
    var data = initData(initialData);

    var fiveDayGrowthRate = getFiveDayGrowthRate(data);

    var currentTotal = data.totalsInitial[data.totalsInitial.length - 1];
    var maxPopulation = data.population * totalInfectionEstimate;
    

    data.totals = calculateTotals(currentTotal, fiveDayGrowthRate, maxPopulation, data.totalsInitial);
    currentTotal = data.totals[data.totals.length - 1];

    


    var recoveries = 0;
    var currentDate = new Date(data.startDate);
    var lengthIndex = -1;


    for (i = 0; i < data.totals.length; i++) {
        if (i > recoveryDays) {
            recoveries = data.totals[i - recoveryDays];
        }


        if (i < data.totalsInitial.length) {
            data.activeReal.push(data.totals[i] - recoveries);
            data.activeCalculated.push(data.totals[i] - recoveries);

        } else {
            data.activeCalculated.push(data.totals[i] - recoveries);

        }

        if (!data.healthCareLimitDate &&
            (data.activeCalculated[i] > data.healthCareLimit || data.activeReal[i] > data.healthCareLimit)) {
            data.healthCareLimitDate = new Date(currentDate);
            data.healthCareLimitIndex = i;
            data.healthCareLimitCalculated = data.activeCalculated[i];
            if (lengthIndex != -1) {
                lengthIndex = i;
                break;
            }
        }

        if (currentDate > dateLimit && lengthIndex == -1) {
            lengthIndex = i;
        }

        data.labels.push(currentDate.toLocaleDateString());

        currentDate.setDate(currentDate.getDate() + 1);
    }


    for (i = recoveryDays; i > 0; i--) {
        recoveries = data.totals[data.totals.length - i];

        data.activeCalculated.push(currentTotal - recoveries);
        data.labels.push(currentDate.toLocaleDateString());
        currentDate.setDate(currentDate.getDate() + 1);
    }

    for (i = recoveryDays; i > 0; i--) {
        data.totals.push(currentTotal);
    }

    if (lengthIndex == -1) {
        lengthIndex = data.totals.length;
    }
    cutToSize(data, lengthIndex + 1)

    console.info(data);

    return data;
}



function cutToSize(data, length) {
    if (length < data.labels.length) {
        data.labels = data.labels.slice(0, length);
        data.activeReal = data.activeReal.slice(0, length);
        data.activeCalculated = data.activeCalculated.slice(0, length);
    }
}




function createChart(data) {
    var ctx = document.getElementById('growthChart');
    var chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Real active cases',
            data: data.activeReal,
            backgroundColor:
                'rgba(0, 0, 100, 0.4)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 1,
            pointRadius: 5
        }, {
            label: 'Projection',
            data: data.activeCalculated,
            backgroundColor:
                'rgba(0, 0, 100, 0.1)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 5
        }, {
            label: '5 days ago',
            data: data.activeCalculated5daysAgo,
            backgroundColor:
                'transparent',
            borderColor:
                'rgba(0, 0, 100, 0.5)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: "On "+data.labels[data.fixComparition],
            data: data.activeCalculated10daysAgo,
            backgroundColor:
                'transparent',
            borderColor:
                'rgba(0, 0, 100, 0.8)',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0
        }]
    };
    if (!data.activeCalculated10daysAgo) {
        chartData.datasets = chartData.datasets.splice(0, 2);
    }

    var growthChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            maintainAspectRatio: false,

            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        }
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'nearest',
                custom: customTooltips
            },
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: data.healthCareLimit,
                    borderColor: 'tomato',
                    borderDash: [2, 2],
                    borderWidth: 2,
                    label: {
                        backgroundColor: "rgb(255,255,255,0.8)",
                        fontColor: "black",
                        content: "Health care system capacity: " + data.healthCareLimit.toLocaleString(),
                        enabled: true,
                        yAdjust: -11
                    }
                }]
            }
        }
    });
}

var app;
function recalculateForDate(days) {

    var dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);
    data = calculate(initialData, dateLimit);

    var extendedDateLimit = new Date();
    extendedDateLimit.setDate(extendedDateLimit.getDate() + 1000);


    var data5day = JSON.parse(JSON.stringify(initialData));
    data5day.totalsInitial = data5day.totalsInitial.slice(0, data5day.totalsInitial.length - 5);
    data5day.fatalitiesInitial = data5day.fatalitiesInitial.slice(0, data5day.fatalitiesInitial.length - 5);
    data5day = calculate(data5day, extendedDateLimit);
    cutToSize(data5day, data.activeCalculated.length);
    data.activeCalculated5daysAgo = data5day.activeCalculated;


    if(data.healthCareLimitDate > data5day.healthCareLimitDate){
        data.areWe = 'Yes';
    }else{
        data.areWe = 'No';
    }
    
    if (days > 1000) {
        var data10day = JSON.parse(JSON.stringify(initialData));
        data10day.totalsInitial = data5day.totalsInitial.slice(0, data.fixComparition);
        data10day.fatalitiesInitial = data5day.fatalitiesInitial.slice(0, data.fixComparition);
        data10day = calculate(data10day, extendedDateLimit);
        cutToSize(data10day, data.activeCalculated.length);
        data.activeCalculated10daysAgo = data10day.activeCalculated;
    }

    if (!app) {
        app = new Vue({
            el: '#mainApp',
            data: {
                bigPictureActive: true,
                ventilatorRate: ventilatorRate,
                totalInfectionEstimate: totalInfectionEstimate,
                recoveryDays: recoveryDays,
                fatalityRateOptimal: fatalityRateOptimal,
                fatalityRateSuboptimal: fatalityRateSuboptimal,
                activeRegion: 'USA',
                daysForTrend: daysForTrend,
                region: data

            },
            methods: {
                bigPicture: function (event) {
                    recalculateForDate(2000);
                },
                nearFuture: function (event) {
                    recalculateForDate(10);
                },
                changeRegion: function (region) {
                    initialData = regionData[region];
                    app.$data.activeRegion = region;
                    recalculateForDate(2000);
                }
            }
        });

    } else {
        app.$data.region = data;

    }
    if (days > 1000) {
        app.$data.bigPictureActive = true;
    } else {
        app.$data.bigPictureActive = false;
    }
    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    createChart(data);
}

var customTooltips = function (tooltip) {

    // Tooltip Element
    var tooltipEl = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = '<table></table>';
        this._chart.canvas.parentNode.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }

    function getBody(bodyItem) {
        return bodyItem.lines;
    }


    if (!tooltip.dataPoints) {
        return;
    }
    var index = tooltip.dataPoints[0].index;


    // Set Text
    if (tooltip.body) {
        var titleLines = tooltip.title || [];
        var bodyLines = tooltip.body.map(getBody);

        var innerHtml = '<thead>';

        titleLines.forEach(function (title) {
            innerHtml += '<tr><th>' + title + '</th></tr>';
        });
        innerHtml += '</thead><tbody>';

        var death = 0;
        if (index < data.fatalitiesInitial.length) {
            death = data.fatalitiesInitial[index];
        } else {
            var total = data.totals[index];
            if (total > data.healthCareLimit) {
                death = Math.round((total - data.healthCareLimit) * fatalityRateSuboptimal + data.healthCareLimit * fatalityRateOptimal);
            } else {
                death = Math.round(total * fatalityRateOptimal);
            }
        }

        innerHtml += '<tr><td>Active cases: ' + data.activeCalculated[index].toLocaleString() + '</td></tr>';
        innerHtml += '<tr><td>Total cases: ' + data.totals[index].toLocaleString() + '</td></tr>';
        innerHtml += '<tr><td>Fatalities: ' + death.toLocaleString() + '</td></tr>';
        innerHtml += '</tbody>';

        var tableRoot = tooltipEl.querySelector('table');
        tableRoot.innerHTML = innerHtml;
    }

    var positionY = this._chart.canvas.offsetTop;
    var positionX = this._chart.canvas.offsetLeft;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
};

recalculateForDate(2000);

