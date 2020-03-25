var totalInfectionEstimate = 0.5;
var ventilatorRate = 0.023;
var recoveryDays = 17;
var fatalityRateOptimal = 0.01;
var fatalityRateSuboptimal = 0.025;
var daysForTrend = 5;

var data = regionData["USA"];

function calculate(data, dateLimit) {
    data.healthCareLimit = Math.round(data.ventilators / ventilatorRate);
    data.totals = [];
    data.increments = [];
    data.activeReal = [];
    data.activeCalculated = [];
    data.labels = [];
    data.healthCareLimitDate = undefined;

    for (var i = 0; i < data.totalsInitial.length; i++) {
        data.totals.push(data.totalsInitial[i]);
    }


    for (var i = 1; i < data.totals.length; i++) {
        data.increments.push(data.totals[i] - data.totals[i - 1]);
    }

    var fiveDayGrowthRate = 0;
    for (i = data.increments.length - daysForTrend; i < data.increments.length; i++) {

        fiveDayGrowthRate += data.increments[i] / data.increments[i - 1];
    }

    data.fiveDayGrowthRate = fiveDayGrowthRate / daysForTrend;
    data.fiveDayGrowthRatePrint = Math.round(data.fiveDayGrowthRate * 100) / 100;
    console.info("avg " + data.fiveDayGrowthRate);

    var currentTotal = data.totals[data.totals.length - 1];
    var growthRate = data.fiveDayGrowthRate;
    var maxPopulation = data.population * totalInfectionEstimate;
    while (currentTotal < maxPopulation) {
        var previousTotal = currentTotal;
        var smoothGrowthRate = ((data.fiveDayGrowthRate - 1) / maxPopulation * currentTotal);
        growthRate = data.fiveDayGrowthRate - smoothGrowthRate;
        if (growthRate < 1.001) {
            growthRate = 1.001;
        }

        currentTotal = Math.round(previousTotal * growthRate);
        data.totals.push(currentTotal);
        data.increments.push(currentTotal - previousTotal);


    }


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
            if (data.healthCareLimitDate < new Date("2021-01-01")) {
                data.areWe = "No";
            } else {
                data.areWe = "Yes";
            }
            data.healthCareLimitIndex = i;
            data.healthCareLimitCalculated = data.activeCalculated[i];
            if (lengthIndex != -1) {
                lengthIndex = i;
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

    if (lengthIndex > -1) {
        lengthIndex++;
        data.labels = data.labels.slice(0, lengthIndex);
        data.activeReal = data.activeReal.slice(0, lengthIndex);
        data.activeCalculated = data.activeCalculated.slice(0, lengthIndex);
    }



    console.info(data);


}




Chart.defaults.global.pointHitDetectionRadius = 1;

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



function createChart() {
    var ctx = document.getElementById('growthChart');
    var growthChart = new Chart(ctx, {
        type: 'line',
        data: {
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
            }]
        },
        options: {
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

function recalculateForDate(days) {
    var dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);
    calculate(data, dateLimit);
    if (days > 1000) {
        app.$data.bigPictureActive = true;
    } else {
        app.$data.bigPictureActive = false;
    }
    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    createChart();
}


var app = new Vue({
    el: '#mainApp',
    data: {
        bigPictureActive: false,
        ventilatorRate: ventilatorRate,
        totalInfectionEstimate: totalInfectionEstimate,
        recoveryDays: recoveryDays,
        fatalityRateOptimal: fatalityRateOptimal,
        fatalityRateSuboptimal: fatalityRateSuboptimal,
        activeRegion: 'USA',
        daysForTrend:daysForTrend,
        region: data

    },
    methods: {
        bigPicture: function (event) {
            recalculateForDate(5000);
        },
        nearFuture: function (event) {
            recalculateForDate(10);
        },
        changeRegion: function (region) {
            data = regionData[region];
            app.$data.region = data;
            app.$data.activeRegion = region;
            recalculateForDate(10);
        }
    }
});

recalculateForDate(10);

