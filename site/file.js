"use strict"

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const { window } = new JSDOM ('<!DOCTYPE html><p>Hello, World!</p>');


console.log(window.document.querySelector("html").textContent);
