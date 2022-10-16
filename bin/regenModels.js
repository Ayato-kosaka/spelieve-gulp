#!/usr/bin/env node

'use strict'
import { execSync }  from 'child_process';
console.log(execSync('rm -r -f Models').toString())
console.log(execSync(`cd node_modules/spelieve-gulp && npx gulp Models --arg1 ${execSync('pwd').toString()}`).toString())