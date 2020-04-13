var totalInfectionEstimate = 0.5;
var ventilatorRate = 0.023;
var recoveryDays = 17;
var daysForTrend = 5;


function initData(initialData) {
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

function getFiveDayGrowthRate(data) {
    var fiveDayGrowthRate = 0;
    for (i = data.totalsInitial.length - daysForTrend; i < data.totalsInitial.length; i++) {
        fiveDayGrowthRate += data.totalsInitial[i] / data.totalsInitial[i - 1];
    }

    return fiveDayGrowthRate / daysForTrend;

}


function calculateAverageGrowth(totals, from){
    var avg = 0;
    for(var i=from;i<from+5;i++){
        avg+= totals[i] - totals[i-1];
    }
    avg =avg/5;
    return avg;
}

function calculateDailyIncrementGrowth(totals){
    var oldAvg = calculateAverageGrowth(totals, totals.length - 10);
    var newAvg = calculateAverageGrowth(totals, totals.length - 5);
  
    var longTrend = newAvg / oldAvg ;
    var daily = (longTrend-1)/5 + 1;

    console.info("oldAvg "+oldAvg+" newAvg "+ newAvg+ " longTrend "+ longTrend+ " daily "+ daily);

    return daily;
}

function calculateLongTrendTotals(totals, length, maxPopulation){
    var totalsLong = JSON.parse(JSON.stringify(totals));
    var daily = calculateDailyIncrementGrowth(totals);
    var currentIncrease = calculateAverageGrowth(totals, totals.length - 5);
    
    while(totalsLong.length<length){
        var lastTotal = totalsLong[totalsLong.length-1];
        currentIncrease *= daily;
        if(lastTotal + currentIncrease>maxPopulation){
            currentIncrease = 0;
        }
        totalsLong.push(Math.round(lastTotal+currentIncrease));
    }

    console.info(totalsLong);
    return totalsLong;
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
        data.longTermActive= data.longTermActive.slice(0, length);
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


function calculateLength(hcLimitIndex, dateLimitIndex) {
    var length = hcLimitIndex + 1;
    if (dateLimitIndex > hcLimitIndex) {
        length = dateLimitIndex;
    }
    return length;
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
    
    var longTrend = calculateLongTrendTotals(data.totalsInitial, data.totals.length, maxPopulation);
    data.longTermActive = calculateActive(longTrend);

    var hcLimitIndex = findHealthCareLimitIndex(data.activeCalculated, data.healthCareLimit);
    var dates = calculateDates(initialData.startDate, data.totals.length);
    data.healthCareLimitDate = dates[hcLimitIndex];
    data.healthCareLimitCalculated = data.totals[hcLimitIndex];
    var dateLimitIndex = findDateLimitIndex(dates, dateLimit);
    var length = calculateLength(hcLimitIndex, dateLimitIndex);
    cutToSize(data, length);

    console.info(data);

    return data;
}
