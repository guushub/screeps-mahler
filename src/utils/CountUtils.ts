import { Find } from "./FindUtils";

export class Count {

    static structuresByType(structureType: StructureConstant, room?: Room) {
        const structures = Find.structuresByType(structureType, room);
        return structures.length;
    }

    static constructionSitesByType(structureType: StructureConstant, room?: Room) {
        const sites = Find.constructionSitesByType(structureType, room);
        return sites.length;
    }

}
