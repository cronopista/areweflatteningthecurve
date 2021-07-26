var totalInfectionEstimate = 0.5;
var recoveryDays = 17;
var daysForTrend = 5;


function initData(initialData) {
    var data = JSON.parse(JSON.stringify(initialData));

  
 
    data.totals = [];
    data.activeReal = [];
    data.activeCalculated = [];
    data.labels = [];


    return data;
}

function getFiveDayGrowthRate(data) {

    var trendTotal=0;
    var rate=0;
    for (i = 1; i < data.totalsInitial.length; i++) {
        trendTotal+=i+1;
        rate+= (data.totalsInitial[i] / data.totalsInitial[i - 1])*(i+1);
    }

    return rate / trendTotal;

}


function calculateTotals(currentTotal, fiveDayGrowthRate, maxPopulation, totalsInitial) {
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

    for (var i = 0; i < recoveryDays; i++) {
        totals.push(currentTotal);
    }

    return totals;
}

function calculateActive(totals) {
    var active = [];
    for (i = 0; i < totals.length; i++) {
        var recoveries = 0;
        if (i > recoveryDays) {
            recoveries = totals[i - recoveryDays];
        }
        active.push(totals[i] - recoveries);
    }

    return active;
}

function calculateLabels(startDate, length) {
    var labels = [];
    var currentDate = new Date(startDate);
    for (var i = 0; i < length; i++) {
        labels.push(currentDate.toLocaleDateString());
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return labels;
}

function calculateDates(startDate, length) {
    var dates = [];
    var currentDate = new Date(startDate);
    for (var i = 0; i < length; i++) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}


function cutToSize(data, length) {
    if (length < data.labels.length) {
        data.labels = data.labels.slice(0, length);
        data.activeReal = data.activeReal.slice(0, length);
        data.activeCalculated = data.activeCalculated.slice(0, length);
    }
}

function findHealthCareLimitIndex(activeCalculated, healthCareLimit) {
    for (var i = 0; i < activeCalculated.length; i++) {
        if (activeCalculated[i] > healthCareLimit) {
            return i;
        }
    }

    return activeCalculated.length - 1;
}

function findDateLimitIndex(dates, dateLimit) {
    for (var i = 0; i < dates.length; i++) {
        if (dates[i] > dateLimit) {
            return i;
        }
    }

    return dates.length - 1;
}






function calculate(initialData, dateLimit) {
    var data = initData(initialData);

    var fiveDayGrowthRate = getFiveDayGrowthRate(data);
    console.info("5 day growth rate " + fiveDayGrowthRate);
    var currentTotal = data.totalsInitial[data.totalsInitial.length - 1];
    var maxPopulation = data.population * totalInfectionEstimate;


    data.totals = calculateTotals(currentTotal, fiveDayGrowthRate, maxPopulation, data.totalsInitial);
    currentTotal = data.totals[data.totals.length - 1];


    data.activeCalculated = calculateActive(data.totals);
    data.activeReal = data.activeCalculated.slice(0, data.totalsInitial.length);
    data.labels = calculateLabels(initialData.startDate, data.totals.length);

    

    var hcLimitIndex = findHealthCareLimitIndex(data.activeCalculated, data.healthCareLimit);
    var dates = calculateDates(initialData.startDate, data.totals.length);
    data.healthCareLimitDate = dates[hcLimitIndex];
    data.healthCareLimitCalculated = data.totals[hcLimitIndex];
    data.healthCareLimitIndex = hcLimitIndex;
    var dateLimitIndex = findDateLimitIndex(dates, dateLimit);
   
    cutToSize(data, dateLimitIndex);

    console.info(data);

    return data;
}
