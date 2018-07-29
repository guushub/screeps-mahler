import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { Find } from "utils/FindUtils";
import { WorkerTask } from "task/worker-task";

export class FleetHarvest extends FleetWorker {
    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(FleetWorkerType.Harvest, spawn, minFleetSize, maxFleetSize);
    }

    mainFunction(creep: Creep) {

        const harvestResult = WorkerTask.harvest(creep);
        if(harvestResult === OK) {
            return;
        }

        const dumpResult = WorkerTask.dumpEnergy(creep);
        if(dumpResult === OK) {
            WorkerTask.buildRoadSite(creep);
            return;
        }

        // As fallback, help with building!
        const buildResult = WorkerTask.build(creep);
        if(buildResult !== OK) {

        }

    }
}

