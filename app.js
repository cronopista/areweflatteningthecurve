Chart.defaults.global.pointHitDetectionRadius = 1;

var app;




function createChart(data) {
    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    var ctx = document.getElementById('growthChart');
    var chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Real cases',
            data: data.activeReal,
            backgroundColor:
                'rgba(0, 0, 100, 0.4)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 2,
            pointRadius: 0
        }, {
            label: 'Current projection',
            data: data.activeCalculated,
            backgroundColor:
                'rgba(0, 0, 100, 0.1)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 2,
            pointRadius: 0
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




function recalculateForDate(days, initialData) {

    var dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);
    var data = calculate(initialData, dateLimit);


    var data5day = JSON.parse(JSON.stringify(initialData));
    data5day.totalsInitial = data5day.totalsInitial.slice(0, data5day.totalsInitial.length - 5);
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
        data10day = calculate(data10day);
        cutToSize(data10day, data.activeCalculated.length);
        data.activeCalculated10daysAgo = data10day.activeCalculated;


        var dataFixed = JSON.parse(JSON.stringify(initialData));
        dataFixed.totalsInitial = dataFixed.totalsInitial.slice(0, data.fixComparition);
        dataFixed = calculate(dataFixed);
        cutToSize(dataFixed, data.activeCalculated.length);
        data.activeCalculatedFixed = dataFixed.activeCalculated;
    }


    return data;

}





function startVue(data) {
    return new Vue({
        el: '#mainApp',
        data: {
            activeChart: 'bigPicture',
            ventilatorRate: ventilatorRate,
            totalInfectionEstimate: totalInfectionEstimate,
            recoveryDays: recoveryDays,
            activeRegion: getHash(),
            daysForTrend: daysForTrend,
            regionData: regionData,
            region: data

        },
        mounted() {
            window.addEventListener(
                'hashchange', function () {
                    app.$data.activeChart = 'bigPicture';
                    app.$data.activeRegion = getHash();
                    var newData = recalculateForDate(2000, regionData[app.$data.activeRegion]);
                    app.$data.region = newData;
                    createChart(newData);
                }
            );
        },
        methods: {
            bigPicture: function (event) {
                app.$data.activeChart = 'bigPicture';
                createChart(recalculateForDate(2000, regionData[app.$data.activeRegion]));
            },
            nearFuture: function (event) {
                app.$data.activeChart = 'nearFuture';
                createChart(recalculateForDate(10, regionData[app.$data.activeRegion]));
            },
            changeRegion: function () {
                window.location.hash = app.$data.activeRegion;
            }
        }
    });
}

function getHash() {
    if (!window.location.hash) {
        return "US";
    }
    return window.location.hash.substr(1).replace("%20", " ");
}


function loadCountryData(data) {
    for (var countryName in regionData) {
        var region = regionData[countryName];
        if (data[countryName]) {
            region.totalsInitial = [];
            region.startDate = null;
            region.fixComparition = -1;
            var timeseriesRegion = data[countryName];
            var currentDate = new Date(2020, 0, 22);
            for (var j = 0; j < timeseriesRegion.length; j++) {
                if (timeseriesRegion[j].confirmed > 99 && region.startDate == null) {
                    region.startDate = new Date(currentDate);
                }

                if (timeseriesRegion[j].confirmed > 900 && region.fixComparition == -1) {
                    region.fixComparition = region.totalsInitial.length;
                }
                if (region.startDate != null) {
                    region.totalsInitial.push(timeseriesRegion[j].confirmed);
                    region.lastDate = currentDate.toLocaleDateString();
                }

                currentDate.setDate(currentDate.getDate() + 1);

            }
        }
    }
}

function intDateToDate(intDate) {
    var strDate = intDate + "";
    var year = strDate.substr(0, 4);
    var month = strDate.substr(4, 2);
    var day = strDate.substr(6, 2);

    return new Date(parseInt(year), parseInt(month, 10) - 1, parseInt(day));

}

function loadStateData(data) {
    for (var i = data.length - 1; i >= 0; i--) {
        var region = regionData[stateCodes[data[i].state]];
        if (region) {
            if (!region.totalsInitial) {
                region.totalsInitial = [];
                region.startDate = intDateToDate(data[i].date);
            }
            region.totalsInitial.push(data[i].positive);
            region.lastDate = intDateToDate(data[i].date).toLocaleDateString();
        }

    }


    for (var countryName in regionData) {
        var region = regionData[countryName];
        if (data[countryName]) {
            region.totalsInitial = [];
            region.startDate = null;
            region.fixComparition = -1;
            var timeseriesRegion = data[countryName];
            var currentDate = new Date(2020, 0, 22);
            for (var j = 0; j < timeseriesRegion.length; j++) {
                if (timeseriesRegion[j].confirmed > 99 && region.startDate == null) {
                    region.startDate = new Date(currentDate);
                }

                if (timeseriesRegion[j].confirmed > 900 && region.fixComparition == -1) {
                    region.fixComparition = region.totalsInitial.length;
                }
                if (region.startDate != null) {
                    region.totalsInitial.push(timeseriesRegion[j].confirmed);
                    region.lastDate = currentDate.toLocaleDateString();
                }

                currentDate.setDate(currentDate.getDate() + 1);

            }
        }
    }
}

$(document).ready(function () {
    $.getJSON("https://pomber.github.io/covid19/timeseries.json", function (data) {
        loadCountryData(data);
        $.getJSON("https://covidtracking.com/api/v1/states/daily.json", function (data) {
            loadStateData(data);
            var hashRegion = getHash();
            var calculatedData = recalculateForDate(2000, regionData[hashRegion]);
            app = startVue(calculatedData);
            createChart(calculatedData);
        });




    });



});

