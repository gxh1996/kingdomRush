/**
 * 一个储存关卡信息的静态类,用它来获取关卡信息
 */
export default class LevelDataManager {
    private static levelDatas: Level[] = [];

    /**
     * 游戏开始时必须执行
     */
    static initLevelData(jsonObjs: any) {
        let o: any;
        for (o of jsonObjs) {
            let l: Level = this.initLevel(o);
            this.levelDatas.push(l);
        }

        console.log("关卡信息:", this.levelDatas);
    }

    private static initLevel(jsonObj: any): Level {
        let level: Level = new Level();
        level.roadNum = jsonObj.roadNum;
        level.posOfBuilders = jsonObj.posOfBuilders;
        level.noOfRound = jsonObj.noOfRound;
        level.timeOfRound = jsonObj.timeOfRound;
        level.stationOfSoldier = jsonObj.stationOfSoldier;

        return level;
    }

    static getLevelData(level: number): Level {
        return this.levelDatas[level - 1];
    }
}

export class Level {
    roadNum: number;
    /**
     * 建筑点的坐标 buildMap坐标
     */
    posOfBuilders: cc.Vec2[];
    /**
     * 每波怪物的编号
     */
    noOfRound: number[][];
    /**
     * 每波的时间
     */
    timeOfRound: number[];
    /**
     * 建筑点旁的驻点 世界坐标 [builder号][3个士兵点]
     */
    stationOfSoldier: cc.Vec2[][];
}