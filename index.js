#!/usr/bin/env node
const path = require('path');
const fs = require('fs-extra');
const replace = require("replace");
const program = require('commander');
const chalk = require('chalk');
let currentPath = process.cwd();
let commandName;
const packageJSON = require('./package.json');

program
.version(packageJSON.version)
.description(packageJSON.version)
.usage('<project-directory>')
.action(name => {
  commandName = name;
})
.parse(process.argv);

if(commandName === 'deploy') {
  let files = fs.readdirSync(path.join(currentPath));
  console.log();
  console.log(chalk.blue.bgGreenBright(`A ready-to-deploy version of `) + chalk.black.bgGreenBright(packageJSON.name) + chalk.blue.bgGreenBright(' is being generated. Please wait...'));
  console.log();
  files.forEach(file => {
    if (file === 'webpack.config.js' || file === '.babelrc' || file === 'package-lock.json') {

      if(fs.existsSync(path.join(currentPath, 'deploy', file))) {
        fs.removeSync(path.join(currentPath, 'deploy', file));
      }

      let data = fs.readFileSync(path.join(currentPath, file), 'utf-8');
      fs.writeFileSync(path.join(currentPath, 'deploy', file), data, 'utf-8');
    }
    if (file === 'build') {
      if(fs.existsSync(path.join(currentPath, 'deploy', file))) {
        fs.removeSync(path.join(currentPath, 'deploy', file));
      }

      fs.mkdirSync(path.join(currentPath, 'deploy', 'build'));
      //fs.copySync(path.join(currentPath, file), (path.join(currentPath, 'deploy', 'build')));
    }
    if (file === 'package.json') {
      if(fs.existsSync(path.join(currentPath, 'deploy', file))) {
        fs.removeSync(path.join(currentPath, 'deploy', file));
      }
      let data = fs.readFileSync(file, 'utf-8');
  
      data = data.replace(`"client-dev": "webpack-dev-server --port 4000 --hot --inline --watch --progress"`, `"start": "node ./app/server/public/server.js"`);
      data = data.replace(`"server-dev": "opn http://localhost:8000 && nodemon ./app/server/public/server.js localhost 8000"`, `"heroku-postbuild": "npm install --only=dev && npm install && npm run build"`);
      data = data.replace(`"build": "webpack -p",`, `"build": "webpack -p"`)
      data = data.replace(`"deploy": "mern-scripts deploy"`, ``);
      fs.writeFileSync(path.join(currentPath, 'deploy', 'package.json'), data, 'utf-8');
    }
  
    if (file === 'app') {
      if(fs.existsSync(path.join(currentPath, 'deploy', file))) {
        fs.removeSync(path.join(currentPath, 'deploy', file));
      }
      fs.copySync(path.join(currentPath, file), (path.join(currentPath, 'deploy', 'app')));
      replace({
        regex: "http://localhost:8000/api/",
        replacement: "/api/",
        paths: [`${path.join(currentPath, 'deploy', 'app')}`],
        recursive: true,
        silent: true,
      });
      replace({
        regex: /require[(][']dotenv['][)].config[(][)];/g,
        replacement: '',
        paths: [`${path.join(currentPath, 'deploy', 'app')}`],
        recursive: true,
        silent: true,
      });
    }
  });
  console.log(chalk.blue.bgGreenBright(`A ready-to-deploy version of your project is created successfully in `) + chalk.black.bgGreenBright('build') + chalk.blue.bgGreenBright(' folder.'));
  console.log();
  console.log(chalk.blue.bgGreenBright('Now ') + chalk.black.bgGreenBright('cd') + chalk.blue.bgGreenBright(' into ') + chalk.black.bgGreenBright('deploy') + chalk.blue.bgGreenBright(' folder and follow the README.md guide to deploy your app to Heroku.'));
} else {
  console.log();
  console.error(chalk.whiteBright.bgRed('Please specify the command you want to run.'));
  console.log();
  console.error(chalk.whiteBright.bgRed('For example: mern-scripts deploy.'));
}