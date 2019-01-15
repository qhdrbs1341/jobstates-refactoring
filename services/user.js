const express = require('express');
const app = require('app');
const Server = require('../server');

class UserService extends Server{
    constructor(uri){
        super(uri);
    }
}
