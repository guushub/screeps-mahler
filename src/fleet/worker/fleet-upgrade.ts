import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { WorkerTask } from "task/worker-task";

export class FleetUpgrade extends FleetWorker {
    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number, maxUnitCost = 1000) {
        super(FleetWorkerType.Upgrade, spawn, minFleetSize, maxFleetSize, [WORK, WORK, CARRY, MOVE], maxUnitCost);
    }

    mainFunction(creep: Creep) {
        // this.extendRoad(creep);
        WorkerTask.repairRoad(creep);

        if((creep.memory as any).isUpgrading) {
            const upgradeResult = WorkerTask.upgrade(creep);
            if(upgradeResult === OK) {
                // WorkerTask.buildRoadSite(creep);
                return;
            }

            if(upgradeResult === ERR_NOT_ENOUGH_ENERGY) {
                (creep.memory as any).isUpgrading = false;
                return;
            }

         } else {
            //TODO: Should check which place with resource is much closer by.
            const withdrawResult = WorkerTask.collectStoredEnergy(creep);
            if(withdrawResult === OK) {
                return;
            }

            const pickupResult = WorkerTask.collectDroppedEnergy(creep);
            if(pickupResult === OK) {
                return;
            }

            const harvestResult = WorkerTask.harvest(creep);
            if(harvestResult === OK ) {
                return;
            }

            if(harvestResult === ERR_FULL || pickupResult === ERR_FULL) {
                (creep.memory as any).isUpgrading = true;
                return;
            }
            
            const dumpResult = WorkerTask.dumpEnergy(creep);
            if(dumpResult !== OK) {

            }
        }
    }

}
