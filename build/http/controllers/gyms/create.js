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

// src/http/controllers/gyms/create.ts
var create_exports = {};
__export(create_exports, {
  create: () => create
});
module.exports = __toCommonJS(create_exports);

// src/use-cases/create-gym.ts
var CreateGymUseCase = class {
  constructor(gymRepository) {
    this.gymRepository = gymRepository;
  }
  async execute({
    title,
    description,
    phone,
    latitude,
    longitude
  }) {
    const gyms = await this.gymRepository.create({
      title,
      description,
      phone,
      latitude,
      longitude
    });
    return { gyms };
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

// src/repositories/prisma/prisma-gym-repository.ts
var PrismaGymRepository = class {
  async findById(id) {
    const gym = await prisma.gym.findUnique({
      where: {
        id
      }
    });
    return gym;
  }
  async findManyNearby({ latitude, longitude }) {
    const gym = await prisma.$queryRaw`
        SELECT * FROM gyms
        WHERE ( 6371 * acos ( cos( radians(${latitude}) ) * cos( radians(latitude)) * cos( radians( longitude) - radians(${longitude}) ) + sin(radians(${latitude}) ) * sin( radians( latitude)))) <= 10
        `;
    return gym;
  }
  async searchMany(query, page) {
    const gym = await prisma.gym.findMany({
      where: {
        title: {
          contains: query
        }
      },
      take: 20,
      skip: (page - 1) * 20
    });
    return gym;
  }
  async create(data) {
    const gym = await prisma.gym.create({
      data
    });
    return gym;
  }
};

// src/use-cases/factories/make-create-gym-use-case.ts
function makeCreateGymUseCase() {
  const gymRepository = new PrismaGymRepository();
  const createGymUseCase = new CreateGymUseCase(gymRepository);
  return createGymUseCase;
}

// src/http/controllers/gyms/create.ts
var import_zod2 = __toESM(require("zod"));
async function create(request, reply) {
  const createGymBodySchema = import_zod2.default.object({
    title: import_zod2.default.string(),
    description: import_zod2.default.string().nullable(),
    phone: import_zod2.default.string().nullable(),
    latitude: import_zod2.default.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod2.default.number().refine((value) => {
      return Math.abs(value) <= 180;
    })
  });
  const { title, description, phone, latitude, longitude } = createGymBodySchema.parse(request.body);
  const createGymUseCase = makeCreateGymUseCase();
  await createGymUseCase.execute({
    title,
    description,
    phone,
    latitude,
    longitude
  });
  return reply.status(201).send();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  create
});
