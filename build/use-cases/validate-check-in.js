"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/use-cases/validate-check-in.ts
var validate_check_in_exports = {};
__export(validate_check_in_exports, {
  ValidateUseCases: () => ValidateUseCases
});
module.exports = __toCommonJS(validate_check_in_exports);

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found.");
  }
};

// src/use-cases/validate-check-in.ts
var ValidateUseCases = class {
  constructor(checkInRepository) {
    this.checkInRepository = checkInRepository;
  }
  async execute({ checkInId }) {
    const checkIn = await this.checkInRepository.findById(checkInId);
    if (!checkIn) {
      throw new ResourceNotFoundError();
    }
    checkIn.validated_at = /* @__PURE__ */ new Date();
    await this.checkInRepository.save(checkIn);
    return {
      checkIn
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ValidateUseCases
});
