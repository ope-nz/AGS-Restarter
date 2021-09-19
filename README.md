# AGS-Restarter

AGS Restarter is small "app" written in JavaScript that can perform bulk stop, start and restart operations to services on your ArcGIS Server.

As its JavaScript all code is executed in the browser and nothing goes over the network apart from the REST requests to your server.

To deploy simply copy the files to a web server on the same domain as your ArcGIS Server and open the index.html file 

NOTE: the "same domain" is important otherwise you will receive CORS errors.
