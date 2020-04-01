Chart.defaults.global.pointHitDetectionRadius = 1;


var initialData = regionData["USA"];
var data;


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
            label: "On " + data.labels[data.fixComparition],
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
        chartData.datasets.push({
            label: 'Long term trend',
            data: data.longTermActive,
            backgroundColor:
                'rgba(0, 100, 0, 0.1)',
            borderColor:
                'rgba(0, 100, 0, 0.9)',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0
        });
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


    if (data.healthCareLimitDate > data5day.healthCareLimitDate) {
        data.areWe = 'Yes';
    } else {
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

