/**
 * 一个储存关卡信息的静态类,用它来获取关卡信息
 */
export default class LevelDataManager {
    private static levelDatas: Level[] = [];

    /**
     * 游戏开始时必须执行
     */
    static initLevelData() {
        //level1
        let level1: Level = new Level();
        level1.builders = [cc.v2(-81, -45), cc.v2(-168, 98)];
        //每回合出动哪些怪物
        level1.noOfRound = [[0], [0, 0], [0, 0, 0]];
        level1.timeOfRound = [5, 8, 8];
        level1.stationOfSoldier = [[cc.v2(187, 243), cc.v2(166, 246), cc.v2(144, 231)], [cc.v2(274, 375), cc.v2(308, 380), cc.v2(320, 363)]];

        this.levelDatas.push(level1);
    }

    static getLevelData(level: number): Level {
        return this.levelDatas[level - 1];
    }
}

export class Level {
    /**
     * 建筑点的坐标 buildMap坐标
     */
    builders: cc.Vec2[];
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