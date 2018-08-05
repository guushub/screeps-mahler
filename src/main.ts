import { ErrorMapper } from "utils/ErrorMapper";
import { FleetManager, BuildPriority } from "fleet/fleet-manager";
import { FleetHarvest } from "fleet/worker/fleet-harvest"
import { FleetUpgrade } from "fleet/worker/fleet-upgrade";
import { FleetBuild } from "fleet/worker/fleet-build";
import { FleetCourierEnergy } from "fleet/courier/fleet-courier-energy";

import { constructExtensions } from "construction/construct-extension";
import { constructRoadNetworkIntraRoom } from "construction/construct-road-network";

import { Find } from "./utils/FindUtils";

const spawnMain = Game.spawns["Spawn1"];
const fleetManager = new FleetManager(spawnMain);

// Harvesters
//TODO: As long as there are no couriers, harvest should carry.
//TODO: nHarversters = nSources.
const nHarvesters = spawnMain.room.find(FIND_SOURCES).length;
//fallback for when all creeps suddenly dissappear (usually because of a mistake).
// const nCreepsInGame = Object.keys(Game.creeps).length;
// const canCarry = nCreepsInGame ? false : true;
// const maxHarvesterCost = nCreepsInGame ? 1000 : 300;

const harvestFleet = new FleetHarvest(spawnMain, nHarvesters, nHarvesters);//, canCarry, maxHarvesterCost);
fleetManager.addFleet({
  fleet: harvestFleet,
  buildPriority: BuildPriority.VERY_HIGH,
  rclLevel: 0
});

// Couriers
const energyCourierFleet = new FleetCourierEnergy(spawnMain, nHarvesters, nHarvesters);
fleetManager.addFleet({
  fleet: energyCourierFleet,
  buildPriority: BuildPriority.VERY_HIGH,
  rclLevel: 0
});

// Upgraders
const upgradeFleet = new FleetUpgrade(spawnMain, 3, 3);
fleetManager.addFleet({
  fleet: upgradeFleet,
  buildPriority: BuildPriority.NORMAL,
  rclLevel: 0
});

// Builders
if(spawnMain.room.controller && spawnMain.room.controller.level > 1) {
  const builderFleet = new FleetBuild(spawnMain, 2, 2);
  fleetManager.addFleet({
    fleet: builderFleet,
    buildPriority: BuildPriority.NORMAL,
    rclLevel: 0
  });
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  constructRoadNetworkIntraRoom(spawnMain.room);

  const nCreepsInGame = Object.keys(Game.creeps).length;
  if(nCreepsInGame === 0) {
    harvestFleet.changeFleetSize(1);
    harvestFleet.changeMaxUnitCost(300);
    energyCourierFleet.changeFleetSize(1);
    energyCourierFleet.changeMaxUnitCost(300);
  }

  if(energyCourierFleet.fleetSize() > 0 && harvestFleet.fleetSize() > 0) {
    harvestFleet.changeFleetSize(nHarvesters);
    harvestFleet.changeMaxUnitCost(1000);
    energyCourierFleet.changeFleetSize(nHarvesters);
    energyCourierFleet.changeMaxUnitCost(1000);
  }

  if(energyCourierFleet.fleetSize() > 0 && harvestFleet.baseParts.some(part => part === CARRY)) {
    //harvestFleet.canCarry = false;
    //TODO: fleetmanager should do this stuff.
    harvestFleet.baseParts = [MOVE, MOVE, WORK, WORK];
  }


  fleetManager.loop();
  if(spawnMain.room.controller && spawnMain.room.controller.level > 1) {
    constructExtensions(spawnMain);
  }

  Find.emptySpacesInRange(spawnMain.room, spawnMain.pos, 1);
});

