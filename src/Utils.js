import moment from 'moment';

export const nearestMinutes = (interval, someMoment) => {
    const roundedMinutes = Math.round(someMoment.clone().minute() / interval) * interval;
    return someMoment.clone().minute(roundedMinutes).second(0);
}

export const nearest15min = () => nearestMinutes(15, moment.utc());
