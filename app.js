
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _=require('lodash');
const date = require(__dirname +'/date');

const day = date.getDate();

const customPort = 3000;



const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
//connecting to mongoose server
mongoose.connect('mongodb+srv://@cluster0.zi1pp.mongodb.net/toDolistDB', {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false });
//creating a database schema
const itemSchema = mongoose.Schema({
    name:String
});
//creating  model
const Item = mongoose.model('Item',itemSchema);
//Instentiating dummy data to the object schema
const meditate= new Item({
    name:"Meditate"
});
const jog= new Item({
    name:"Jog"
});
const exercise= new Item({
    name:"Exercise"
});

const itemArray = [meditate,jog,exercise];

// creating a custom list schema
const listSchema = mongoose.Schema({
    name:String,
    items:[itemSchema]

});

const List = mongoose.model('List',listSchema);



//Quering the dummy data
app.get('/', function(req, res){

    Item.find(function(err,items){
        if(items.length===0){
            Item.insertMany(itemArray,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully added documents");
                }
            });
            res.redirect('/');

        }else{
            res.render("list",{listTitle:day, newItems: items});
        }
        
    });
    
});
//Creating an item 
app.post('/', function (req, res){
    
    const item = req.body.addItem;
    const createdList = req.body.list.slice(0,-1);

    const inputItem = new Item({
        name:item
    });
   
    if(createdList === day){
        inputItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:createdList},function(err,savedList){
            if(!err){
                savedList.items.push(inputItem);
                savedList.save();
                res.redirect("/"+ createdList);
            }
        });
    }
    
  
});
//Deleting the checked item
app.post('/delete',function(req,res){
     
    const checkedBoxId= req.body.checkedbox;
    const listName = req.body.listName;

    if(listName ===day){
        Item.findByIdAndDelete(checkedBoxId,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully deleted document");
                res.redirect('/');
            }
        });

    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedBoxId}}}, function(err,savedlist){
            if(!err){
                res.redirect('/'+ listName);
            }

        });
    }
   

});
//creating a custom list
app.get('/:newListName', function(req,res){

   const newListName = _.capitalize(req.params.newListName);

   List.findOne({name:newListName},function(err,savedList){
       if(!err){
           if(!savedList){
            const list = new List({
                name:newListName,
                items:itemArray
            });
        
            list.save();
            res.redirect('/'+newListName);

           }else{
            res.render("list",{listTitle:savedList.name, newItems:savedList.items});
           }
        }
    });
});
app.get('/about',function(req,res){
    res.render('about');
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = customPort;
}

app.listen(port, function(){
    console.log('The server has started');
});

