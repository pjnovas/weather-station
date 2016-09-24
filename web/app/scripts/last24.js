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
  return timestamps.reduce( (raw, timestamp) => {
    const read = data[timestamp];
    raw.push( (read && read[idx]) || null );
    return raw;
  }, []);
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
  if (data.loading){
    return;
  }

  buildLabels();

  const temp = rawData(data.states, 0);
  const hum = rawData(data.states, 1);
  const hi = rawData(data.states, 2);

  const ctxT = document.getElementById('temp');
  const ctxH = document.getElementById('hum');

  const opts = {
    animation : false,
    responsive: false,
    maintainAspectRatio: true
  };

  const color = '#1F365D'
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
          max: 40,
          min: 0,
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
          max: 100,
          min: 0,
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
        data: temp,
        ...getDataSheetStyle('227,132,44')
      }, {
        label: 'Sensación Térmica',
        data: hi,
        ...getDataSheetStyle('214, 90, 57')
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
        data: hum,
        ...getDataSheetStyle('75,192,192')
      }]
    },
    options: hOpts
  });
};

const fetchData = () => {
  render({ loading: true });

  const count = () => {
    axios.get(`${apiURL}/states/${deviceId}/last24`)
      .then( res => render({ loading: false, states: res.data }))
      .catch( data => render({ loading: false, error: data.message }));

    clearTimeout(timer);
    timer = setTimeout(count, REFRESH_TIME);
  };

  count();
};

const load = () => {
  fetchData();
};

export default {
  load
};
