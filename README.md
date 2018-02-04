# Project Title

A simple front-end dev project using gulp, sass and babel. You can export the files and use in some where else. Or just build it to minify the files.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing
You can clone the project and install with yarn or npm.

```
yarn install
```
Or
```
npm install
```

### Running

To run the project you can use

```
gulp serve
```
then gulp will start serving your files like scss, html, images, fonts for changes and every time you save he will reload your browser.
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
## Deployment

You can deploy it to with just typing

```
gulp 
```
he will minify and group all the files into a dist repo.

Or you can type

```
gulp export
```
that will provide a easy way to export what you have made to some back-end structure.

## Config

You still can change what dependencies do you want to import into your project from Assets.js 
Or 
Configuring to where your files will go when you build or export with the gulpfile-config.js.
## Versioning

We use [Git](https://git-scm.com//) for versioning. 

## Authors

* **Lucas Souto** - *front-dev* - [Lssouto](https://github.com/Lssouto)
