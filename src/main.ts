import { ErrorMapper } from "utils/ErrorMapper";
import { FleetManager, BuildPriority } from "fleet/fleet-manager";
import { FleetHarvest } from "fleet/worker/fleet-harvest"
import { FleetUpgrade } from "fleet/worker/fleet-upgrade";
import { FleetBuild } from "fleet/worker/fleet-build";
import { buildExtensionSites } from "construction/construct-extension";

const spawnMain = Game.spawns["Spawn1"];
const fleetManager = new FleetManager(spawnMain);

const harvestFleet = new FleetHarvest(spawnMain, 3, 3);
const upgradeFleet = new FleetUpgrade(spawnMain, 3, 3);

fleetManager.addFleet({
  fleet: harvestFleet,
  buildPriority: BuildPriority.VERY_HIGH,
  rclLevel: 0
});

fleetManager.addFleet({
  fleet: upgradeFleet,
  buildPriority: BuildPriority.NORMAL,
  rclLevel: 0
});

if(spawnMain.room.controller && spawnMain.room.controller.level > 1) {
  const builderFleet = new FleetBuild(spawnMain, 2, 2);
  fleetManager.addFleet({
    fleet: builderFleet,
    buildPriority: BuildPriority.NORMAL,
    rclLevel: 2
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

  fleetManager.loop();
  if(spawnMain.room.controller && spawnMain.room.controller.level > 1) {
    buildExtensionSites(spawnMain);
  }
});

