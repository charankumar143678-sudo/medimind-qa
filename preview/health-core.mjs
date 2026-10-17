/**
 * Phase B preview-only pure calculations.
 * Never infers readings; input is an array of explicitly user-entered observations.
 * No medical conclusion or healthcare recommendation is emitted.
 */
export const SUPPORTED = Object.freeze({
  sys: { unit: 'mmHg', min: 50, max: 300 },
  dia: { unit: 'mmHg', min: 30, max: 200 },
  pulse: { unit: 'bpm', min: 20, max: 240 },
  temp: { unit: '°C', min: 30, max: 45 },
  oxy: { unit: '%', min: 50, max: 100 },
  glucose: { unit: 'mmol/L', min: 1, max: 40 },
  weight: { unit: 'kg', min: 1, max: 450 }
});
export function validateObservation(input, now=Date.now()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  if (!Object.prototype.hasOwnProperty.call(SUPPORTED, input.metric)) return null;
  const limits = SUPPORTED[input.metric];
  if (typeof input.value !== 'number' || !Number.isFinite(input.value) ||
      input.value < limits.min || input.value > limits.max) return null;
  if (typeof input.time !== 'string' || !Number.isFinite(now)) return null;
  const time = Date.parse(input.time);
  if (!Number.isFinite(time) || new Date(time).toISOString() !== input.time ||
      time > now + 60000) return null;
  return Object.freeze({metric:input.metric, value:input.value, time:input.time, unit:limits.unit});
}
export function filterObservations(observations, metric, period, now=Date.now()) {
  if (!Object.prototype.hasOwnProperty.call(SUPPORTED,metric)) throw new RangeError('Unsupported metric');
  // Explicit rolling windows, not calendar month/year (timezone-independent durations).
  const windows = {day:86400000,week:604800000,month:2592000000,year:31536000000};
  if (!Object.prototype.hasOwnProperty.call(windows,period)) throw new RangeError('Unsupported period');
  if (!Number.isFinite(now)) throw new TypeError('Invalid clock');
  return observations.map(x=>validateObservation(x,now)).filter(x => x && x.metric===metric &&
      Date.parse(x.time)<=now && Date.parse(x.time)>=now-windows[period])
    .sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
}
export function summarizeObservations(observations,metric,period,now=Date.now()) {
  const points=filterObservations(observations,metric,period,now);
  if (!points.length) return {count:0,min:null,max:null,mean:null,latest:null,points:[]};
  const values=points.map(p=>p.value);
  const sum=values.reduce((a,b)=>a+b,0);
  return {count:points.length,min:Math.min(...values),max:Math.max(...values),
    mean:sum/points.length,latest:points.at(-1),points};
}
export function bmi(weightKg,heightMeters) {
  if (typeof weightKg!=='number'||typeof heightMeters!=='number'||
      !Number.isFinite(weightKg)||!Number.isFinite(heightMeters)||
      weightKg<=0||weightKg>450||heightMeters<0.5||heightMeters>2.5) return null;
  return weightKg/(heightMeters*heightMeters);
}
