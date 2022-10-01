#!/usr/bin/env node

'use strict'
import { execSync }  from 'child_process';
console.log(execSync('rm -r -f Interface').toString())
console.log(execSync('cd node_modules/spelieve-gulp && npx gulp Interfaces --arg1 ../../').toString())