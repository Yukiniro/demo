import mitt from "mitt";

type Events = {
  "dblclick-text": string;
  "text-edit": string;
};

export const emitter = mitt<Events>();
