// src/util/provideSingleton.ts
import type { interfaces } from "inversify";
import { fluentProvide } from "inversify-binding-decorators";

export const singleton = function <T>(
  identifier: interfaces.ServiceIdentifier<T>
) {
  return fluentProvide(identifier).inSingletonScope().done();
};
