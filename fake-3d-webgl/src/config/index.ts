/* eslint-disable import/no-absolute-path */
import originalMountImageUrl from "/image/mount.jpg";
import depthMountImageUrl from "/image/mount-map.jpg";
import originalBallImageUrl from "/image/ball.jpg";
import depthBallImageUrl from "/image/ball-map.jpg";
import originalCanyonImageUrl from "/image/canyon.jpg";
import depthCanyonImageUrl from "/image/canyon-map.jpg";
import originalLadyImageUrl from "/image/lady.jpg";
import depthLadyImageUrl from "/image/lady-map.jpg";
import originalDogImageUrl from "/image/dog.jpg";
import depthDogImageUrl from "/image/dog-map.png";
import originalDogPhotoImageUrl from "/image/dog-photo.jpg";
import depthDogPhotoImageUrl from "/image/dog-depth-map.jpg";

export const IMAGE_INFO = [
  {
    name: "mount",
    originalImageUrl: originalMountImageUrl,
    depthImageUrl: depthMountImageUrl,
  },
  {
    name: "ball",
    originalImageUrl: originalBallImageUrl,
    depthImageUrl: depthBallImageUrl,
  },
  {
    name: "canyon",
    originalImageUrl: originalCanyonImageUrl,
    depthImageUrl: depthCanyonImageUrl,
  },
  {
    name: "lady",
    originalImageUrl: originalLadyImageUrl,
    depthImageUrl: depthLadyImageUrl,
  },
  {
    name: "dog",
    originalImageUrl: originalDogImageUrl,
    depthImageUrl: depthDogImageUrl,
  },
  {
    name: "dog photo",
    originalImageUrl: originalDogPhotoImageUrl,
    depthImageUrl: depthDogPhotoImageUrl,
  },
];

export const PRESET_TYPE_MAP = {
  Vertical: {
    motionType: "LINEAR",
    startPoint: { x: 0, y: 0.1, z: 0 },
    endPoint: { x: 0, y: -0.1, z: 0 },
    amount: 0.4,
    animationDuration: 4,
    focus: 0.5,
    edgeDilation: 0,
    isLoop: true,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  Horizontal: {
    motionType: "LINEAR",
    startPoint: { x: 0.1, y: 0, z: 0 },
    endPoint: { x: -0.1, y: 0, z: 0 },
    amount: 0.4,
    animationDuration: 4,
    focus: 0.5,
    edgeDilation: 0,
    isLoop: true,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  Circle: {
    motionType: "CIRCULAR",
    amplitudePoint: { x: 0.1, y: 0.1, z: 0 },
    phasePoint: { x: 0, y: 1, z: 1 },
    amount: 0.4,
    animationDuration: 8,
    focus: 0.5,
    edgeDilation: 0,
    isLoop: true,
    isReverse: false,
    isLoopDisabled: true,
    isReverseDisabled: false,
  },
  Perspective: {
    motionType: "CIRCULAR",
    amplitudePoint: { x: 0.1, y: 0.05, z: 0.4 },
    phasePoint: { x: 0, y: 1, z: 1 },
    amount: 0.4,
    animationDuration: 8,
    focus: 0.5,
    edgeDilation: 0,
    isLoop: true,
    isReverse: false,
    isLoopDisabled: true,
    isReverseDisabled: false,
  },
  Zoom: {
    motionType: "LINEAR",
    startPoint: { x: 0, y: 0, z: -0.2 },
    endPoint: { x: 0, y: 0, z: 0.8 },
    amount: 0.4,
    animationDuration: 8,
    focus: 1,
    edgeDilation: 0,
    isLoop: true,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  Dolly: {
    motionType: "LINEAR",
    startPoint: { x: 0, y: 0, z: 0.2 },
    endPoint: { x: 0, y: 0, z: -0.8 },
    amount: 0.65,
    animationDuration: 10,
    focus: 0.5,
    edgeDilation: 0,
    isLoop: false,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  "Zoom Left": {
    motionType: "THREEPOINTLINEAR",
    startPoint: { x: -0.3, y: -0.1, z: -0.2 },
    middlePoint: { x: 0, y: 0.1, z: 0.1 },
    endPoint: { x: 0.2, y: 0, z: 0.6 },
    amount: 0.4,
    animationDuration: 10,
    focus: 1,
    edgeDilation: 0,
    isLoop: false,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  "Zoom Center": {
    motionType: "THREEPOINTLINEAR",
    startPoint: { x: 0, y: -0.1, z: -0.2 },
    middlePoint: { x: 0, y: 0.1, z: 0.2 },
    endPoint: { x: 0, y: 0, z: 0.6 },
    amount: 0.4,
    animationDuration: 10,
    focus: 1,
    edgeDilation: 0,
    isLoop: false,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  "Zoom Right": {
    motionType: "THREEPOINTLINEAR",
    startPoint: { x: 0.3, y: -0.1, z: -0.2 },
    middlePoint: { x: 0, y: 0.1, z: 0.1 },
    endPoint: { x: -0.2, y: 0, z: 0.6 },
    amount: 0.4,
    animationDuration: 10,
    focus: 1,
    edgeDilation: 0,
    isLoop: false,
    isReverse: false,
    isLoopDisabled: false,
    isReverseDisabled: false,
  },
  Custom: null,
};
