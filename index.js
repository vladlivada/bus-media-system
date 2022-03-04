const express = require('express')
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

setInterval(() => {  
  sendMessage('Urmeaza statia Muncii');
}, 60000)