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

// src/http/controllers/check-ins/routes.ts
var routes_exports = {};
__export(routes_exports, {
  chekInRoutes: () => chekInRoutes
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

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found.");
  }
};

// src/utils/get-distance-between-coordinates.ts
function getDistanceBetweenCondinates(from, to) {
  if (from.latitude === to.latitude && from.longitude === to.longitude) {
    return 0;
  }
  const fromRadian = Math.PI * from.latitude / 180;
  const toRadian = Math.PI * to.latitude / 180;
  const theta = from.longitude - to.longitude;
  const radTheta = Math.PI * theta * 180;
  let dist = Math.sin(fromRadian) * Math.sin(toRadian) + Math.cos(fromRadian) * Math.cos(toRadian) * Math.cos(radTheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344;
  return dist;
}

// src/use-cases/errors/max-distance-error.ts
var MaxDistaceError = class extends Error {
  constructor() {
    super("Max distance reached.");
  }
};

// src/use-cases/errors/max-number-of-check-ns.ts
var MaxNumberOfCheckInsError = class extends Error {
  constructor() {
    super("Max number of check-ins reached.");
  }
};

// src/use-cases/check-in.ts
var CheckInUseCases = class {
  constructor(checkInRepository, gymRepository) {
    this.checkInRepository = checkInRepository;
    this.gymRepository = gymRepository;
  }
  async execute({ user_id, gym_id, userLatitude, userLongitude }) {
    const gym = await this.gymRepository.findById(gym_id);
    if (!gym) {
      throw new ResourceNotFoundError();
    }
    const distance = getDistanceBetweenCondinates(
      { latitude: userLatitude, longitude: userLongitude },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber()
      }
    );
    const MAX_DISTANCE_IN_KILOMETERS = 0.1;
    if (distance > MAX_DISTANCE_IN_KILOMETERS) {
      throw new MaxDistaceError();
    }
    const checkInOnSomeDate = await this.checkInRepository.findByUserIdOnDate(
      user_id,
      /* @__PURE__ */ new Date()
    );
    if (checkInOnSomeDate) {
      throw new MaxNumberOfCheckInsError();
    }
    const checkIn = await this.checkInRepository.create({
      gym_id,
      user_id
    });
    return {
      checkIn
    };
  }
};

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

// src/use-cases/factories/make-check-in-use-case.ts
function makeCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsReposytory();
  const gymRepository = new PrismaGymRepository();
  const useCase = new CheckInUseCases(checkInsRepository, gymRepository);
  return useCase;
}

// src/http/controllers/check-ins/create.ts
var import_zod2 = __toESM(require("zod"));
async function create(request, reply) {
  const createCheckInsParmsSchema = import_zod2.default.object({
    gymId: import_zod2.default.string().uuid()
  });
  const createCheckInsBodySchema = import_zod2.default.object({
    latitude: import_zod2.default.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod2.default.number().refine((value) => {
      return Math.abs(value) <= 180;
    })
  });
  const { gymId } = createCheckInsParmsSchema.parse(request.params);
  const { latitude, longitude } = createCheckInsBodySchema.parse(request.body);
  const checkInUseCase = makeCheckInUseCase();
  await checkInUseCase.execute({
    gym_id: gymId,
    user_id: request.user.sub,
    userLatitude: latitude,
    userLongitude: longitude
  });
  return reply.status(201).send();
}

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

// src/use-cases/factories/make-fetch-user-check-ins-history-use-case.ts
function makeFetchUserCheckInsHistoryUseCase() {
  const checkInsRepository = new PrismaCheckInsReposytory();
  const useCase = new FetchUserCheckInHistoryUseCase(checkInsRepository);
  return useCase;
}

// src/http/controllers/check-ins/history.ts
var import_zod3 = __toESM(require("zod"));
async function history(request, reply) {
  const searchGymsQuerySchema = import_zod3.default.object({
    page: import_zod3.default.coerce.number().min(1).default(1)
  });
  const { page } = searchGymsQuerySchema.parse(request.query);
  const fetchUserCheckInsHistoryUseCase = makeFetchUserCheckInsHistoryUseCase();
  const { checkIns } = await fetchUserCheckInsHistoryUseCase.execute({
    user_id: request.user.sub,
    page
  });
  return reply.status(200).send({
    checkIns
  });
}

// src/use-cases/get-user-metrics.ts
var GetUserMetricsUseCase = class {
  constructor(checkInRepository) {
    this.checkInRepository = checkInRepository;
  }
  async execute({ userId }) {
    const checkInCount = await this.checkInRepository.countByUserId(userId);
    return {
      checkInCount
    };
  }
};

// src/use-cases/factories/make-get-user-metrics-use-case.ts
function makeGetUserMetricsUseCase() {
  const checkInsRepository = new PrismaCheckInsReposytory();
  const useCase = new GetUserMetricsUseCase(checkInsRepository);
  return useCase;
}

// src/http/controllers/check-ins/metrics.ts
async function metrics(request, reply) {
  const getUserMetricsUseCase = makeGetUserMetricsUseCase();
  const { checkInCount } = await getUserMetricsUseCase.execute({
    userId: request.user.sub
  });
  return reply.status(200).send({
    checkInCount
  });
}

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

// src/use-cases/factories/make-validate-check-in-use-case.ts
function makeValidateCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsReposytory();
  const useCase = new ValidateUseCases(checkInsRepository);
  return useCase;
}

// src/http/controllers/check-ins/validate.ts
var import_zod4 = __toESM(require("zod"));
async function validate(request, reply) {
  const validateCheckInsParmsSchema = import_zod4.default.object({
    checkInId: import_zod4.default.string().uuid()
  });
  const { checkInId } = validateCheckInsParmsSchema.parse(request.params);
  const validateCheckInUseCase = makeValidateCheckInUseCase();
  await validateCheckInUseCase.execute({
    checkInId
  });
  return reply.status(204).send();
}

// src/http/controllers/check-ins/routes.ts
function chekInRoutes(app) {
  app.addHook("onRequest", verifyJWT);
  app.post("/gyms/:gymId/check-ins", create);
  app.post("/gyms/:checkInId/validete", validate);
  app.get("/check-ins/history", history);
  app.get("/check-ins/metrics", metrics);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  chekInRoutes
});
