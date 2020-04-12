Chart.defaults.global.pointHitDetectionRadius = 1;

var regions = ["US", "Italy", "Spain", "Germany", "United Kingdom", "India", "Portugal", "Brazil"];
var initialData = regionData["US"];


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
            pointRadius: 1
        }, {
            label: 'Projection',
            data: data.activeCalculated,
            backgroundColor:
                'rgba(0, 0, 100, 0.1)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 1,
            pointRadius: 1
        }, {
            label: '5 days ago',
            data: data.activeCalculated5daysAgo,
            backgroundColor:
                'transparent',
            borderColor:
                'rgba(0, 0, 100, 0.8)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: "10 days ago",
            data: data.activeCalculated10daysAgo,
            backgroundColor:
                'transparent',
            borderColor:
                'rgba(0, 0, 100, 0.3)',
            borderWidth: 1,
            pointRadius: 0
        }, {
            label: "On " + data.labels[data.fixComparition],
            data: data.activeCalculatedFixed,
            backgroundColor:
                'transparent',
            borderColor:
                'rgba(0, 0, 100, 0.3)',
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

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {

                        return "Active: " + tooltipItem.yLabel.toLocaleString();
                    }
                }
            },
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
    var data = calculate(initialData, dateLimit);


    var data5day = JSON.parse(JSON.stringify(initialData));
    data5day.totalsInitial = data5day.totalsInitial.slice(0, data5day.totalsInitial.length - 5);
    data5day.fatalitiesInitial = data5day.fatalitiesInitial.slice(0, data5day.fatalitiesInitial.length - 5);
    data5day = calculate(data5day);
    cutToSize(data5day, data.activeCalculated.length);
    data.activeCalculated5daysAgo = data5day.activeCalculated;


    if (data.healthCareLimitDate > data5day.healthCareLimitDate) {
        data.areWe = 'Yes';
    } else {
        data.areWe = 'No';
    }

    if (days > 1000) {
        var data10day = JSON.parse(JSON.stringify(initialData));
        data10day.totalsInitial = data10day.totalsInitial.slice(0, data5day.totalsInitial.length - 10);
        data10day.fatalitiesInitial = data10day.fatalitiesInitial.slice(0, data5day.totalsInitial.length - 10);
        data10day = calculate(data10day);
        cutToSize(data10day, data.activeCalculated.length);
        data.activeCalculated10daysAgo = data10day.activeCalculated;


        var dataFixed = JSON.parse(JSON.stringify(initialData));
        dataFixed.totalsInitial = dataFixed.totalsInitial.slice(0, data.fixComparition);
        dataFixed.fatalitiesInitial = dataFixed.fatalitiesInitial.slice(0, data.fixComparition);
        dataFixed = calculate(dataFixed);
        cutToSize(dataFixed, data.activeCalculated.length);
        data.activeCalculatedFixed = dataFixed.activeCalculated;
    }

    if (!app) {
        app = startVue(data);
    } else {
        app.$data.region = data;

    }

    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    createChart(data);
}




function animatedChart() {
    //get frames
    var labels = [];
    var dataFrames = [];
    for (var i = initialData.fixComparition; i <= initialData.totalsInitial.length; i++) {
        var dataShort = JSON.parse(JSON.stringify(initialData));
        dataShort.totalsInitial = dataShort.totalsInitial.slice(0, i);
        dataShort = calculate(dataShort);
        dataFrames.push(dataShort.activeCalculated);
        if (dataShort.labels.length > labels.length) {
            labels = dataShort.labels;
        }
    }

    console.info("Animation", labels, dataFrames);

    //create chart 
    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    var ctx = document.getElementById('growthChart');
    var frame = 0;

    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labels[frame + initialData.fixComparition],
                data: dataFrames[frame],
                backgroundColor:
                    'rgba(0, 0, 100, 0.4)',
                borderColor:
                    'rgba(0, 0, 100, 1)',
                borderWidth: 1,
                pointRadius: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            animation: {
                easing: 'linear',
                duration: 100,
                onComplete: function () {
                    if (frame < dataFrames.length - 1) {
                        frame++;
                        growthChart.data.datasets[0].label = labels[frame + initialData.fixComparition];
                        growthChart.data.datasets[0].data = dataFrames[frame];
                        setTimeout("growthChart.update(150)", 1);
                    }
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: initialData.population * totalInfectionEstimate,
                        callback: function (value, index, values) {
                            return value.toLocaleString();
                        }
                    }
                }]
            },
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: initialData.healthCareLimit,
                    borderColor: 'tomato',
                    borderDash: [2, 2],
                    borderWidth: 2,
                    label: {
                        backgroundColor: "rgb(255,255,255,0.8)",
                        fontColor: "black",
                        content: "Health care system capacity",
                        enabled: true,
                        yAdjust: -11
                    }
                }]
            }
        }
    });
}


function startVue(data) {
    return new Vue({
        el: '#mainApp',
        data: {
            activeChart: 'bigPicture',
            ventilatorRate: ventilatorRate,
            totalInfectionEstimate: totalInfectionEstimate,
            recoveryDays: recoveryDays,
            fatalityRateOptimal: fatalityRateOptimal,
            fatalityRateSuboptimal: fatalityRateSuboptimal,
            activeRegion: 'US',
            daysForTrend: daysForTrend,
            region: data

        },
        methods: {
            bigPicture: function (event) {
                app.$data.activeChart = 'bigPicture';
                recalculateForDate(2000);
            },
            nearFuture: function (event) {
                app.$data.activeChart = 'nearFuture';
                recalculateForDate(10);
            },
            animatedChart: function (event) {
                app.$data.activeChart = 'animatedChart';
                animatedChart();
            },
            changeRegion: function (region) {
                app.$data.activeChart = 'bigPicture';
                initialData = regionData[region];
                app.$data.activeRegion = region;
                recalculateForDate(2000);
            }
        }
    });
}


$(document).ready(function () {
    $.getJSON("https://pomber.github.io/covid19/timeseries.json", function (data) {
        for (var i = 0; i < regions.length; i++) {
            var region = regionData[regions[i]];
            region.totalsInitial = [];
            region.fatalitiesInitial = [];
            region.startDate = null;
            region.fixComparition = -1;
            var timeseriesRegion = data[regions[i]];
            var startDate = new Date(2020, 0, 22);
            for (var j = 0; j < timeseriesRegion.length; j++) {
                if (timeseriesRegion[j].confirmed > 99 && region.startDate == null) {
                    region.startDate = new Date(startDate);
                } else {
                    startDate.setDate(startDate.getDate() + 1);
                }
                if (timeseriesRegion[j].confirmed > 900 && region.fixComparition == -1) {
                    region.fixComparition = region.totalsInitial.length;
                }
                if (region.startDate != null) {
                    region.totalsInitial.push(timeseriesRegion[j].confirmed);
                    region.fatalitiesInitial.push(timeseriesRegion[j].death);
                }
            }
        }

        recalculateForDate(2000);

    });



});
