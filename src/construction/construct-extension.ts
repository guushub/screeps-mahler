import { Count } from "utils/CountUtils";

export const constructExtensions = (spawn: StructureSpawn) => {
    const baseCoord = [spawn.pos.x, spawn.pos.y];
    const controller = spawn.room.controller;
    const coords: [number, number][] = [];

    if(!controller || controller.level < 2) {
      return;
    }
    const rcl = controller.level;//controller.level;\
    const factor = rcl > 2 ? 10 : 5;
    let maxExtentions = 5;
    if(rcl > 2) {
      maxExtentions = maxExtentions + 10 * (rcl - 2);
    }

    const nSites = Count.constructionSitesByType(STRUCTURE_EXTENSION, spawn.room);
    const nStructures = Count.structuresByType(STRUCTURE_EXTENSION, spawn.room)
    const nExtensions = nSites + nStructures;
    const sitesToBuild = maxExtentions - nExtensions;

    if(sitesToBuild <= 0) {
      return;
    }

    let newSites = 0;
    for (let x = -2 * (rcl - 1); x <= 2 * (rcl - 1); x = x + 2) {
      for (let y = -2 * (rcl - 1); y <= 2 * (rcl - 1); y = y + 2) {
        const siteResult = spawn.room.createConstructionSite(baseCoord[0] + x, baseCoord[1] + y, STRUCTURE_EXTENSION);
        if(siteResult >= 0) {
          newSites++;
        }
        if(newSites >= sitesToBuild) {
          return;
        }
      }
    }

  }
