// server
let go = (server)=>{
    const Primus = require("primus");
    let primus = new Primus(server, {});

    primus.on("connection", (spark)=>{
        //console.log("Spark");
        //spark.write("Welcome!!!");

        spark.on("data", (data)=>{
            //console.log(data)
            primus.write(data);
        })
    });
}

module.exports.go = go;