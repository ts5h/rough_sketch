import { atom } from "jotai";
import { isMobile } from "react-device-detect";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

export const audioContextAtom = atom(new AudioContext());
export const isSoundOnAtom = atom(!isMobile);
