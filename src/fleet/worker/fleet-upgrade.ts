import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { WorkerTask } from "task/worker-task";

export class FleetUpgrade extends FleetWorker {
    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number, maxUnitCost = 1000) {
        super(FleetWorkerType.Upgrade, spawn, minFleetSize, maxFleetSize, [WORK, WORK, CARRY, MOVE], maxUnitCost);
    }

    mainFunction(creep: Creep) {
        WorkerTask.repairRoad(creep);

        const upgradeResult = WorkerTask.upgrade(creep);
        if(upgradeResult === OK) {
            // WorkerTask.buildRoadSite(creep);
            return;
        }

        //TODO: Should check if harvest location is much closer by.
        const pickupResult = WorkerTask.collectDroppedEnergy(creep);
        if(pickupResult === OK) {
            return;
        }

        const harvestResult = WorkerTask.harvest(creep);
        if(harvestResult === OK ) {
            return;
        }
        
        const dumpResult = WorkerTask.dumpEnergy(creep);
        if(dumpResult !== OK) {

        }
    }

}
