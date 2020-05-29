var express= require('express');
var app = express();
const path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var flash = require('express-flash');
var Book = require('./Book.model');
var Port = 3000;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 60000 }, 
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(flash());


//connect to the databases
mongoose.connect('mongodb://localhost:27017/crud',{useNewUrlParser: true,useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>  {
   console.log("we're connected!");
});


// app index page 
app.get('/',function(req,res){         
    Book.find({})
  .exec(function(err,books){
      //console.log(books);        
     res.render('index',{title: 'Hey','Books':books});     
});
});

// Page to enter new Book
app.get('/newbook',function(req,res){
    res.render('addbook',{'title':'Add New Book'});
});
    
// save data into the database
app.post('/newbook/add',function(req,res){       
    Book.insertMany([{'title':req.body.title,'author':req.body.author,'category':req.body.category}],function(err,result){      
       console.log("Inserted 1 documents into the collection");            
       req.flash('success', 'Record Added SuccessFully!');
       res.redirect('/');    
   });
});
    
// getting the form to edit the existing data 
app.get('/book/edit/:id',function(req,res){
    Book.findOne({'_id':req.params.id}).exec(function(err,book){    
        res.render('editbook',{'title':'Edit Book Information','book':book});
    });
});

//updating the record in the database
app.post('/book/update',function(req,res){   
    Book.updateOne({'_id':req.body.id},{$set: {'title':req.body.title,'author':req.body.author,'category':req.body.category}},function(err,result){
     req.flash('success', 'Record Updated SuccessFully!');           
     res.redirect('/');
    });
});

  // delete the data from the database
  
app.get('/book/delete/:id',function(req,res){
     //console.log(req.params.id);
     //res.send(req.params.id);
     Book.deleteOne({'_id':req.params.id},function(err,result){
        req.flash('success', 'Record Deleted SuccessFully!');     
        res.redirect('/');
     });
});
 
app.listen(Port,()=>{
    console.log(`app listening on port ${Port}`);
});