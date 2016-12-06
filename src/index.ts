#!/usr/bin/env node

import {loadSchema} from './scheme-loader';

console.log(loadSchema('./schema.json'));
