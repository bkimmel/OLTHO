//...the Taxonomy helper is just @getify's OLOO concept wrapped up in
//an object that collects and classifies the prototype links between objects

//I chose to model biological classification, because it is complicated (7 cardinal layers)
//...and it has to change a lot to reflect new knowledge about species... so it's
//..a good model to study when considering this sort of thing.

var Taxonomy = {
  //TODO: A lot more things, e.g. allowing user to set/reset order dynamically..
  //..hardening stamp to not "break" if user sends something not in order, etc.
  //...this is just a concept exercise...
  order: ["Kingdom","Phylum","Class","Order","Family","Genus","Species"],
  //stamp() is the real crux of the Taxonomy helper...
  stamp: function stamp(e) {
    var _order = this.order.slice();
    var _parent = {_root: true};
    var _ret;
    var _stampstore = [];
    while(_order.length)
    {
       var i = _order.shift();
       if(!(this[i]))
       {
         this[i] = {};
       }
       if(this[i][(e[i] || "")])
       {
          _parent =  this[i][(e[i] || "")];
          _stampstore.push([i, (e[i] || "")]);
       }
       else
       {
          this[i][(e[i] || "")] = Object.create(_parent);
          this._store[i] = this._store[i] || {};
          this._store[i][(e[i] || "")] = [];
          _stampstore.push([i, (e[i] || "")]);
          _parent = this[i][(e[i] || "")];
          this[i][(e[i] || "")]._taxonomykey = {};
          this[i][(e[i] || "")]._taxonomykey[i] = e[i];
       }
    }
    _ret = Object.create(_parent);
    while( _stampstore.length )
    {
        var x = _stampstore.shift();
        this._store[x[0]][x[1]].push(_ret);
        if (!_stampstore.length)
        {
           _ret[x[0]] =  x[1];
        }
    }
    return _ret;
  },
  //returns ordered array
  climb: function climb(e) {
    //e.g. == {Class: Mammalia}
    var _ret = [];
    var _props = Object.getOwnPropertyNames(e);
    while (_props.length)
    {
       var i = _props.shift();
       if(this.order.indexOf(i) > -1 && this[i][e[i]])
       {
         var _look = this[i][e[i]];
         while( !_look.__proto__.hasOwnProperty("_root") )
         {
           _ret.unshift(_look.__proto__);
           _look = _look.__proto__;
         }
       }
    }
    return _ret;
  },
  //returns array of all instances
  gather: function gather(e) {
    //e.g. == {Class: Mammalia}
    var _ret = [];
    var _get = Object.getOwnPropertyNames(e)[0];
    return this._store[_get][e[_get]];
  },
  _store: {
  }
};

var pig = {
  Kingdom: "Animalia",
  Phylum: "Chordata",
  Class: "Mammalia",
  Order: "Artiodactyla",
  Family: "Suidae",
  Genus: "Sus",
  Species: "Sus_domestica"
};

var milo = Taxonomy.stamp(pig);
milo.name = "Milo";

//So let's fill in some stuff we know about mammals:
Taxonomy.Class.Mammalia.blooded = "Warm";
Taxonomy.Class.Mammalia.hasHair = "Yes";
Taxonomy.Class.Mammalia.hasVenom = "No";
Taxonomy.Class.Mammalia.fly = function(){console.log("Sorry, no");};
//And some things about pigs:
Taxonomy.Species.Sus_domestica.oink = function(){console.log("Oink, oink...");};
Taxonomy.Species.Sus_domestica.wallowsIn = "Mud";
//And something about animals:
Taxonomy.Kingdom.Animalia.isalive = "Yes";

console.log(milo.blooded);
milo.fly(); // logs -> "Sorry, no"
milo.oink(); // logs -> Oink, oink...

var wilbur = Taxonomy.stamp(pig);
wilbur.name = "Wilbur";
console.log(wilbur.blooded); //"Warm"
console.log(wilbur.wallowsIn); //"Mud"
console.log(wilbur.hasVenom); //"No"

//Here's a species that shares Class: Mammal with pigs
var cat = {
  Kingdom: "Animalia",
  Phylum: "Chordata",
  Class: "Mammalia",
  Order: "Carnivora",
  Family: "Felidae",
  Genus: "Felis",
  Species: "Felis_catus"
};

var felix = Taxonomy.stamp(cat);
felix.name = "Felix";
console.log(felix.blooded); // "Warm"
felix.fly(); // logs -> "Sorry, no"
Taxonomy.Species.Felis_catus.fly = function(){console.log("Not really, but very nimble.");};
felix.fly(); // logs -> "Not really, but very nimble."

//climb
console.log(JSON.stringify(Taxonomy.climb({Class: "Mammalia"})));
console.log(JSON.stringify(Taxonomy.climb({Species: felix.Species})));
//gather
console.log(JSON.stringify(Taxonomy.gather({Kingdom: "Animalia"})));
console.log(JSON.stringify(Taxonomy.gather({Order: "Artiodactyla"})));



//Now, let's throw a curveball that would really mess up a lot of OO-based inheritance schemes
//... we discover a mammal with venom: The Duck-Billed Platypus (look it up)
var platypus = {
 Kingdom: "Animalia",
 Phylum: "Chordata",
 Class: "Mammalia",
 Order: "Monotremata",
 Family: "Ornithorhynchidae",
 Genus: "Ornithorhynchus",
 Species: "Ornithorhynchus_anatinus"
};

var mrduckbill = Taxonomy.stamp(platypus);
console.log(mrduckbill.hasVenom); //clearly wrong...but easy to fix
Taxonomy.Species[mrduckbill.Species].hasVenom = "Yes";
console.log(mrduckbill.hasVenom); //both for the duckbill
Taxonomy.Class.Mammalia.hasVenom = "Maybe"; //and for all Mammals