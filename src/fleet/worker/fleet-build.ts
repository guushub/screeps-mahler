import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { Find } from "utils/FindUtils";
import { WorkerTask } from "task/worker-task";

export class FleetBuild extends FleetWorker {

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(FleetWorkerType.Build, spawn, minFleetSize, maxFleetSize);
    }

    mainFunction(creep: Creep) {
        // const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        // const adjacentConstructionSite = this.adjacentConstructionSite(creep);
        const buildResult = WorkerTask.build(creep);
        if(buildResult === OK) {
            return;
        }

        const pickupResult = WorkerTask.collectDroppedEnergy(creep);
        if(pickupResult === OK) {
            return;
        }

        const harvestResult = WorkerTask.harvest(creep);
        if(harvestResult === OK) {
            return;
        }

        const upgradeTask = WorkerTask.upgrade(creep);
        if(upgradeTask === OK) {
            return;
        }

        const dumpResult = WorkerTask.dumpEnergy(creep);
        if(dumpResult !== OK) {

        }
    }
}
