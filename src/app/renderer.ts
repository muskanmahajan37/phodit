import {IFileOpen} from "../common/interface/IFileOpen";
import "./menu.right";
import {createEvent} from "./utils/event.util";
import {markdownRender} from "./utils/markdown.utils";

require("devtron").install();

const {ipcRenderer} = require("electron");

let currentFile: string;
let isCurrentFileTemp = false;

const simplemde = new (window as any).SimpleMDE({
  spellChecker: false,
  autosave: {
    enabled: true,
    uniqueId: "phodit",
    delay: 1000,
  },
  element: document.getElementById("input-section"),
});

window.document.addEventListener("phodit.editor.open.guide", (data) => {
  ipcRenderer.send("phodit.open.guide", simplemde.value());
});

window.document.addEventListener("phodit.editor.fullscreen", (data) => {
  ipcRenderer.send("phodit.fullscreen");
});

window.document.addEventListener("phodit.editor.unfullscreen", (data) => {
  ipcRenderer.send("phodit.unfullscreen");
});

window.document.addEventListener("phodit.editor.suggest.get", (data: any) => {
  ipcRenderer.send("phodit.suggest.get", data.detail);
});

window.document.addEventListener("phodit.editor.save.file", () => {
  ipcRenderer.send("phodit.save.file", simplemde.value());
});

ipcRenderer.on("phodit.suggest.send", (event: any, arg: any) => {
  createEvent("phodit.editor.suggest.receive", arg);
});

ipcRenderer.on("phodit.open.one-file", (event: any, arg: IFileOpen) => {
  currentFile = arg.file;
  isCurrentFileTemp = arg.isTempFile;
  simplemde.value(arg.data);
});

ipcRenderer.on("client.save.file", () => {
  ipcRenderer.send("phodit.save.file", {
    isTempFile: isCurrentFileTemp,
    data: simplemde.value(),
  });
});

ipcRenderer.on("phodit.open.path", (event: any, arg: any) => {
  createEvent("phodit.tree.open", arg);
});

ipcRenderer.on("phodit.temp.file.status", (event: any, arg: any) => {
  isCurrentFileTemp = arg.isTempFile;
});

window.document.addEventListener("tree.pub.open", (event: any) => {
  ipcRenderer.send("phodit.open.file", JSON.parse(event.detail).filename);
});

window.document.addEventListener("phodit.editor.send.result", (event: any) => {
  const data = markdownRender(event.detail, currentFile);
  createEvent("phodit.editor.get.result", data);
});
