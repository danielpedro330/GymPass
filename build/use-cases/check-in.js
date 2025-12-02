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

// src/use-cases/check-in.ts
var check_in_exports = {};
__export(check_in_exports, {
  CheckInUseCases: () => CheckInUseCases
});
module.exports = __toCommonJS(check_in_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CheckInUseCases
});
