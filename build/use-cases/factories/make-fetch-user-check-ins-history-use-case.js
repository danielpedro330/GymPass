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

// src/use-cases/factories/make-fetch-user-check-ins-history-use-case.ts
var make_fetch_user_check_ins_history_use_case_exports = {};
__export(make_fetch_user_check_ins_history_use_case_exports, {
  makeFetchUserCheckInsHistoryUseCase: () => makeFetchUserCheckInsHistoryUseCase
});
module.exports = __toCommonJS(make_fetch_user_check_ins_history_use_case_exports);

// src/use-cases/fetch-user-check-in-history.ts
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

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "test", "production"]).default("dev"),
  JWT_SERCRET: import_zod.z.string(),
  PORT: import_zod.z.coerce.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success == false) {
  console.error("Invalid environmente variables", _env.error.format());
  throw new Error("Invalid environmente variables");
}
var env = _env.data;

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: env.NODE_ENV == "dev" ? ["query"] : []
});

// src/repositories/prisma/prisma-ckeck-ins-repository.ts
var import_dayjs = __toESM(require("dayjs"));
var PrismaCheckInsReposytory = class {
  async create(data) {
    const checkIn = await prisma.checkIn.create({
      data
    });
    return checkIn;
  }
  async save(data) {
    const checkIn = await prisma.checkIn.update({
      where: {
        id: data.id
      },
      data
    });
    return checkIn;
  }
  async findById(id) {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id
      }
    });
    return checkIn;
  }
  async findManyByUserId(userId, page) {
    const checkIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId
      },
      take: 20,
      skip: (page - 1) * 20
    });
    return checkIns;
  }
  async countByUserId(userId) {
    const count = await prisma.checkIn.count({
      where: {
        user_id: userId
      }
    });
    return count;
  }
  async findByUserIdOnDate(userId, date) {
    const startOfTheDay = (0, import_dayjs.default)(date).startOf("date");
    const endOfTheDay = (0, import_dayjs.default)(date).endOf("date");
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfTheDay.toDate(),
          lte: endOfTheDay.toDate()
        }
      }
    });
    return checkIn;
  }
};

// src/use-cases/factories/make-fetch-user-check-ins-history-use-case.ts
function makeFetchUserCheckInsHistoryUseCase() {
  const checkInsRepository = new PrismaCheckInsReposytory();
  const useCase = new FetchUserCheckInHistoryUseCase(checkInsRepository);
  return useCase;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  makeFetchUserCheckInsHistoryUseCase
});
