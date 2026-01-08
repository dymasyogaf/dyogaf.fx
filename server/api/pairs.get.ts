import { defineEventHandler } from "h3";
import { pairOptions } from "../utils/pairs";

export default defineEventHandler(() => {
  return { pairs: pairOptions };
});
