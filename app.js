Chart.defaults.global.pointHitDetectionRadius = 1;

var app;




function createChart(data) {
    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    var ctx = document.getElementById('growthChart');
    var chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Active cases',
            data: data.activeReal,
            backgroundColor:
                'rgba(0, 0, 100, 0.4)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 2,
            pointRadius: 0
        }, {
            label: 'Active case projection',
            data: data.activeCalculated,
            backgroundColor:
                'rgba(0, 0, 100, 0.1)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 2,
            pointRadius: 0
        }]
    };
    if (!data.activeCalculated10daysAgo) {
        chartData.datasets = chartData.datasets.splice(0, 2);
        
    }

    var options = {
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
        }
    };

   

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options
    });
}


function createDailyIncreaseChart(initialData) {



    document.getElementById('growthChart').remove();
    document.getElementById('chartParent').innerHTML = ' <canvas id="growthChart"></canvas>';
    var ctx = document.getElementById('growthChart');

    var data = JSON.parse(JSON.stringify(initialData));
    data.labels = calculateLabels(data.startDate, data.totalsInitial.length);
    data.increase = [0];
    for (var i = 1; i < data.totalsInitial.length; i++) {
        if (data.totalsInitial[i] > data.totalsInitial[i - 1]) {
            data.increase.push(data.totalsInitial[i] - data.totalsInitial[i - 1]);
        } else {
            data.increase.push(0);
        }
    }

    var chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Daily increase to date',
            data: data.increase,
            backgroundColor:
                'rgba(0, 0, 100, 0.4)',
            borderColor:
                'rgba(0, 0, 100, 1)',
            borderWidth: 2,
            pointRadius: 0
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {

                        return "Increase: " + tooltipItem.yLabel.toLocaleString();
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
            }
        }
    });
}

function recalculateForDate(days, initialData) {

    var dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);
    var data = calculate(initialData, dateLimit);

    return data;

}





function startVue(data) {
    return new Vue({
        el: '#mainApp',
        data: {
            activeChart: 'nearFuture',
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
                    app.$data.activeChart = 'nearFuture';
                    app.$data.activeRegion = getHash();
                    var newData = recalculateForDate(50, regionData[app.$data.activeRegion]);
                    app.$data.region = newData;
                    createChart(newData);
                }
            );
        },
        methods: {
            
            nearFuture: function (event) {
                app.$data.activeChart = 'nearFuture';
                createChart(recalculateForDate(50, regionData[app.$data.activeRegion]));
            },
            dailyIncrease: function () {
                app.$data.activeChart = 'dailyIncrease';
                createDailyIncreaseChart(regionData[app.$data.activeRegion]);
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
        $.getJSON("https://api.covidtracking.com/v1/states/daily.json", function (data) {
            loadStateData(data);
            var hashRegion = getHash();
            var calculatedData = recalculateForDate(50, regionData[hashRegion]);
            app = startVue(calculatedData);
            createChart(calculatedData);
        });




    });



});

