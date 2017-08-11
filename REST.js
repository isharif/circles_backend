var mysql   = require("mysql");
var fs = require("fs");

function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}
//only added this so i could have a nice commit :P

REST_ROUTER.prototype.handleRoutes= function(router,connection,md5) {
    
    router.get("/",function(req,res){
        res.send('Hello World');
    });

    router.post("/autosignup",function(req,res){
        var query = "INSERT INTO ??() VALUES ()";
        var table = ["users"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "User Added !"});
            }
        });
    });

    router.post("/signup",function(req,res){
        var query = "INSERT INTO ??(??,??,??) VALUES (?,?,?)";
        //console.log(req.body.name,req.body.email,req.body.password);
        var table = ["users", "password", "name", "email", md5(req.body.password), req.body.name, req.body.email];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : err});
            } else {
                var returnquery = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?"; //query to return inserted user's user_id
            	var returntable = ["users", "email", req.body.email, "password", md5(req.body.password)];
            	returnquery = mysql.format(returnquery,returntable);
            	connection.query(returnquery,function(err,rows){
		            if(err) {
		                res.json({"Error" : true, "Message" : err});
		            } else {
		                res.json({"Error" : false, "Message" : rows})
		            }
        		});
            }
        });
    });

    router.post("/login",function(req,res){
        var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
        //console.log(name + email + password)
        var table = ["users", "email", req.body.email, "password", md5(req.body.password)];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : err});
            } else {
                if(rows.length < 1)
                {
                	res.json({"Error" : true, "Message" : rows});
                }
                else
                {
                	res.json({"Error" : false, "Message" : rows});
                }
            }
        });
    });

    router.post("/post_sent",function(req,res){
    	var post_id;
    	if (req.body.type == "picture_post")
    	{
	    	var data = req.body.data;
	        var imageName = Math.floor(Math.random()*999999999);
	        imageName = imageName + ".jpg";
	        var imagePath = __dirname + "/public/" + imageName;
	        var imageBuffer = new Buffer(req.body.data, 'base64');
	        fs.writeFile(imagePath, imageBuffer, function(err) { 
	        	if (err)
	        		console.log(err);
	        });
	    }
        var mainquery = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
        var maintable = ["posts", "user_id", "type", "anonymous", "title", req.body.user_id, req.body.type, req.body.anonymous, req.body.title];
        mainquery = mysql.format(mainquery,maintable);

        connection.query(mainquery,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : err});
            } else {
                console.log("post added in posts table")
            	connection.query("SELECT LAST_INSERT_ID()", function(err,rows){
            		if(err)
            		{
            			throw err;
            		}
            		else
            		{
            			post_id = rows[0]["LAST_INSERT_ID()"];
            			switch(req.body.type){
	            			case "picture_post":
	            			{	
	            				var publicImagePath = "http://46.101.242.198:3000/" + imageName;
		            			var imagequery = "INSERT INTO ??(??,??) VALUES (?,?)";
				        		var imagetable = ["post_images", "post_id", "url", post_id, publicImagePath];
				        		imagequery = mysql.format(imagequery,imagetable);
				        		connection.query(imagequery, function(err,rows){
				            		if(err)
				            		{
				            			throw err;
				            		}
				            		else
				            		{
				            			console.log("post added in post_images table. Main post_id: " + post_id);
				            			res.json({"Error" : false, "Message" : post_id});
				            		}
				            	});
				            	break;
				        	}
				        	case "text_post":
				        	{
				            	var textquery = "INSERT INTO ??(??,??) VALUES (?,?)";
				            	var texttable = ["text_posts", "body", "post_id", req.body.body, post_id];
				            	textquery = mysql.format(textquery,texttable);
				            	connection.query(textquery, function(err,rows){
				            		if(err)
				            		{
				            			throw err;
				            		}
				            		else
				            		{
				            			console.log("post added in text_posts table. Main post_id: " + post_id);
				            			res.json({"Error" : false, "Message" : post_id});
				            		}
				            	});
				            	break;
				            }
				            default: {}
				        }
            		}
            	});
            }

        }); 
    });

    router.get("/get_posts",function(req,res){
    	var postList = [];
        var picturePostsQuery = "SELECT * FROM posts INNER JOIN post_images ON posts.post_id = post_images.post_id";
        connection.query(picturePostsQuery,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : err});
            } else {
                Array.prototype.push.apply(postList, rows);
            }
        });
        var textPostsQuery = "SELECT * FROM posts INNER JOIN text_posts ON posts.post_id = text_posts.post_id"
        connection.query(textPostsQuery,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : err});
            } else {
            	Array.prototype.push.apply(postList, rows);
                res.json({"Error" : false, "Message" : postList})
            }
        });

    });

    router.post("/comment_sent",function(req,res){
        var query = "INSERT INTO ??(??,??,??,??,??,??) VALUES (?,?,?,?,?,?)";
        //console.log(req.body.name,req.body.email,req.body.password);
        var table = ["comments", "body", "submitter", "post_id", "anonymous", "parent_id", "has_child", req.body.body, req.body.submitter, req.body.post_id, req.body.anonymous, req.body.parent_id, req.body.has_Child];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) 
            {
                res.json({"Error" : true, "Message" : err});
            } 
            else 
            {
                connection.query("SELECT LAST_INSERT_ID()", function(err,rows){
            		if(err)
            		{
            			res.json({"Error" : true, "Message" : err});
            		}
            		else
            		{
            			res.json({"Error" : false, "Message" : rows});
            		}
            	});
            }
        });
    });

    router.get("/get_comments",function(req,res){
        var query = "SELECT * FROM comments WHERE post_id = ?";
    	//var query = "SELECT * FROM comments";
        var table = [parseInt(req.query.post_id)];
        query = mysql.format(query, table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : err});
            } else {
                res.json({"Error" : false, "Message" : rows});
            }
        });
    });


	router.post("/profile_image_sent",function(req,res){
    	var user_id;
    	var data = req.body.data;
        var imageName = req.user_id;
        imageName = imageName + ".jpg";
        var imagePath = __dirname + "/public/profile_images" + imageName;
        var imageBuffer = new Buffer(req.body.data, 'base64');
        fs.writeFile(imagePath, imageBuffer, function(err) { 
        	if (err)
        		console.log(err);
        });
	    }       
    });

}

module.exports = REST_ROUTER;
