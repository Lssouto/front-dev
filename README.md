# Front-dev

A simple front-end dev project using gulp, sass and babel. 
Easy to integrate with others structures, you can set where export the files. Or just build it to minify the files and upload.

## Getting Started

Let's start just clone and install everything

```
git clone https://github.com/lssouto/front-dev.git && cd front-dev
```
then 
```
yarn install
```
Or
```
npm install
```
OBS.:If you don't know yarn, get some minutes and see this [Yarn](https://yarnpkg.com)

## Running

### Developing

When developing you use gulp

```
gulp serve:dev
```
then gulp will start watching your files like scss, html, images, fonts for changes and every time you save he will reload your browser.
Browsersync will provide a url to easy teste on phones.

```
[Browsersync] Access URLs:
 --------------------------------------
       Local: http://localhost:9000
    External: http://192.168.1.105:9000
 --------------------------------------
          UI: http://localhost:3001
 UI External: http://192.168.1.105:3001
 --------------------------------------
```

OBS.: Here files will be not minified, so you can easy see what's happening on Js ou inspec css elements

### Building for a server

If you want to deploy it to your server there are 2 ways:

```
gulp build
```
Or
```
gulp serve:build
```

-The first one will just minify everything and send to where it's configured on the gulfile-config.js.
-The second will be like developing, but everything will be minified and everytime you make a change it will be minified and reloaded.

### Exporting to other structure

A lot of project already have their own structure, so ... why not just export what you already have done to it ? 

Just do it:
```
gulp export
```
Or
```
gulp export-min
```

Both tasks come with a watch option if you need make changes and keep exporting.
```
gulp serve:export
```
Or
```
gulp serve:export-min
```

## Configuring

So whe got a lot of things, but how do i change it?

On gulpfile-config.js you will find all the paths you want, just change it or rename or well, just do what you need.

### Changing Html extension and spliting

I made a option for spliting your files when exporting into blades or asp or ...

On each Html you will find something like
```
<!-- split name -->
```
```
<!-- split name -->
<!-- split stop -->
```
It will split, rename and send the files to the new directory.

## Versioning

We use [Git](https://git-scm.com//) for versioning. 

## Authors

* **Lucas Souto** - *front-dev* - [Lssouto](https://github.com/Lssouto)
