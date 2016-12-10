

var express    = require('express');        // call express
var app        = express();  
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser')
var mongoose=require("mongoose");
var formidable = require('formidable');
var util=require("util");
 
var Schema = mongoose.Schema;
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


mongoose.connect("mongodb://localhost/agrobook");

var problemaSchemaJSON={
	descripcion:String,
	usuario:String,
}

var respuestaSchemaJSON={
	idproblema:String,
	usuario:String,
	descripcion:String
}

var problema_schema=new Schema(problemaSchemaJSON);
var respuesta_schema=new Schema(respuestaSchemaJSON);
var Respuesta = mongoose.model("Respuesta",respuesta_schema);
var Problema = mongoose.model("Problema",problema_schema);
var new_problem;
var fs=require("fs");



app.post("/respuestas",function(req,res){

	var respuesta= new Respuesta({
		descripcion:req.body.descripcion,
		idproblema:req.body.idproblema,
		usuario:req.body.usuario
	});
	respuesta.save(function(err,resp){
		if(!err){
			res.send(JSON.stringify(resp));
			
		}
	});
	
});


app.get("/respuestas/:id",function(req,res){

		Respuesta.find({"idproblema":req.params.id},function(err,doc){
		
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({"respuestas":doc}));

	});

});



io.on('connection',function(socket){
console.log("Llego emit");


	socket.on('nuevo_problema', function(data) {
  

	socket.broadcast.emit('agregar_problema',data);

  	});

  	socket.on('nueva_respuesta', function(data) {
   		console.log("nueva respuesta");

	socket.broadcast.emit('agregar_respuesta',data);

  	});
	
});


app.post("/problemas",function(req,res){
	var form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, function(err, fields, files) {

		var problema=new Problema({
			descripcion:fields.descripcion,
			usuario:fields.usuario
		});
		problema.save(function(err,prob){
			if(!err){
				
				var extension=files.imagen.name.split(".").pop();
				fs.rename(files.imagen.path,"./public/images/"+prob._id+"."+extension);
				res.send(JSON.stringify(prob));
			} else {
				console.log("error");
			}
		});


		
    	
    });
  

});

app.get("/problemas",function(req,res){
	Problema.find({},function(err,doc){
		console.log("Llego");
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({"problemas":doc}));

	});
});







http.listen(port,function(){
	console.log("Servidor funcionando en el puerto"+port);
});
