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

// src/http/controllers/gyms/routes.ts
var routes_exports = {};
__export(routes_exports, {
  gymsRoutes: () => gymsRoutes
});
module.exports = __toCommonJS(routes_exports);

// src/http/middlewares/verify-jwt.ts
async function verifyJWT(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

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

// src/use-cases/search-gym.ts
var SearchGymUseCase = class {
  constructor(gymRepository) {
    this.gymRepository = gymRepository;
  }
  async execute({
    query,
    page
  }) {
    const gyms = await this.gymRepository.searchMany(query, page);
    return {
      gyms
    };
  }
};

// src/use-cases/factories/make-search-gyms-use-case.ts
function makeSearchGymsUseCase() {
  const gymRepository = new PrismaGymRepository();
  const searchUseCase = new SearchGymUseCase(gymRepository);
  return searchUseCase;
}

// src/http/controllers/gyms/search.ts
var import_zod3 = __toESM(require("zod"));
async function search(request, reply) {
  const searchGymsQuerySchema = import_zod3.default.object({
    q: import_zod3.default.string(),
    page: import_zod3.default.coerce.number().min(1).default(1)
  });
  const { q, page } = searchGymsQuerySchema.parse(request.query);
  const searchGymsUseCase = makeSearchGymsUseCase();
  const { gyms } = await searchGymsUseCase.execute({
    query: q,
    page
  });
  return reply.status(200).send({
    gyms
  });
}

// src/use-cases/featch-nearby-gyms.ts
var FeatchNearbyGymsUseCase = class {
  constructor(gymRepository) {
    this.gymRepository = gymRepository;
  }
  async execute({
    userLatitude,
    userLongitude
  }) {
    const gyms = await this.gymRepository.findManyNearby({ latitude: userLatitude, longitude: userLongitude });
    return {
      gyms
    };
  }
};

// src/use-cases/factories/make-fetch-nearby-gyms-use-case.ts
function makeFetchNearbyGymsUseCase() {
  const gymRepository = new PrismaGymRepository();
  const fetchNearbyGym = new FeatchNearbyGymsUseCase(gymRepository);
  return fetchNearbyGym;
}

// src/http/controllers/gyms/nearby.ts
var import_zod4 = __toESM(require("zod"));
async function nearby(request, reply) {
  const nearbyGymsBodySchema = import_zod4.default.object({
    latitude: import_zod4.default.coerce.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod4.default.coerce.number().refine((value) => {
      return Math.abs(value) <= 180;
    })
  });
  const { latitude, longitude } = nearbyGymsBodySchema.parse(request.query);
  const fetchNearbyGymsUseCase = makeFetchNearbyGymsUseCase();
  const { gyms } = await fetchNearbyGymsUseCase.execute({
    userLatitude: latitude,
    userLongitude: longitude
  });
  return reply.status(200).send({
    gyms
  });
}

// src/http/controllers/gyms/routes.ts
function gymsRoutes(app) {
  app.addHook("onRequest", verifyJWT);
  app.get("/gyms/search", search);
  app.get("/gyms/nearby", nearby);
  app.post("/gyms", create);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  gymsRoutes
});
