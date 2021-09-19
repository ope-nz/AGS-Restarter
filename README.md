# AGS Restarter (by Ope Ltd)

![image](https://user-images.githubusercontent.com/26259049/133941746-945f73a3-6777-4195-b703-2008b99a85e6.png)

AGS Restarter is small "app" written in JavaScript that can perform bulk stop, start and restart operations to services on your ArcGIS Server.

As its JavaScript all code is executed in the browser and nothing goes over the network apart from the REST requests to your server.

To deploy simply copy the files to a web server on the same domain as your ArcGIS Server and open the index.html file 

NOTE: the "same domain" is important otherwise you will receive CORS errors.

![image](https://user-images.githubusercontent.com/26259049/133941882-29a607ca-996f-4143-9b2b-9e3b9b817184.png)

Services can be stopped, started or restarted using the individual buttons.

![image](https://user-images.githubusercontent.com/26259049/133941944-19cfc78d-361a-41fb-987f-b95bb826056d.png)

There are also buttons at the top of the services list to allow bulk actions (i.e to all services within a folder).

The restart action is a little bit "janky" as it does a syncronous REST request to stop the service before doing an asyncronous call to start the service. This is to stop the server being overloaded with too many start operations at once.

The stop/start all actions are asyncronous and use an iterator to perform the action one at a time.
