import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { WorkerTask } from "task/worker-task";

export class FleetUpgrade extends FleetWorker {
    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(FleetWorkerType.Upgrade, spawn, minFleetSize, maxFleetSize);
    }

    mainFunction(creep: Creep) {
        WorkerTask.repairRoad(creep);

        const upgradeResult = WorkerTask.upgrade(creep);
        if(upgradeResult === OK) {
            // WorkerTask.buildRoadSite(creep);
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
