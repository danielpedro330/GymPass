"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/repositories/in-memory/in-memory-check-in-repository.ts
var in_memory_check_in_repository_exports = {};
__export(in_memory_check_in_repository_exports, {
  InMemoryCheckInRepository: () => InMemoryCheckInRepository
});
module.exports = __toCommonJS(in_memory_check_in_repository_exports);
var import_node_crypto = require("crypto");
var import_dayjs = __toESM(require("dayjs"));
var InMemoryCheckInRepository = class {
  items = [];
  async findById(id) {
    const checkIn = await this.items.find((item) => item.id === id);
    if (!checkIn) {
      return null;
    }
    return checkIn;
  }
  async findByUserIdOnDate(userId, date) {
    const startOfDate = (0, import_dayjs.default)(date).startOf("date");
    const endOfDate = (0, import_dayjs.default)(date).endOf("date");
    const CheckInOnSomeDay = await this.items.find((checkIn) => {
      const InputDate = (0, import_dayjs.default)(checkIn.created_at);
      const isOnSomeDate = (0, import_dayjs.default)(InputDate).isAfter(startOfDate) && (0, import_dayjs.default)(InputDate).isBefore(endOfDate);
      return checkIn.user_id === userId && isOnSomeDate;
    });
    if (!CheckInOnSomeDay) {
      return null;
    }
    return CheckInOnSomeDay;
  }
  async findManyByUserId(userId, page) {
    return this.items.filter((item) => item.user_id === userId).slice((page - 1) * 20, page * 20);
  }
  async countByUserId(userId) {
    return this.items.filter((item) => item.user_id == userId).length;
  }
  async create(data) {
    const checkIn = {
      id: (0, import_node_crypto.randomUUID)(),
      gym_id: data.gym_id,
      user_id: data.user_id,
      created_at: /* @__PURE__ */ new Date(),
      validated_at: data.validated_at ? new Date(data.validated_at) : null
    };
    this.items.push(checkIn);
    return checkIn;
  }
  async save(checkIn) {
    const checkInIndex = this.items.findIndex((item) => item.id === checkIn.id);
    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn;
    }
    return checkIn;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryCheckInRepository
});
