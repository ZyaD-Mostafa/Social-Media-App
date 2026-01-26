const client = io("http://localhost:3000");



client.on("connect", () => {
    console.log("Connected to server ,front end  =>success");
});


client.on("product", (data, callback) => {
    console.log(data);
    callback("front end recived the your message ");
});

// client.emit("SayHi", "hi front end to back end ", (res) => {
//     console.log(res);

// })