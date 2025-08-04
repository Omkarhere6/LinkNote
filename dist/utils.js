"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomHash = randomHash;
function randomHash(length) {
    let options = "abcdefghijklmnopqrstuvwxyz1234567890";
    let optionsLength = options.length;
    let ans = "";
    for (let i = 0; i < length; i++) {
        ans += options[Math.floor((Math.random() * length))];
    }
    return ans;
}
