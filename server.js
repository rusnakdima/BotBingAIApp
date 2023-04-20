import { BingChat } from 'bing-chat'; 
import { oraPromise } from 'ora';
import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import fs from 'fs';
import { config } from 'dotenv';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

config();

const COOKIE = process.env.COOKIE;

const api = new BingChat({
  cookie: COOKIE,
  debug: true,
});

const requests = {};
var roomId = '';

app.use(express.static('public'))
app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(__dirname + '/node_modules/socket.io/client-dist/socket.io.js');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

function genId(){
  var string = '';
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for(var i = 0; i < 25; i++){
    string += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return string;
}

async function saveRequest(roomId, request) {
  if (!requests[roomId]) {
    requests[roomId] = {};
  }
  requests[roomId] = request;
}

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on("request", async (roomId, question) => {
    console.log(question)
    var data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "./public/assets/js/chat.json"), "utf-8"));
    // console.log(data)
    var createRoom = true;
    for (var i = 0; i < Object.keys(data).length; i++) {
      // console.log(Object.keys(data)[i], roomId)
      if(Object.keys(data)[i] == roomId){
        createRoom = false;
      }
    }
    if(createRoom) {
      roomId = genId();
      data[roomId] = {"name": question};
      fs.writeFileSync(path.join(process.cwd(), `./public/assets/js/chat.json`), JSON.stringify(data));
    }
    var dataMess = {};
    if(fs.existsSync(path.join(process.cwd(), `./public/assets/js/${roomId}.json`)))
      dataMess = JSON.parse(fs.readFileSync(path.join(process.cwd(), `./public/assets/js/${roomId}.json`), "utf-8"));
    else dataMess["messages"] = [];
    dataMess["messages"].push({"author": "me", "message": question});
    fs.writeFileSync(path.join(process.cwd(), `./public/assets/js/${roomId}.json`), JSON.stringify(dataMess));
    dataMess = JSON.parse(fs.readFileSync(path.join(process.cwd(), `./public/assets/js/${roomId}.json`), "utf-8"));
    // console.log(dataMess)
    socket.emit("update", roomId);
    var request = (requests[roomId]) ? requests[roomId]: {};
    try{
      request = await oraPromise(api.sendMessage(question, request),{
        text: question
      });
      await saveRequest(roomId, request);
    } catch (err){
      console.error(err);
    }
    if(request["text"] != undefined && request["text"] != ''){
      request["text"] = request["text"].replace(/<[^>]*>/g, function(match) {
        return '< ' + match.replace(/<|>/g, "") + ' >';
      });
    }
    console.log(request);

    var sourceAttr = '';
    //get data from source attributions
    if (request["detail"]) {
      if (request["detail"]["sourceAttributions"]) {
        for (var i = 0; i < request["detail"]["sourceAttributions"].length; i++) {
          sourceAttr += '<a target="_blank" href=' + request["detail"]["sourceAttributions"][i]["seeMoreUrl"] + '>' + (i + 1) + ') ' + request["detail"]["sourceAttributions"][i]["providerDisplayName"] + '</a>\n';
        }
        if (request["detail"]["sourceAttributions"].length == 0) sourceAttr = "NOT FOUND";
      } else sourceAttr = "NOT FOUND";
    } else sourceAttr = "NOT FOUND";
    request["text"] += '\n\nSources:\n' + sourceAttr + '\n';
    var suggestRes = '';
    //get data from suggested requests
    if (request["detail"]) {
      if (request["detail"]["suggestedResponses"]) {
        for (var i = 0; i < request["detail"]["suggestedResponses"].length; i++) {
          suggestRes += '<a href="#" data-link="req">' + (i + 1) + ') ' + request["detail"]["suggestedResponses"][i]["text"] + '</a>\n';
        }
        if (request["detail"]["suggestedResponses"].length == 0) suggestRes = "NOT FOUND";
      } else suggestRes = "NOT FOUND";
    } else sourceAttr = "NOT FOUND";
    request["text"] += 'Suggested responses:\n' + suggestRes;

    dataMess["messages"].push({"author": request["author"], "message": request["text"]});
    fs.writeFileSync(path.join(process.cwd(), `./public/assets/js/${roomId}.json`), JSON.stringify(dataMess));
    socket.emit("update", roomId);
  });

  socket.on("delChat", (roomId) => {
    var data = JSON.parse(fs.readFileSync(path.join(process.cwd(), "./public/assets/js/chat.json"), "utf-8"));
    delete data[roomId];
    fs.unlinkSync(path.join(process.cwd(), `./public/assets/js/${roomId}.json`));
    fs.writeFileSync(path.join(process.cwd(), `./public/assets/js/chat.json`), JSON.stringify(data));
    socket.emit("update", '');
  });
}); 