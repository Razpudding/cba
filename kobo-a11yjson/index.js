"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("hello typescript");
const fs_1 = require("fs");
let arr = new Array();
(0, fs_1.createReadStream)('speciesData/soorten_uitzonderingen.csv');
