// src/util/provideSingleton.ts
import { fluentProvide } from "inversify-binding-decorators";
import { interfaces } from "inversify";

export const singleton = function <T>(
  identifier: interfaces.ServiceIdentifier<T>
) {
  return fluentProvide(identifier).inSingletonScope().done();
};
