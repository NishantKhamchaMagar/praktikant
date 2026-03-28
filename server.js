const express = require('express');  //import Express framework
const app = express();               //create Express application instance
const port = 3000;                   //define server port number

app.use(express.json());             //middleware to parse JSON request bodies

//GET root route - simple status message
app.get('/', (req, res) => {
  res.send('Weblinks API is running.');
});

//in-memory database - stores all weblink records
let weblinks = [
  {
    id: 1,                    		    //unique identifier
    name: "Google",           		    //website name
    url: "https://www.google.com",  	//full URL
    rating: 5                		      //rating out of 5
  },
  {
    id: 2,
    name: "GitHub",
    url: "https://github.com",
    rating: 5
  },
  {
    id: 3,
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    rating: 4
  }
];

let nextId = 4;  //counter for auto-generating new IDs

//GET shows all weblinks
/**
 * @api {get} /api/weblinks Display all weblinks
 * @apiName GetWeblinks
 * @apiGroup Weblinks
 * 
 * @apiSuccess {Boolean} success Request success status
 * @apiSuccess {Number} count Number of weblinks returned
 * @apiSuccess {Object[]} data Array of weblink objects
 */
app.get('/api/weblinks', (req, res) => {
  res.json({
    success: true,           //indicates successful operation
    count: weblinks.length,  //returns total number of weblinks
    data: weblinks           //returns complete array of weblinks
  });
});

//GET shows .com weblinks (static route BEFORE :id)
/**
 * @api {get} /api/weblinks/com Display .com weblinks
 * @apiName GetComWeblinks
 * @apiGroup Weblinks
 */
app.get('/api/weblinks/com', (req, res) => {
  const comWeblinks = weblinks.filter(w => w.url.includes('.com'));  //derive from URL
  
  res.json({
    success: true,
    count: comWeblinks.length,
    data: comWeblinks
  });
});

//GET shows weblinks by rating (also before :id)
/**
 * @api {get} /api/weblinks/rating/:rating Display weblinks by rating
 * @apiName GetWeblinksByRating
 * @apiGroup Weblinks
 * 
 * @apiParam {Number} rating Rating value (1-5)
 */
app.get('/api/weblinks/rating/:rating', (req, res) => {
  const rating = parseInt(req.params.rating);                  	
  const filteredWeblinks = weblinks.filter(w => w.rating === rating);
  
  res.json({
    success: true,
    count: filteredWeblinks.length,
    rating: rating,
    data: filteredWeblinks
  });
});

//GET shows specific weblinks by id (MUST BE LAST)
/**
 * @api {get} /api/weblinks/:id Read a specific weblink
 * @apiName GetWeblink
 * @apiGroup Weblinks
 * 
 * @apiParam {Number} id Weblink unique ID
 */
app.get('/api/weblinks/:id', (req, res) => {
  const id = parseInt(req.params.id);              	  //convert URL parameter to number
  const weblink = weblinks.find(w => w.id === id);  	//search for weblink with matching ID
  
  if (!weblink) {  					                          //if no weblink found with this ID
    return res.status(404).json({                  	  //return 404 Not Found status
      success: false,
      message: `Weblink with id ${id} not found`
    });
  }
  
  res.json({      					                          //if found, return the specific weblink
    success: true,
    data: weblink
  });
});

//POST creates a new weblink
/**
 * @api {post} /api/weblinks Create a new weblink
 * @apiName CreateWeblink
 * @apiGroup Weblinks
 * 
 * @apiParam {String} name Weblink name (required)
 * @apiParam {String} url Weblink URL (required)
 * @apiParam {Number} rating Weblink rating (optional, default: 3)
 */
app.post('/api/weblinks', (req, res) => {
  const { name, url, rating } = req.body;  		      //extract data from request body
  
  // Validate required fields
  if (!name || !url) {
    return res.status(400).json({                		//return 400 Bad Request if missing fields
      success: false,
      message: 'Name and URL are required fields'
    });
  }
  
  const newWeblink = {
    id: nextId++,                                		//auto-increment ID
    name,                                        		//provided name
    url,                                         		//provided URL
    rating: rating || 3                          		//default rating if not provided
  };
  
  weblinks.push(newWeblink);                     		//add to database
  
  res.status(201).json({                         		//return 201 Created
    success: true,
    message: 'Weblink created successfully',
    data: newWeblink
  });
});

//PUT updates an existing weblink
/**
 * @api {put} /api/weblinks/:id Update an existing weblink
 * @apiName UpdateWeblink
 * @apiGroup Weblinks
 * 
 * @apiParam {Number} id Weblink unique ID
 */
app.put('/api/weblinks/:id', (req, res) => {
  const id = parseInt(req.params.id);                     	     //convert ID parameter
  const { name, url, rating } = req.body;          		          //extract update data
  
  const weblinkIndex = weblinks.findIndex(w => w.id === id);  	//find index
  
  if (weblinkIndex === -1) {                             	      //if not found
    return res.status(404).json({
      success: false,
      message: `Weblink with id ${id} not found`
    });
  }
  
  // Update only provided fields
  weblinks[weblinkIndex] = {
    ...weblinks[weblinkIndex],      				//keep existing
    name: name || weblinks[weblinkIndex].name,
    url: url || weblinks[weblinkIndex].url,
    rating: rating || weblinks[weblinkIndex].rating
  };
  
  res.json({
    success: true,
    message: 'Weblink updated successfully',
    data: weblinks[weblinkIndex]
  });
});

//DELETE removes weblink
/**
 * @api {delete} /api/weblinks/:id Delete an existing weblink
 * @apiName DeleteWeblink
 * @apiGroup Weblinks
 * 
 * @apiParam {Number} id Weblink unique ID
 */
app.delete('/api/weblinks/:id', (req, res) => {
  const id = parseInt(req.params.id);                     	    //convert ID
  const weblinkIndex = weblinks.findIndex(w => w.id === id);  	//find position
  
  if (weblinkIndex === -1) {                             	      //if not found
    return res.status(404).json({
      success: false,
      message: `Weblink with id ${id} not found`
    });
  }
  
  const deletedWeblink = weblinks[weblinkIndex];        	//store before deletion
  weblinks.splice(weblinkIndex, 1);                      	//remove
  
  res.json({
    success: true,
    message: 'Weblink deleted successfully',
    data: deletedWeblink
  });
});

//starts server
app.listen(port, () => {
  console.log(`Weblinks API running at http://localhost:${port}`);
});