var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

//DialogFlow api access token
const DialogFlowId = 'faq-ylabde'; 
const DialogFlowSession = '4c198180a7fd4cd8a02e082e13fc7a15';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const DialogFlow = require('dialogflow');
const DialogFlowClient = new DialogFlow.SessionsClient();

// Define DialogFlow session path
const DialogFlowPath = DialogFlowClient.sessionPath(DialogFlowId, DialogFlowSession);

const SocketHander = require('./socket/index');

require('dotenv').config();

var app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

var clientList = [];

io.on('connection', async (socket) => {

  const clients = await io.engine.clientsCount;
  const socketid = socket.id;
  
  console.log('a user connected with socket id '+socketid);
  
  const clientID = getNewID();
  var currentdate = new Date();
  clientList[clientID] = [];
  clientList[clientID]["socketID"] = socketid;
  clientList[clientID]["time"] = currentdate.getFullYear() + "-" + String("0"+(currentdate.getMonth()+1)).slice(-2)  + "-" 
                + String("0"+(currentdate.getDate())).slice(-2) + "  " + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" + currentdate.getSeconds();
  
  socketHander = new SocketHander();

  socketHander.connect();

  const history = await socketHander.getMessages();

  io.to(socketid).emit('history', history);
  io.to(socketid).emit('sendID', clientID);
  for(var key in clientList){
	  if (key == clientID) continue;
	  if (clientList[key]["name"] === undefined) io.to(clientList[key]["socketID"]).emit('getName');
	  io.to(socketid).emit('clients', {
		clients: clients,
		newClientID: key,
		user: clientList[key]["name"],
		time: clientList[key]["time"],
	  });
  }

  socket.on("disconnect", () => {
    console.log("a user go out with socket id "+socketid);
    io.emit("clients", {
      clients: clients - 1,
	  removeClientID: clientID,
	  user: clientList[clientID]["name"],
    });
	delete clientList[clientID];
  });

  socket.on("message", (obj) => {
	obj['clientID'] = clientID;
    socketHander.storeMessages(obj);
    io.emit("message", obj);
  });

  socket.on('clients', (obj) => {
	console.log('New user '+obj+' come in');
	clientList[clientID]["name"] = obj;
    io.emit("clients", {
      clients: clients,
	  newClientID: clientID,
	  user: obj,
	  time: clientList[clientID]["time"],
    });
  });

});

function getNewID(){
	id = Math.floor(Math.random() * 100);
	while (id in clientList){
		id = id + 1;
		if (id > 62) id = 1;
	}
	return id;
}

function talkToChatbot(){
	// The text query request.
	console.log('ID: '+DialogFlowId);
	console.log('SessionID: '+DialogFlowSession);
	const request = {
	  session: DialogFlowPath,
	  queryInput: {
		text: {
		  text: 'hello',
		  languageCode: languageCode,
		},
	  },
	};
	DialogFlowClient.detectIntent(request).then(responses => {
		console.log('Detected intent');
		const result = responses[0].queryResult;
		console.log(`  Query: ${result.queryText}`);
		console.log(`  Response: ${result.fulfillmentText}`);
		if (result.intent) {
			console.log(`  Intent: ${result.intent.displayName}`);
		} else {
			console.log(`  No intent matched.`);
		}
	})
	.catch(err => {
		console.error('ERROR:', err);
	});
}

server.listen(process.env.SOCKET_PORT);

// app.use(function (req, res, next) {
//   res.io = io;
//   next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/', index);
app.use('/users', users);

app.get('/images/*', function(req, res){
    res.sendfile('public/images/userd.png');
});

app.get('/message/record', function(req, res){
	socketHander = new SocketHander();
	socketHander.connect();
	res.setHeader('Content-type', 'application/json');
	res.setHeader('Content-Disposition', 'Attachment; filename=ChatRecord.txt');
	socketHander.printMessages(res);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
//talkToChatbot();
//socketHander = new SocketHander();
//socketHander.connect();
//test =  socketHander.login();
//console.log(test);