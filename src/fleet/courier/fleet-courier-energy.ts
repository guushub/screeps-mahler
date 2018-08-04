import { FleetCourier, FleetCourierType } from "./fleet-courier";
import { WorkerTask } from "task/worker-task";

export class FleetCourierEnergy extends FleetCourier {

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(FleetCourierType.Energy, spawn, minFleetSize, maxFleetSize);
    }

    mainFunction(creep: Creep) {
        this.extendRoad(creep);
        WorkerTask.repairRoad(creep);

        const dumpResult = WorkerTask.dumpEnergy(creep);
        if(dumpResult === OK) {
            return;
        }

        if(dumpResult === ERR_NOT_FOUND && creep.carry.energy === creep.carryCapacity) {
            WorkerTask.moveToTask(creep, this.spawn);
            return;
        }

        let assignedSource: string = (creep.memory as any).resource;
        if(!assignedSource) {
            const assignedSource = this.getResourceWithoutCourier(creep);
            (creep.memory as any).resource = assignedSource;
        }

        const pickupResult = WorkerTask.collectDroppedEnergy(creep, assignedSource);
        if(pickupResult === OK) {
            return;
        }

        if(assignedSource && pickupResult === ERR_NOT_FOUND) {
            (creep.memory as any).resource = "";
        }     
        


    }

    getResourceWithoutCourier(creep: Creep) {
        const resources = creep.room.find(FIND_DROPPED_RESOURCES);
        if(!resources || resources.length === 0) {
            return "";
        }

        const resourcesInUse = creep.room.find(FIND_CREEPS).reduce((resourceIds, creepInRoom) => { 
            if(!creepInRoom.my) {
                return resourceIds;
            }
            const resourceAttached = (creepInRoom.memory as any).resource;
            if(resourceAttached) {
                resourceIds.push(resourceAttached);
            }
            return resourceIds;
        }, [] as string[]);

        if(!resourcesInUse || resourcesInUse.length === 0) {
            // No sources in use yet, so use the first.
            return resources[0].id;
        }

        for (let i = 0; i < resources.length; i++) {
            const source = resources[i];
            if(resourcesInUse.indexOf(source.id) < 0 ) {
                return source.id;
            }
        }

        // No unused source found
        return "";

    }
    
}