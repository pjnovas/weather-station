import axios from 'axios';
import moment from 'moment';
import 'moment-round';
import Chart from 'chart.js';
import { apiURL, refresh, deviceId } from './config.json';

Chart.defaults.scale.ticks.autoSkipPadding = 50;
Chart.defaults.global.defaultFontColor = '#fff';
Chart.defaults.global.defaultFontSize = 16;

const REFRESH_TIME = refresh * 60 * 1000; // ms

let timer, labels, timestamps;
let tempChart, humChart;
let renderActive = false;

const buildLabels = () => {
  const minPeriod = 5;

  let time = moment(new Date(), moment.ISO_8601);
  time.ceil(minPeriod, 'minutes');
  const to = time.toDate().getTime();
  const from = (new Date(to)).getTime() - (24 * 60 * 60 * 1000);

  labels = [];
  timestamps = [];

  const inc = minPeriod * 60 * 1000;
  for (let i=from; i<to; i+=inc){
    labels.push(moment(new Date(i)).format('HH:mm'));
    timestamps.push(i);
  }
};

const rawData = (data, idx) => {
  let min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;

  const dataset = timestamps.reduce( (raw, timestamp) => {
    const read = data[timestamp];
    let value = (read && read[idx]) || null;

    if (value && value > max) max = value;
    if (value && value < min) min = value;

    raw.push(value);
    return raw;
  }, []);

  return {
    dataset,
    min,
    max
  }
};

const getDataSheetStyle = _color => {
  const color = `rgba(${_color}, 1)`;
  const bgColor = `rgba(${_color}, 0.4)`;

  return {
    fill: false,
    lineTension: 0.1,
    backgroundColor: bgColor,
    borderColor: color,
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: color,
    pointBackgroundColor: '#fff',
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: color,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    spanGaps: false
  };
};

const render = data => {
  if (!renderActive || data.loading){
    return;
  }

  buildLabels();

  const temp = rawData(data.states, 0);
  const hum = rawData(data.states, 1);
  const hi = rawData(data.states, 2);

  const tempOwm = rawData(data.owm, 0);
  const humOwm = rawData(data.owm, 1);

  const ctxT = document.getElementById('temp');
  const ctxH = document.getElementById('hum');

  const opts = {
    animation : false,
    responsive: false,
    maintainAspectRatio: true
  };

  const color = '#1F365D'
  const roundBy = 5;

  const tOpts = {
    ...opts,
    scales: {
      xAxes: [{
        gridLines: {
          color
        }
      }],
      yAxes: [{
        gridLines: {
          color
        },
        ticks: {
          callback: label => label + '° C',
          max: Math.ceil(Math.max(temp.max, hi.max, tempOwm.max) / roundBy) * roundBy,
          min: Math.floor(Math.min(temp.min, hi.min, tempOwm.min) / roundBy) * roundBy,
          stepSize: 5
        }
      }]
    }
  };

  const hOpts = {
    ...opts,
    scales: {
      xAxes: [{
        gridLines: {
          color
        }
      }],
      yAxes: [{
        gridLines: {
          color
        },
        ticks: {
          callback: label => label + ' %',
          max: Math.ceil(Math.max(hum.max,humOwm.max) / roundBy) * roundBy,
          min: Math.floor(Math.min(hum.min, humOwm.min) / roundBy) * roundBy,
          stepSize: 10
        }
      }]
    }
  }

  if (tempChart){
    tempChart.destroy();
  }

  if (humChart){
    humChart.destroy();
  }

  tempChart = new Chart(ctxT, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperatura',
        data: temp.dataset,
        ...getDataSheetStyle('227,132,44')
      }, {
        label: 'Sensación Térmica',
        data: hi.dataset,
        ...getDataSheetStyle('214, 90, 57')
      }, {
        label: 'Temperatura API',
        data: tempOwm.dataset,
        ...getDataSheetStyle('189, 189, 189')
      }]
    },
    options: tOpts
  });

  humChart = new Chart(ctxH, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Humedad',
        data: hum.dataset,
        ...getDataSheetStyle('75,192,192')
      }, {
        label: 'Humedad API',
        data: humOwm.dataset,
        ...getDataSheetStyle('189, 189, 189')
      }]
    },
    options: hOpts
  });
};

let onData = () => {};

const fetchData = () => {
  render({ loading: true });

  const count = () => {

    axios.all([
      axios.get(`${apiURL}/states/${deviceId}/last24`),
      axios.get(`${apiURL}/states/owm_data/last24`)
    ])
    .then(axios.spread(function (_states, _owm) {
      render({ loading: false, states: _states.data, owm: _owm.data });
      onData && onData(_states.data);
    }))
    .catch( data => render({ loading: false, error: data.message }));

    clearTimeout(timer);
    timer = setTimeout(count, REFRESH_TIME);
  };

  count();
};

const load = (_render, _onData) => {
  renderActive = _render;
  onData = _onData || onData;

  fetchData();
};

export default {
  load
};
