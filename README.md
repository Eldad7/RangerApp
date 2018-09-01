# RangerApp
Ranger app in ReactJS home project

Visit the website => http://ranger-app.herokuapp.com
How to use:
In query string you need to add the Unique of the ranger you want, as written inside paranthesis.
Looks like: http://ranger-app.herokuapp.com?ranger=Neo (Case insensitive)

API used at http://ranger-api.herokuapp.com is in a folder called WS on this repository, but is not a part of this App - it is only for viewing purposes
There you will find:
* index.php file
* ranger.json as hosted on s3 (http://clanplayrangers.s3-eu-west-1.amazonaws.com/rangers.json)
* usrs.json file

Technologies used:
* Heroku for hosting of Application and API
* S3 for hosting of rangers.json file
* PHP for API and React for App

*The PHP API is logging all requests sent to API on requestbin with the bin: http://requestbin.fullcontact.com/16gffks1?inspect

For installations required with NPM please see package.json
