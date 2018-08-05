import { Find } from "utils/FindUtils";
import { Count } from "utils/CountUtils";

export const constructContainers = (room: Room) => {
    const controller = room.controller;
    if(!controller) {
        return ERR_NOT_FOUND;
    }

    const spawns = room.find(FIND_MY_SPAWNS);
    if(!spawns) {
        return ERR_NOT_FOUND;
    }

    const nContainers = Count.structuresByType(STRUCTURE_CONTAINER, room);
    const nSites = Count.constructionSitesByType(STRUCTURE_CONTAINER, room);
    (room.memory as any).nContainers = nContainers + nSites;

    if(nContainers + nSites >= spawns.length + 1) {
        return ERR_FULL;
    }

    const emptySpaceController = Find.emptySpacesInRange(room, controller.pos, 1);
    for (let i = 0; i < emptySpaceController.length; i++) {
        const pos = emptySpaceController[i];
        const constructResult = room.createConstructionSite(pos, STRUCTURE_CONTAINER);
        if (constructResult === OK) {
            i = emptySpaceController.length;
        }
    }

    for (let i = 0; i < spawns.length; i++) {
        const spawn = spawns[i];
        const emptySpaceSpawns = Find.emptySpacesInRange(room, spawn.pos, 1);
        for (let j = 0; j < emptySpaceSpawns.length; j++) {
            const pos = emptySpaceSpawns[j];
            const constructResult = room.createConstructionSite(pos, STRUCTURE_CONTAINER);
            if (constructResult === OK) {
                j = emptySpaceSpawns.length;
            }
        }
    }

    return OK;

}