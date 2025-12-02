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

// src/use-cases/fetch-user-check-in-history.ts
var fetch_user_check_in_history_exports = {};
__export(fetch_user_check_in_history_exports, {
  FetchUserCheckInHistoryUseCase: () => FetchUserCheckInHistoryUseCase
});
module.exports = __toCommonJS(fetch_user_check_in_history_exports);
var FetchUserCheckInHistoryUseCase = class {
  constructor(checkInRepository) {
    this.checkInRepository = checkInRepository;
  }
  async execute({ user_id, page }) {
    const checkIns = await this.checkInRepository.findManyByUserId(user_id, page);
    return {
      checkIns
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FetchUserCheckInHistoryUseCase
});
