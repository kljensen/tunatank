# Tuna Tank

Tuna Tank is a web app that lets an audience invest in start-ups during a pitch contest. The name is a play on the "[Shark Tank](http://en.wikipedia.org/wiki/Shark_Tank)" television show.

The application uses:

* [Yeoman](http://yeoman.io/) and [Generator Angular](https://github.com/yeoman/generator-angular) for scaffolding;
* [Grunt.js](http://gruntjs.com/) for building;
* [Angular.js](https://angularjs.org) for the client-side framework; and,
* [Firebase](https://www.firebase.com/) + [AngularFire](https://www.firebase.com/quickstart/angularjs.html) for real-time syncrhonization of data between all the players.

It is 100% client-side and does not require a database, application server, etc. You can serve the static files from the webserver of your choice, [S3](http://aws.amazon.com/s3/), whatever.


## Installation

Check out the repo

	git clone https://github.com/kljensen/tunatank
	cd tunatank

Install the build dependencies from [npm](https://www.npmjs.org/)

	npm install
	
Install the client-side javascript dependencies using [bower](http://bower.io/)

	bower install
	
And start the application

	grunt serve
	
You can build the the application (including minification of the assets and such) using

	grunt build
	
Obviously, it's a static app. Deploy the `dist` folder to the webserver of your choice and enjoy. But, before you do that, please change the hardcoded Firebase URL so that you're not using my free account!

## How the game works

The admin should log into `/#/admin` and start the game by filling in the entrepreneurs. Other users nagivate to `/` where they're prompted to enter the contest. The admin advances the rounds and in each round the contestants can invest in the start ups. In the first round, the entrepreneur's names are shown without company affiliation, so that you can make the investors do a "gut round". After that, the company names are shown. After each round, the sum value of the companies doubles. The distribution of the added value is partitioned between the companies pro rata based on the invested capital in that round. That is, the game is basically a [Keynesian beauty contest](http://en.wikipedia.org/wiki/Keynesian_beauty_contest). Investors get more capital in each round and the companys' valuations get higher and higher. At the end, it shows you how much your investments in each company were worth.

## Screenshots
In the screenshots below  you can see the buttons that allow you to invest in the different teams during round 2: the series A round. I beileve you're investing $100k increments in that round.

![ScreenShot](https://raw.githubusercontent.com/kljensen/tunatank/screenshots/images/screenshot.png)


## Example event
We used the application without issue in June 2014. Roughly 30 persons participated and three teams pitched. A good time was had by all.

![ScreenShot](https://raw.githubusercontent.com/kljensen/tunatank/screenshots/images/event.jpg)

