//modules
const {
    format,
    createLogger,
    transports
} = require('winston');

const {
    combine,
    printf,
    timestamp,
    prettyPrint
} = format;


const timezoned = () => {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Africa/Nairobi'
    });
}


//formar
const myFormat = combine(timestamp({
    format: timezoned
}), prettyPrint(), printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase().padEnd(7)}]: ${info.message}`
}))



//logger and transport
const logger = createLogger({
    format: myFormat,
    transports: [
        new transports.Console({
            level: 'debug'
        }), //console the message
        new transports.File({
            filename: 'app.log'
        }) //save to file
    ]
});

module.exports = logger