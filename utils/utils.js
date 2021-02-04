const getTimeStampFormat = (daysFromNow = 0) => {
    const twoDigitsOf = (value) => {
        return ('0' + value).slice(-2)
    };
    const       today = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    const   timeStamp = `${today.getFullYear()}-${twoDigitsOf(today.getMonth()+1)}-${twoDigitsOf(today.getDate())} ${twoDigitsOf(today.getHours())}:${twoDigitsOf(today.getMinutes())}:${twoDigitsOf(today.getSeconds())}`;
    return timeStamp;
};

const getStringTimeWithoutGMT = (timeStamp) => {
    return timeStamp.toString().slice(0, timeStamp.toString().indexOf('GMT'))
};

module.exports = {
    getTimeStampFormat,
    getStringTimeWithoutGMT
};