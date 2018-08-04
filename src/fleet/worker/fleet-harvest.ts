import { FleetWorker, FleetWorkerType } from "./fleet-worker";
import { WorkerTask } from "task/worker-task";

export class FleetHarvest extends FleetWorker {
    canCarry: boolean;

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number, canCarry = true, maxUnitCost = 1000) {
        const parts = canCarry ? [WORK, WORK, CARRY, MOVE] : [WORK, WORK, MOVE, MOVE];
        super(FleetWorkerType.Harvest, spawn, minFleetSize, maxFleetSize, parts, maxUnitCost);
        this.canCarry = canCarry;
    }

    mainFunction(creep: Creep) {
        const canCarry = creep.body.some(part => part.type === CARRY);
        
        if(!(creep.memory as any).isDumping) {
            let assignedSource: string = canCarry ? "" : (creep.memory as any).source;
            if(!canCarry && !assignedSource) {
                assignedSource = this.getSourceWithoutHarvester(creep);
                (creep.memory as any).source = assignedSource;
            }

            const harvestResult = WorkerTask.harvest(creep, assignedSource);
            if(harvestResult === OK) {
                return;
            }

            if(harvestResult === ERR_FULL && canCarry) {
                (creep.memory as any).isDumping = true;
            }

            if(assignedSource && harvestResult === ERR_NOT_FOUND) {
                (creep.memory as any).source = "";
            }       
        } else if(canCarry) {
            WorkerTask.repairRoad(creep);
            const dumpResult = WorkerTask.dumpEnergy(creep);
            if(dumpResult === OK) {
                // WorkerTask.buildRoadSite(creep);
                return;
            }
            
            if(dumpResult === ERR_NOT_ENOUGH_ENERGY) {
                (creep.memory as any).isDumping = false;
                return;
            }
            // // As fallback, help with building!
            // const buildResult = WorkerTask.build(creep);
            // if(buildResult !== OK) {

            // }
        }

    }

    private getSourceWithoutHarvester(creep: Creep) {
        const sources = creep.room.find(FIND_SOURCES);
        if(!sources || sources.length === 0) {
            return "";
        }

        const sourcesInUse = creep.room.find(FIND_CREEPS).reduce((sourceIds, creepInRoom) => { 
            if(!creepInRoom.my) {
                return sourceIds;
            }
            const sourceAttached = (creepInRoom.memory as any).source;
            if(sourceAttached) {
                sourceIds.push(sourceAttached);
            }
            return sourceIds;
        }, [] as string[]);

        if(!sourcesInUse || sourcesInUse.length === 0) {
            // No sources in use yet, so use the first.
            return sources[0].id;
        }

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            if(sourcesInUse.indexOf(source.id) < 0 ) {
                return source.id;
            }
        }

        // No unused source found
        return "";

    }
}

