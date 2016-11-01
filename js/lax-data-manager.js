var DataManager = (function () {
    
    var maxHeight = 500; //px
    var maxWidth = 1000; //px
    
    var dates, flights, vehicles;
    
    // Stored in the form
    // { YYYY-MM: { flights: XXX, vehicles: { entry: XXX, exit: XXX } } }
    var data = {};

    // Stored in the form
    // { flights: {max, min, average, range}, vehiclesIn: ...}
    var stats = {};

    function flights() {
        return flights;
    }
    
    function flightsArray() {
        var flightArr = [];
        for (var date of dates) {
            flightArr.push(data[date].flights);
        }
        return flightArr;
    }
    
    function vehiclesInArray() {
        var vin = [];
        for (var date of dates) {
            vin.push(data[date].vehicles.entry);
        }
        return vin;
    }
    
    function vehiclesOutArray() {
        var vout = [];
        for (var date of dates) {
            vout.push(data[date].vehicles.exit);
        }
        return vout;
    }
    
    function plotFlightData() {
        
        d3.select("#flights-chart")
        .selectAll("div")
        .data(flightsArray())
        .enter()
        .append("div")
        .style("width", function() { 
            return (maxWidth / dates.length);
        }).style("height", function(d) {
            var factor = stats.flights.max / maxHeight;
            return ((d / factor) + "px");
        }).html(function(d) { return "<p>" + d + "</p>"; })
        
    }
    
    function plotVehiclesInData() {
        d3.select("#vehicles-in-chart")
        .selectAll("div")
        .data(vehiclesInArray())
        .enter()
        .append("div")
        .style("width", function() {
            return (maxWidth / dates.length);  
        }).style("height", function(d) {
            var factor = stats.vehiclesIn.max / maxHeight;
            return ((d / factor) + "px");
        }).html(function(d) { return "<p>" + d + "</p>"; })
    }
    
    function plotVehiclesOutData() {
        d3.select("#vehicles-out-chart")
        .selectAll("div")
        .data(vehiclesOutArray())
        .enter()
        .append("div")
        .style("width", function() {
            return (maxWidth / dates.length);  
        }).style("height", function(d) {
            var factor = stats.vehiclesIn.max / maxHeight;
            return ((d / factor) + "px");
        }).html(function(d) { return "<p>" + d + "</p>"; })
    }
    
    function intersectArrays(a, b) {
        // Create array of concurrent dates
        var aSet = new Set;
        for (var i of a) {
            aSet.add(Object.keys(i)[0]);
        }
        var bSet = new Set;
        for (var i of b) {
            bSet.add(Object.keys(i)[0]);
        }
        var intersection = new Set([...aSet].filter(x => bSet.has(x)))
        return Array.from(intersection);
    }

    function downloadData() {
        return new Promise(function (resolve, reject) {
            flightsModule.fetchData().then(function () {
                flights = flightsModule.allCounts();
            }).then(function () {
                vehiclesModule.fetchData().then(function () {
                    vehicles = vehiclesModule.allCounts();
                }).then(function () {
                    
                    // Create array of concurrent dates
                    dates = intersectArrays(flights, vehicles);
                    
                    for (var date of dates) {
                        data[date] = dataForMonth(date);
                    }
                    
                    resolve("Success!");
                });
            });
        });
    }
    
    function processData() {
        var flightCounts = [];
        for (var i of flights) {
            var key = Object.keys(i)[0];
            var count = i[key];
            flightCounts.push(count);
        }
        
        var vehiclesInCounts = [];
        var vehiclesOutCounts = [];
        for (var i of vehicles) {
            var key = Object.keys(i)[0];
            var inCount = i[key].entry;
            var outCount = i[key].exit;
            vehiclesInCounts.push(inCount);
            vehiclesOutCounts.push(outCount);
        }
        
        stats.flights = {};
        stats.flights.max = Math.max(...flightCounts);
        stats.flights.min = Math.min(...flightCounts);
        stats.flights.average = flightCounts.reduce(function(a,b) { return a + b }) / flightCounts.length;
        stats.flights.range = stats.flights.max - stats.flights.min;
        stats.flights.count = flightCounts.length;
        
        stats.vehiclesIn = {};
        stats.vehiclesIn.max = Math.max(...vehiclesInCounts);
        stats.vehiclesIn.min = Math.min(...vehiclesInCounts);
        stats.vehiclesIn.average = vehiclesInCounts.reduce(function(a,b) { return a + b }) / vehiclesInCounts.length;
        stats.vehiclesIn.range = stats.vehiclesIn.max - stats.vehiclesIn.min;
        stats.vehiclesIn.count = vehiclesInCounts.length;
        
        stats.vehiclesOut = {};
        stats.vehiclesOut.max = Math.max(...vehiclesOutCounts);
        stats.vehiclesOut.min = Math.min(...vehiclesOutCounts);
        stats.vehiclesOut.average = vehiclesOutCounts.reduce(function(a,b) { return a + b }) / vehiclesOutCounts.length;
        stats.vehiclesOut.range = stats.vehiclesOut.max - stats.vehiclesOut.min;
        stats.vehiclesOut.count = vehiclesOutCounts.length;
        
    }
    
    // Return object with data on flights and vehicles in/out for a given month
    function dataForMonth(month) {
        var obj = {};
        
        obj.flights = flights.find(function (el) {
            return Object.keys(el)[0] === month;
        })[month];
        
        obj.vehicles = vehicles.find(function (el) {
            return Object.keys(el)[0] === month;
        })[month];
        return obj;
    }
    
    return {
        downloadData: downloadData,
        data: data,
        stats: stats,
        processData: processData,
        plotFlightData: plotFlightData,
        plotVehiclesInData: plotVehiclesInData,
        plotVehiclesOutData: plotVehiclesOutData
    }
    
})();

DataManager.downloadData().then(function () {
    DataManager.processData();
    DataManager.plotFlightData();
    DataManager.plotVehiclesInData();
    DataManager.plotVehiclesOutData();
});