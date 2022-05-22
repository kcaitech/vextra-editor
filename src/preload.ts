'use strict'

import { EventEmitter } from './basic/event';
import { ipcRenderer } from 'electron';
import { LzDataLocal } from './io/lzdatalocal';

export const preload = new EventEmitter();

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, (process.versions[type] || ''))
  }
})

preload.on('load', () => {

  ipcRenderer.invoke('getOpenFilePath').then((filePath) => {
    // console.log('preload filePath:', filePath);
  
    if (!filePath) {
      return;
    }

    const lzData = new LzDataLocal(filePath);
    // cb(lzData);

    preload.emit('ready', lzData);
  });
  
});
