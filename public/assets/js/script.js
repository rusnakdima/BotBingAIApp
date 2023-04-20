const socket = io();

const chatsList = document.getElementById('chats-list');
const chatMessWindow = document.getElementById('chat-mess-window');

const showMenu = document.getElementById('showMenu');
const hideMenu = document.getElementById('hideMenu');

showMenu.addEventListener('click', () => {
  document.getElementById('menu').style.display = 'flex';
});

hideMenu.addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
});

var roomId = '';

function reloadChatList(){
  // Загрузка данных из JSON-файла
  chatsList.innerHTML = '';
  fetch('./assets/js/chat.json')
    .then(response => response.json())
    .then(data => {
      for (var i = 0; i < Object.keys(data).length; i++) {
        // console.log(Object.keys(data)[i])
        var div = document.createElement('div');
        div.setAttribute("data-value", Object.keys(data)[i]);
        div.addEventListener("click", (event) => {
          // console.log(event.target.attributes[0].value, roomId)
          roomId = event.target.attributes[0].value;
          setColBack();
          reloadMessChat();
          if(document.querySelector("body").offsetWidth <= 768){
            document.getElementById('menu').style.display = 'none';
            show = false;
          }
        });
        var span = document.createElement('span');
        span.setAttribute("data-value", Object.keys(data)[i]);
        span.setAttribute('class', 'flex flex-row text-center justify-center w-10/12');
        span.innerHTML = data[Object.keys(data)[i]]["name"];
        div.append(span);
        var button = document.createElement('button');
        button.innerHTML = "Del";
        button.setAttribute("data-value", Object.keys(data)[i]);
        button.addEventListener("click", (event)=>{
          delChat(event.target.attributes[0].value);
        })
        div.append(button)
        div.setAttribute("class", "styleBut flex flex-row gap-x-2 text-center justify-center");
        chatsList.append(div);
      }
    });

    /* if(roomId != ''){
      setColBack();
    } */
}
function setColBack(){
  var divAll = document.querySelectorAll("#chats-list div");
  for (var i = 0; i < divAll.length; i++) {
    divAll[i].classList = "styleBut flex flex-row gap-x-2 text-center justify-center";
  }
  document.querySelector("div[data-value="+roomId+"]").classList = "styleBut flex flex-row gap-x-2 text-center justify-center bg-gray-400 dark:bg-gray-700";
}

function reloadMessChat(){
  chatMessWindow.innerHTML = '';
  if(roomId != ''){
    fetch(`./assets/js/${roomId}.json`)
      .then(response => response.json())
      .then(dataMess => {
        if(Object.keys(dataMess).length > 0){
          // console.log(roomId, dataMess["messages"])
          for (var j = 0; j < dataMess["messages"].length; j++){
            var div1 = document.createElement("div");
            div1.innerHTML = "<div class='flex flex-row w-full gap-x-2'><span class='font-bold flex flex-col text-left w-1/6'>" + dataMess["messages"][j]?.author + "</span><pre class='flex flex-col w-5/6 whitespace-pre-wrap text-left pr-5'>" + dataMess["messages"][j]?.message + "</pre></div>";
            div1.setAttribute("class", "styleMess")
            chatMessWindow.append(div1);
            var hr = document.createElement("hr");
            chatMessWindow.append(hr);
          }
          var linkReqAll = document.querySelectorAll("[data-link='req']");
          // console.log(linkReqAll);
          for(var i = 0; i < linkReqAll.length; i++) {
            linkReqAll[i].addEventListener("click", (event) => {
              console.log(event.target.innerText)
              document.querySelector("#questionField").value = event.target.innerText;
              sendRequest();
            });
          }
          setTimeout(() => {
            chatMessWindow.scrollTop = chatMessWindow.scrollHeight;
          }, 200);
        } else {
          var div1 = document.createElement("div");
          div1.innerHTML = "<div class='flex flex-row gap-x-2'><span class='flex w-1/3 justify-end'>Server not responding</span></div>";
          div1.setAttribute("class", "styleMess")
          chatMessWindow.append(div1);
          var hr = document.createElement("hr");
          chatMessWindow.append(hr);
        }
      });
  }
}

reloadChatList();

function createNew(){
  chatMessWindow.innerHTML = '';
  roomId = '';
}

document.addEventListener('keydown', (event) => {
  if(event.key === "Enter"){
    document.getElementById("questionField").focus();
  }
});

document.querySelector("#questionField").addEventListener("keydown", (event)=>{
  if(!event.shiftKey){
    if(event.key === "Enter"){
      sendRequest()
    }
  }
})

document.querySelector("#butSend").addEventListener("click", () => {
  sendRequest();
})

function sendRequest(){
  var text = document.querySelector("#questionField").value;
  socket.emit("request", roomId, text);
  document.querySelector("#questionField").value = '';
}

socket.on("update", (data) => {
  // console.log(data)
  roomId = data;
  reloadChatList();
  reloadMessChat();
})

function delChat(id) {
  socket.emit("delChat", id);
}