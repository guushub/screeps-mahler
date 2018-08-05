import { FleetCourier, FleetCourierType } from "./fleet-courier";
import { WorkerTask } from "task/worker-task";
import { FleetWorkerType } from "../worker/fleet-worker";

export class FleetCourierEnergy extends FleetCourier {

    constructor(spawn: StructureSpawn, minFleetSize: number, maxFleetSize: number) {
        super(FleetCourierType.Energy, spawn, minFleetSize, maxFleetSize);
    }

    mainFunction(creep: Creep) {
        // this.extendRoad(creep);
        WorkerTask.repairRoad(creep);

        const dumpResult = WorkerTask.dumpEnergy(creep);
        if(dumpResult === OK) {
            return;
        }

        // Bring energy to a construction site
        const builders = creep.room.find(FIND_MY_CREEPS, {filter: (creep) => (creep.memory as any).fleetName === FleetWorkerType.Build});
        if(builders && builders.length > 0) {
            for (let i = 0; i < builders.length; i++) {
                const builder = builders[i];
                const assignment: ConstructionSite = (builder.memory as any).assignment;
                if(assignment) {
                    const assignmentPosition = new RoomPosition(assignment.pos.x, assignment.pos.y, assignment.pos.roomName);
                    const energyAtAssignment = assignmentPosition.lookFor(RESOURCE_ENERGY);
                    const droppedEnergy = energyAtAssignment.length > 0 ? energyAtAssignment[0].amount : 0;
                    if(assignment.progressTotal - assignment.progress - droppedEnergy > 0) {
                        (creep.memory as any).assignment = assignment;
                        const dropResult = WorkerTask.dropResource(creep, assignmentPosition, RESOURCE_ENERGY, true);
                        (creep.memory as any).dropResult = dropResult;
                        if(dropResult === OK) {
                            return;
                        }
                    }
                }
            }
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
        const sources = creep.room.find(FIND_SOURCES);
        const resources = sources.reduce((resourcesNearSource, source) => {
            const areaAroundSource = creep.room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
            const posWithResources = areaAroundSource.filter(pos => pos.resource);
            posWithResources.forEach(pos => {
                if(pos.resource) {
                    resourcesNearSource.push(pos.resource);
                }
            });
                            
            return resourcesNearSource;
        }, [] as Resource[]);

        // const resources = creep.room.find(FIND_DROPPED_RESOURCES);
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