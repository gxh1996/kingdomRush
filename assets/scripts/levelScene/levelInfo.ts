

export default class Level {
    //建筑点的坐标
    private builders: cc.Vec2[];
    //每波怪物的编号
    private NoOfRound: number[][];
    //每波的时间
    private timeOfRound: number[];

    static getLevelData(level: number): Level {
        let levelDatas: Level[] = [];

        //level1
        let level1: Level = new Level();
        level1.setBuilders([cc.v2(-81, -45), cc.v2(-168, 98)]);
        //每回合出动哪些怪物
        level1.setNoOfRound([[0, 0], [0], [0, 0, 0, 0]]);
        level1.setTimeOfRound([5, 10, 10]);
        levelDatas.push(level1);


        return levelDatas[level - 1];
    }





    public getBuilders(): cc.Vec2[] {
        return this.builders;
    }

    public setBuilders(builders: cc.Vec2[]): void {
        this.builders = builders;
    }

    public getRound(): number {
        return this.timeOfRound.length;
    }


    public getNoOfRound(): number[][] {
        return this.NoOfRound;
    }

    public setNoOfRound(NoOfRound: number[][]): void {
        this.NoOfRound = NoOfRound;
    }

    public getTimeOfRound(): number[] {
        return this.timeOfRound;
    }

    public setTimeOfRound(timeOfRound: number[]): void {
        this.timeOfRound = timeOfRound;
    }


}