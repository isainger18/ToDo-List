//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your TodoList",
});

const item2 = new Item({
  name: "Hit + to add new Item",
});

const item3 = new Item({
  name: "<---- Hit the button to Delete Item",
});


const listSchema = {
  name: String,
  items: [itemSchema]
};

const List= mongoose.model("listItem", listSchema)

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Saved the Data");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const listTitle= req.body.list
  const itemName = new Item({
    name: item,
  });
  if(listTitle==="Today"){
    itemName.save()
    res.redirect("/")
  }
  else{
    List.findOne({name:listTitle}, function(err, foundList){
          foundList.items.push(itemName);
          foundList.save()
          res.redirect("/" + listTitle)
    })
  }

 
});

app.post("/delete", function (req, res) {
  const checkboxID = req.body.checkbox;
  const listName= req.body.listItems;

  if(listName==="Today"){
  Item.findByIdAndRemove(checkboxID, function(err){
    if(err){
      console.log(err)
    }
    else{
      res.redirect("/")
    }
  })
}
else{
  List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkboxID}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+ listName)
    }
    else{
      
    }
  })
}
});

app.get("/:customName", function(req, res){
  const customName = req.params.customName;

  List.findOne({name:customName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customName,
          items: defaultItems
        })
      list.save();
      res.redirect("/"+ customName)
      }
      else{
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })
 
 
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
