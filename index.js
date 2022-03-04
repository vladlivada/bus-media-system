const express = require('express');
const axios = require('axios');
const path = require('path');
var http = require("http");
const { initSocket, sendMessage } = require('./routes/websocket');
const PORT = process.env.PORT || 4202
var fs = require('fs');

var globalConfig = JSON.parse(fs.readFileSync('resources/config.json', 'utf8'));
const app = express();
app.use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index', {
    playlist: globalConfig.playlist,
    alerts: globalConfig.alerts
  }))

const server = http.createServer(app);
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
initSocket(server);

let lastAlertStop = null;

setInterval(() => {  

  axios
    .get(globalConfig.rtpi.host + globalConfig.rtpi.endpoint)
    .then(res => {
      let rtpidata = res.data;
      let visitedStops = rtpidata.times.filter(i => i.status == 3);
      if (visitedStops && visitedStops.length > 0) {
        let lastStop = visitedStops.sort((a,b) => b.index - a.index)[0]
        if (lastStop.stop.id != lastAlertStop?.stop?.id) {
          lastAlertStop = lastStop;
          let nextStop = rtpidata.times.find(s => s.index === lastStop.index + 1);
          if (nextStop) {
            console.log("urmeaza statia " + nextStop.stop.name);
            sendMessage("urmeaza statia " + nextStop.stop.name);
          }
        }
      }
    })
    .catch(err => {
      console.error(err);
    })
}, globalConfig.rtpi?.pollIntervalMs || 5000)