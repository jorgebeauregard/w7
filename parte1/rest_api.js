const Sequelize = require('sequelize');

var database = 'shopcar';
var user = 'Paco';
var password = 'psql';
var host = 'localhost';
var dbType = 'postgres';


const sequelize = new Sequelize(database,user,password,
    {
        host: host, 
        dialect: dbType,
        define:{
            freezeTableName: true
        }
    })
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Productos = sequelize.define('productos',{
    codigo: {
        type: Sequelize.INTEGER
    },
    nombre: {
        type: Sequelize.STRING
    },
    precio:{
        type: Sequelize.FLOAT
    },
    exist:{
        type: Sequelize.INTEGER
    }
});

// call the packages
var express = require('express') //for server thingies
var cors = require('cors') //Http requests
var app = express(); //instantiate express
app.use(cors()) //links cors with the app

var bodyParser = require('body-parser'); //parses incoming requests 

// config app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
var port = process.env.PORT || 8081; 

// routes for our api
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();  // make sure we go to the next routes
});

router.get('/', function(req, res) {
 res.json({ message: 'yahoo!! welcome to our api !' });
});
//Estados
    router.route('/listaEstados').get(function(req,res){
        return sequelize.query("SELECT sepomex.estado from sepomex GROUP BY(sepomex.estado)").spread((results,metadata) =>{
            res.json(results);
        })
    })

    router.route('/municipioPorEstado').get(function(req,res){
        return sequelize.query("SELECT DISTINCT sepomex.estado, sepomex.municipio, sepomex.idMunicipio FROM sepomex ORDER BY sepomex.estado, sepomex.idMunicipio").spread((results,metadata)=>{
            res.json(results);
        })
    })

    router.route('/municipioPorEstado/:idEstad').get(function(req,res){
        return sequelize.query('SELECT DISTINCT sepomex.estado, sepomex.municipio, sepomex.idMunicipio FROM sepomex  WHERE sepomex.estado = \'' + req.params.idEstad  +  '\' ORDER BY sepomex.estado, sepomex.idMunicipio').spread((results,metadata) => {
            res.json(results);
        })
    })

    router.route('/coloniaPorMunicipioEstado').get(function(req,res){
        return sequelize.query("SELECT sepomex.asentamiento, sepomex.municipio, sepomex.estado FROM sepomex WHERE sepomex.tipo = 'Colonia' ORDER BY  sepomex.estado, sepomex.municipio, sepomex.asentamiento").spread((results,metadata)=>{
            res.json(results);
        })
    })


    router.route('/coloniaPorMunicipioEstado/:idEstado/:idMunicipio').get(function(req,res){
        return sequelize.query('SELECT sepomex.municipio, sepomex.estado, sepomex.asentamiento, sepomex.tipo FROM sepomex WHERE  sepomex.estado = \'' + req.params.idEstado + '\' AND sepomex.municipio = \'' + req.params.idMunicipio + '\' ORDER BY sepomex.estado, sepomex.municipio').spread((results,metadata) => {
            res.json(results);
        })
    })

//CRUD Productos
//Create
router.route('/createProduct').post(function(req,res){
    console.log("REQUEST: ")
    console.log(req)
    console.log("LAKSJFALSKFJASLKFJALS")
    console.log(req.body.codigo)
    console.log(req.body.nombre)
    console.log(req.body.precio)
    console.log(req.body.exist)
    console.log("LAKSJFALSKFJASLKFJALS")
    return Productos.create({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        precio: req.body.precio,
        exist:  req.body.exist,
    })
    .then(newItem => res.status(201).send(newItem))
    .catch(error => res.status(400).send(error))
})

//Get all
router.route('/productos').get(function(req,res){
    return Productos.findAll().then(products => {
        res.json(products)
    })
})


router.route('/productos/:id')
.get(function(req,res){//Read
    console.log("Get!!")
    return Productos.findById(req.params.id,{})
    .then(foundProduct => {
        if(!foundProduct){
            return res.status(404).send({
                message: 'Product nof found'
            });
        }
        else{
            return res.status(200).send(foundProduct)
        }
    })
})
.put(function(req,res){//Update
    return Productos.findById(req.params.id,{})
    .then(foundProduct => {
        if(!foundProduct){
            return res.status(404).send({
                message: 'Product nof found'
            });
        }
        else{
            return foundProduct.update({
                nombre: req.body.nombre || foundProduct.nombre,
                precio: req.body.precio || foundProduct.precio,
                exist: req.body.exist || foundProduct.exist,
            })
            .then(() => res.status(200).send(foundProduct))
            .catch(error => res.status(400).send(error))
        }
    })
    .catch(error => res.status(400).send(error))
})
.delete(function(req,res){//Delete
    console.log("DELETE FUNCTION")
    return Productos.findById(req.params.id,{})
    .then(foundProduct => {
        if(!foundProduct){
            return res.status(404).send({
                message: 'Product not found'
            });
        }
        else{
            foundProduct.destroy()
            .then(() => res.status(200).send(
                {message: 'Product deleted successfully'}
            ))
            .catch(error => res.status(400).send(error))
        }
    })
    .catch(error => res.status(400).send(error))
})

app.use('/api', router);
app.listen(port);
console.log('Magic happens on port: ' + port);
