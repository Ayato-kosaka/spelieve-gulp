#!/usr/bin/env node

'use strict'
import { execSync }  from 'child_process';
console.log(execSync('npm run gulp --task=deleteDirectory --arg1=./Interface').toString())
console.log(execSync('npm run gulp --task=Interfaces --arg1=.').toString())