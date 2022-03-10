const express = require('express');
const axios = require('axios');
const path = require('path');
var http = require("http");
const { initSocket, sendMessage } = require('./routes/websocket');
const PORT = process.env.PORT || 4202
var fs = require('fs');

var globalConfig = JSON.parse(fs.readFileSync('resources/config.json', 'utf8'));
if (globalConfig == null || globalConfig.rtpi == null || globalConfig.rtpi.host == null) {
  throw "Unable to read config data, please check config";
}
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
let requestConfig = {
  headers: globalConfig.rtpi.headers
}

setInterval(() => {  
  axios
    .get(globalConfig.rtpi.host + globalConfig.rtpi.endpoint, requestConfig)
    .then(res => {
      let rtpidata = res.data;
      let visitedStops = rtpidata.times.filter(i => i.status == 3);
      if (visitedStops && visitedStops.length > 0) {
        let lastStop = visitedStops.sort((a,b) => b.index - a.index)[0]
        if (lastStop.stop.id != lastAlertStop?.stop?.id) {
          lastAlertStop = lastStop;
          let nextStop = rtpidata.times.find(s => s.index === lastStop.index + 1);
          if (nextStop) {
            console.log("Sending new stop " + nextStop.stop.code);
            sendMessage(JSON.stringify({
              type: "station",
              id: nextStop.stop.code
            }))
          }
        }
      }
    })
    .catch(err => {
      console.error("Error pinging RTPI server: ", err.message)
    })
}, globalConfig.rtpi?.pollIntervalMs || 5000)