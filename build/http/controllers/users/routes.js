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

// src/http/controllers/users/routes.ts
var routes_exports = {};
__export(routes_exports, {
  userRoutes: () => userRoutes
});
module.exports = __toCommonJS(routes_exports);

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
async function userRoutes(app) {
  app.post("/users", register);
  app.post("/session", authenticate);
  app.patch("/token/refresh", refresh);
  app.get("/me", { onRequest: [verifyJWT] }, profile);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userRoutes
});
