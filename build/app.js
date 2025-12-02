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

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_fastify = __toESM(require("fastify"));

// src/http/controllers/users/register.ts
var import_zod2 = __toESM(require("zod"));

// src/use-cases/errors/user-already-exists-error.ts
var userAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists.");
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

// src/repositories/prisma/prisma-user-repository.ts
var PrismaUsersRepository = class {
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }
  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    return user;
  }
  async create(data) {
    const user = await prisma.user.create({
      data
    });
    return user;
  }
};

// src/use-cases/register.ts
var import_bcryptjs = require("bcryptjs");
var RegisterUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({ name, email, password }) {
    const password_hash = await (0, import_bcryptjs.hash)(password, 6);
    const userWithSomeEmail = await this.usersRepository.findByEmail(email);
    if (userWithSomeEmail) {
      throw new userAlreadyExistsError();
    }
    const user = await this.usersRepository.create({
      name,
      email,
      password_hash
    });
    return {
      user
    };
  }
};

// src/use-cases/factories/make-register-user-cases.ts
function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const registerUseCase = new RegisterUseCase(usersRepository);
  return registerUseCase;
}

// src/http/controllers/users/register.ts
async function register(request, reply) {
  const registerBodySchema = import_zod2.default.object({
    name: import_zod2.default.string(),
    email: import_zod2.default.string().email(),
    password: import_zod2.default.string().min(6)
  });
  const { name, email, password } = registerBodySchema.parse(request.body);
  try {
    const registerUseCase = makeRegisterUseCase();
    await registerUseCase.execute({
      name,
      email,
      password
    });
  } catch (err) {
    if (err instanceof userAlreadyExistsError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(201).send();
}

// src/http/controllers/users/authenticate.ts
var import_zod3 = __toESM(require("zod"));

// src/use-cases/errors/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid credencial error.");
  }
};

// src/use-cases/authenticate.ts
var import_bcryptjs2 = require("bcryptjs");
var AuthenticateUserCases = class {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const doesPasswordMatches = await (0, import_bcryptjs2.compare)(password, user.password_hash);
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }
    return {
      user
    };
  }
};

// src/use-cases/factories/make-authenticate-user-case.ts
function makeAuthenticateUsercase() {
  const usersRepository = new PrismaUsersRepository();
  const authenticateUseCase = new AuthenticateUserCases(usersRepository);
  return authenticateUseCase;
}

// src/http/controllers/users/authenticate.ts
async function authenticate(request, reply) {
  const registerBodySchema = import_zod3.default.object({
    email: import_zod3.default.string().email(),
    password: import_zod3.default.string().min(6)
  });
  const { email, password } = registerBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUsercase();
    const { user } = await authenticateUseCase.execute({
      email,
      password
    });
    const token = await reply.jwtSign({}, {
      sign: {
        sub: user.id
      }
    });
    return reply.status(200).send({ token });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message });
    }
    throw err;
  }
}

// src/use-cases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource not found.");
  }
};

// src/use-cases/get-user-profile.ts
var GetProfileUseCase = class {
  constructor(usersReposytory) {
    this.usersReposytory = usersReposytory;
  }
  async execute({ userId }) {
    const user = await this.usersReposytory.findById(userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }
    return {
      user
    };
  }
};

// src/use-cases/factories/make-get-user-profile-use-case.ts
function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const useCase = new GetProfileUseCase(usersRepository);
  return useCase;
}

// src/http/controllers/users/profile.ts
async function profile(request, reply) {
  const getUserProfile = makeGetUserProfileUseCase();
  const { user } = await getUserProfile.execute({
    userId: request.user.sub
  });
  reply.status(200).send({
    user: {
      ...user,
      password_hash: void 0
    }
  });
}

// src/http/middlewares/verify-jwt.ts
async function verifyJWT(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

// src/http/controllers/users/refresh.ts
async function refresh(request, reply) {
  await request.jwtVerify({ onlyCookie: true });
  const token = await reply.jwtSign({}, {
    sign: {
      sub: request.user.sub
    }
  });
  const refreshToken = await reply.jwtSign({}, {
    sign: {
      sub: request.user.sub,
      expiresIn: "7d"
    }
  });
  return reply.setCookie("refreshToken", refreshToken, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: true
  }).status(200).send({ token });
}

// src/http/controllers/users/routes.ts
async function userRoutes(app2) {
  app2.post("/users", register);
  app2.post("/session", authenticate);
  app2.patch("/token/refresh", refresh);
  app2.get("/me", { onRequest: [verifyJWT] }, profile);
}

// src/app.ts
var import_zod10 = require("zod");
var import_jwt = __toESM(require("@fastify/jwt"));
var import_cookie = __toESM(require("@fastify/cookie"));

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
var import_zod4 = __toESM(require("zod"));
async function create(request, reply) {
  const createGymBodySchema = import_zod4.default.object({
    title: import_zod4.default.string(),
    description: import_zod4.default.string().nullable(),
    phone: import_zod4.default.string().nullable(),
    latitude: import_zod4.default.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod4.default.number().refine((value) => {
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
var import_zod5 = __toESM(require("zod"));
async function search(request, reply) {
  const searchGymsQuerySchema = import_zod5.default.object({
    q: import_zod5.default.string(),
    page: import_zod5.default.coerce.number().min(1).default(1)
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
var import_zod6 = __toESM(require("zod"));
async function nearby(request, reply) {
  const nearbyGymsBodySchema = import_zod6.default.object({
    latitude: import_zod6.default.coerce.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod6.default.coerce.number().refine((value) => {
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
function gymsRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.get("/gyms/search", search);
  app2.get("/gyms/nearby", nearby);
  app2.post("/gyms", create);
}

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
var import_zod7 = __toESM(require("zod"));
async function create2(request, reply) {
  const createCheckInsParmsSchema = import_zod7.default.object({
    gymId: import_zod7.default.string().uuid()
  });
  const createCheckInsBodySchema = import_zod7.default.object({
    latitude: import_zod7.default.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    longitude: import_zod7.default.number().refine((value) => {
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
var import_zod8 = __toESM(require("zod"));
async function history(request, reply) {
  const searchGymsQuerySchema = import_zod8.default.object({
    page: import_zod8.default.coerce.number().min(1).default(1)
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
var import_zod9 = __toESM(require("zod"));
async function validate(request, reply) {
  const validateCheckInsParmsSchema = import_zod9.default.object({
    checkInId: import_zod9.default.string().uuid()
  });
  const { checkInId } = validateCheckInsParmsSchema.parse(request.params);
  const validateCheckInUseCase = makeValidateCheckInUseCase();
  await validateCheckInUseCase.execute({
    checkInId
  });
  return reply.status(204).send();
}

// src/http/controllers/check-ins/routes.ts
function chekInRoutes(app2) {
  app2.addHook("onRequest", verifyJWT);
  app2.post("/gyms/:gymId/check-ins", create2);
  app2.post("/gyms/:checkInId/validete", validate);
  app2.get("/check-ins/history", history);
  app2.get("/check-ins/metrics", metrics);
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_jwt.default, {
  secret: env.JWT_SERCRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false
  },
  sign: {
    expiresIn: "10m"
  }
});
app.register(import_cookie.default);
app.register(userRoutes);
app.register(gymsRoutes);
app.register(chekInRoutes);
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof import_zod10.ZodError) {
    return reply.status(400).send({ message: "Validation error.", issues: error.format() });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
  }
  return reply.status(500).send({ message: "Internal server error" });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
