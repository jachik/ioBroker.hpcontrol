/**
 *
 * hpcontrol adapter
 *
 *
 *  file io-package.json comments:
 *
 *  {
 *      "common": {
 *          "name":         "hpcontrol",                  // name has to be set and has to be equal to adapters folder name and main file name excluding extension
 *          "version":      "0.0.0",                    // use "Semantic Versioning"! see http://semver.org/
 *          "title":        "Node.js hpcontrol Adapter",  // Adapter title shown in User Interfaces
 *          "authors":  [                               // Array of authord
 *              "name <mail@hpcontrol.com>"
 *          ]
 *          "desc":         "hpcontrol adapter",          // Adapter description shown in User Interfaces. Can be a language object {de:"...",ru:"..."} or a string
 *          "platform":     "Javascript/Node.js",       // possible values "javascript", "javascript/Node.js" - more coming
 *          "mode":         "daemon",                   // possible values "daemon", "schedule", "subscribe"
 *          "schedule":     "0 0 * * *"                 // cron-style schedule. Only needed if mode=schedule
 *          "loglevel":     "info"                      // Adapters Log Level
 *      },
 *      "native": {                                     // the native object is available via adapter.config in your adapters code - use it for configuration
 *          "test1": true,
 *          "test2": 42
 *      }
 *  }
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('hpcontrol');
var net = require('net');

var interval;
var objectList = require(__dirname+'/objectlist.json');

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        clearInterval(interval);
        adapter.log.info('cleaned everything up...');
    } catch (e) {

    }
    callback();
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    //adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    //adapter.log.info('YYYYY stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');
    }
});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj == 'object' && obj.message) {
        if (obj.command == 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});

// Setup missing objects after start.
function setupObjects() {
    var count = Object.keys(objectList).length;
    for (var i=0; i<count; i++) {
        if (isset(objectList[i]) &&
                'type' in objectList[i] &&
                objectList[i].type!="undefined") {

            var name = objectList[i].name;
            var unit = '';
            var role = '';
            var type = '';

            switch(objectList[i].type) {
                case "TEMPERATURE":
                    unit = '°C';
                    type = 'number';
                    role = 'value.temperature';
                    break;
                case "SECONDS":
                    unit = 's';
                    type = 'number';
                    role = 'value';
                    break;
                case "IO":
                    type = 'boolean';
                    role = 'state';
                    break;
                case "IP":
                    type = 'string';
                    role = 'value';
                    break;
                case "ANALOG":
                case "ERROR":
                case "COUNTER":
                case "IMPULSE":
                    type = 'number';
                    role = 'value';
                    break;
                case "FLOWRATE":
                    unit = 'l/h';
                    type = 'number';
                    role = 'value';
                    break;
                case "HEATQUANTITY":
                    unit = 'kWh';
                    type = 'number';
                    role = 'value';
                    break;
                case "TIMESTAMP":
                    type = 'string';
                    role = 'value.datetime';
                    break;
                default:
                    adapter.log.info("Undefined type in setup: "+i+":"+objectList[i].type);
                    break;
            }
            var obj = {
                type: 'state',
                common: {
                    name: name,
                    type: type,
                    role: role,
                    unit: unit
                },
                native: {}
            }
            adapter.setObjectNotExists('values.'+i+'_'+objectList[i].name, obj);
        }
    }
}

// convert integer to IP
function int2ip (v)
{
    var part1 = v & 255;
    var part2 = ((v >> 8) & 255);
    var part3 = ((v >> 16) & 255);
    var part4 = ((v >> 24) & 255);

    return part4 + "." + part3 + "." + part2 + "." + part1;
}

function isset(o) {
    return (typeof o)!='undefined';
}

// Set object state
function setValue(index, value) {
    if (index>=0 && isset(objectList[index]) &&
        'type' in objectList[index]) {
        var state;
        switch(objectList[index].type) {
            case "TEMPERATURE":
            case "ANALOG":
                state = value/10;
                break;
            case "SECONDS":
            case "ERROR":
            case "COUNTER":
            case "FLOWRATE":
            case "HEATQUANTITY":
            case "IMPULSE":
                state = value;
                break;
            case "IP":
                state = int2ip(value);
                break;
            case "IO":
                state = value > 0;
                break;
            case "TIMESTAMP":
                var date = new Date(value * 1000);
                state = date.toLocaleDateString()+' '+date.toLocaleTimeString();
                break;
            case "ENUM":
                if (isset(objectList[index].enum)) {
                    state = objectList[index].enum[value];
                }
                else {
                    adapter.log("ENUM not defined");
                }
                break;
            default:
                adapter.log.info("Undefined type in setvalue: "+index+":"+objectList[index].type);
                break;

        }
        adapter.setState('values.'+index+'_'+objectList[index].name, {val: state, ack: true});
    }
}

// connect to heat pump and read out values
function loadValues() {
    var client = new net.Socket();
    client.connect(adapter.config.hpport, adapter.config.hpip, function () {
        var buf = Buffer.from([0,0, 11, 188]);
        client.write(buf);
        buf = Buffer.from([0, 0, 0, 0]);
        client.write(buf);
    });

    client.on('data', function (data) {
        var laenge = data.length;
        for (var i = 0; i < laenge ; i+=4) {
            var result = 0;
            result = ((data[i+3]) |
            (data[i + 2] << 8) |
            (data[i + 1] << 16) |
            (data[i] << 24));

            setValue(i/4-3, result);
        }
        adapter.log.info('Values received');
    });
}

function main() {
    setupObjects();

    //adapter.subscribeStates('*');
    loadValues();
    interval = setInterval(function () {
        loadValues();
    }, 120000);

    adapter.log.info('ioBroker.hpcontrol started');
}
